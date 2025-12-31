import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getQuestionBank, updateQuestionBankCounts } from '@/lib/db/queries/question-banks';
import { deleteQuestions, createQuestions, createAnswers } from '@/lib/db/queries/questions';
import { validateCustomPrompt } from '@/lib/utils/prompt-validator';
import { buildSystemPrompt, buildUserMessage } from '@/lib/utils/ai-prompt-builder';

interface AIAnswer {
  text: string;
  isCorrect: boolean;
}

interface AIQuestion {
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answers: AIAnswer[];
}

interface AIResponse {
  questions: AIQuestion[];
}

/**
 * Extrae preguntas válidas de un JSON parcialmente truncado
 */
function extractPartialQuestions(jsonText: string): AIQuestion[] {
  try {
    const questionsMatch = jsonText.match(/"questions"\s*:\s*\[([\s\S]*)/);
    if (!questionsMatch) {
      console.error('No se encontró el array de preguntas en el JSON');
      return [];
    }
    
    let questionsText = questionsMatch[1];
    const lastCompleteObject = questionsText.lastIndexOf('},');
    if (lastCompleteObject > -1) {
      questionsText = questionsText.substring(0, lastCompleteObject + 1);
    }
    
    const questions = JSON.parse(`[${questionsText}]`);
    return questions.filter(isValidQuestion);
  } catch (error) {
    console.error('Error extracting partial questions:', error);
    return [];
  }
}

/**
 * Valida que una pregunta tenga la estructura correcta
 */
function isValidQuestion(q: any): q is AIQuestion {
  return (
    q &&
    typeof q.question === 'string' &&
    q.question.trim() !== '' &&
    typeof q.difficulty === 'string' &&
    ['easy', 'medium', 'hard'].includes(q.difficulty) &&
    Array.isArray(q.answers) &&
    q.answers.length === 4 &&
    q.answers.every((a: any) => 
      a &&
      typeof a.text === 'string' &&
      a.text.trim() !== '' &&
      typeof a.isCorrect === 'boolean'
    ) &&
    q.answers.filter((a: any) => a.isCorrect).length === 1
  );
}

function getOpenRouterAPIKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }
  return apiKey;
}

/**
 * Fetch PDF from URL and convert to base64
 */
async function fetchPDFFromURL(pdfUrl: string): Promise<string> {
  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error(`Error fetching PDF: ${response.status} ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bankId } = await params;
    
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    // 2. Parse request body
    const body = await request.json();
    const { questionIds, maintainDifficulties, customPrompt, easyCount, mediumCount, hardCount } = body;
    
    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Se requiere al menos una pregunta para regenerar' },
        { status: 400 }
      );
    }
    
    // Validate custom prompt if provided
    if (customPrompt?.trim()) {
      const validation = validateCustomPrompt(customPrompt);
      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, error: validation.errors[0] || 'Prompt inválido' },
          { status: 400 }
        );
      }
    }
    
    // 3. Get bank and verify ownership
    const bank = await getQuestionBank(bankId, user.id);
    
    if (!bank) {
      return NextResponse.json(
        { success: false, error: 'Banco no encontrado' },
        { status: 404 }
      );
    }
    
    // 4. Verify PDF URL exists
    if (!bank.pdfUrl) {
      return NextResponse.json(
        { success: false, error: 'El banco no tiene un PDF asociado' },
        { status: 400 }
      );
    }
    
    console.log(`🔄 Regenerating ${questionIds.length} questions for bank ${bankId}...`);
    
    // 5. Fetch and convert PDF to base64
    console.log(`📄 Fetching PDF from storage: ${bank.pdfUrl}`);
    const base64PDF = await fetchPDFFromURL(bank.pdfUrl);
    const pdfDataUrl = `data:application/pdf;base64,${base64PDF}`;
    
    // 6. Determine question distribution
    const totalQuestions = questionIds.length;
    let targetEasyCount: number;
    let targetMediumCount: number;
    let targetHardCount: number;
    
    if (maintainDifficulties && easyCount !== undefined && mediumCount !== undefined && hardCount !== undefined) {
      targetEasyCount = easyCount;
      targetMediumCount = mediumCount;
      targetHardCount = hardCount;
      console.log(`📊 Maintaining difficulty distribution: Easy=${easyCount}, Medium=${mediumCount}, Hard=${hardCount}`);
    } else {
      // Auto distribution: divide equally
      const base = Math.floor(totalQuestions / 3);
      const remainder = totalQuestions % 3;
      targetEasyCount = base + (remainder > 0 ? 1 : 0);
      targetMediumCount = base + (remainder > 1 ? 1 : 0);
      targetHardCount = base;
      console.log(`📊 Auto distribution: Easy=${targetEasyCount}, Medium=${targetMediumCount}, Hard=${targetHardCount}`);
    }
    
    // 7. Build prompts
    const promptConfig = {
      totalQuestions,
      easyCount: targetEasyCount,
      mediumCount: targetMediumCount,
      hardCount: targetHardCount,
      customPrompt: customPrompt?.trim() || bank.customPrompt || undefined,
    };
    
    const systemPrompt = buildSystemPrompt(promptConfig);
    const userMessage = buildUserMessage(promptConfig);
    
    // 8. Call OpenRouter API
    console.log(`🤖 Calling OpenRouter API...`);
    const apiKey = getOpenRouterAPIKey();
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Tutorcito Quiz App',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userMessage,
              },
              {
                type: 'file',
                file: {
                  filename: bank.pdfName,
                  file_data: pdfDataUrl,
                },
              },
            ],
          },
        ],
        plugins: [
          {
            id: 'file-parser',
            pdf: {
              engine: 'pdf-text',
            },
          },
        ],
        temperature: 0.7,
        max_tokens: 16000,
        response_format: { type: 'json_object' },
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ OpenRouter API error:', errorData);
      throw new Error(`Error de la IA: ${response.status} ${response.statusText}`);
    }
    
    const completion = await response.json();
    const responseText = completion.choices[0].message.content;
    
    if (!responseText) {
      throw new Error('Respuesta vacía de la IA');
    }
    
    console.log('✅ AI Response received, parsing...');
    
    // 9. Parse and validate AI response
    let aiQuestions: AIQuestion[];

    try {
      const parsedResponse: AIResponse = JSON.parse(responseText);
      aiQuestions = parsedResponse.questions;
    } catch (parseError) {
      console.error('❌ Error parsing complete JSON, attempting recovery...');
      console.error('Parse error:', parseError);
      console.log('Response text length:', responseText.length);
      
      const partialQuestions = extractPartialQuestions(responseText);
      console.log(`📊 Recovered ${partialQuestions.length} valid questions from partial JSON`);
      
      if (partialQuestions.length === 0) {
        throw new Error(
          'No se pudo generar ninguna pregunta válida. ' +
          'Intenta con menos preguntas o contacta soporte.'
        );
      }
      
      const minRequired = Math.min(3, totalQuestions);
      if (partialQuestions.length < minRequired) {
        throw new Error(
          `Solo se pudieron generar ${partialQuestions.length} preguntas válidas ` +
          `(mínimo ${minRequired}). Intenta con menos preguntas.`
        );
      }
      
      aiQuestions = partialQuestions;
      
      console.warn(
        `⚠️ Se usarán ${partialQuestions.length} preguntas recuperadas ` +
        `(se solicitaron ${totalQuestions} originalmente)`
      );
    }
    
    if (!Array.isArray(aiQuestions) || aiQuestions.length === 0) {
      throw new Error('La IA no generó preguntas válidas');
    }
    
    // Filter only valid questions
    const validQuestions = aiQuestions.filter(isValidQuestion);
    console.log(`✅ Validated ${validQuestions.length} of ${aiQuestions.length} questions`);
    
    if (validQuestions.length === 0) {
      throw new Error('No se generaron preguntas válidas');
    }
    
    // 10. Delete old questions and insert new ones in a transaction-like manner
    console.log(`🗑️ Deleting ${questionIds.length} old questions...`);
    await deleteQuestions(questionIds);
    
    console.log(`💾 Inserting ${validQuestions.length} new questions...`);
    
    // Insert new questions
    const questionData = validQuestions.map((q) => ({
      id: crypto.randomUUID(),
      bankId,
      questionText: q.question,
      difficulty: q.difficulty,
      createdAt: new Date(),
    }));
    
    const createdQuestions = await createQuestions(questionData);
    
    // Insert answers for each question
    const answersData = createdQuestions.flatMap((question, qIndex) => {
      const aiQuestion = validQuestions[qIndex];
      return aiQuestion.answers.map((answer, aIndex) => ({
        id: crypto.randomUUID(),
        questionId: question.id,
        text: answer.text,
        isCorrect: answer.isCorrect,
        displayOrder: aIndex,
      }));
    });
    
    await createAnswers(answersData);
    
    // 11. Recalculate bank counts
    console.log(`📊 Recalculating bank counts...`);
    await updateQuestionBankCounts(bankId);
    
    console.log(`✅ Successfully regenerated questions for bank ${bankId}`);
    
    return NextResponse.json({
      success: true,
      message: `${createdQuestions.length} preguntas regeneradas exitosamente`,
      questionsCreated: createdQuestions.length,
    });
    
  } catch (error) {
    console.error('❌ Error regenerating questions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al regenerar preguntas' 
      },
      { status: 500 }
    );
  }
}
