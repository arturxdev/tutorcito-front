import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadPDF } from '@/lib/supabase/storage';
import { createQuestionBank, updateQuestionBankCounts, getQuestionBanksByUserId } from '@/lib/db/queries/question-banks';
import { createQuestions, createAnswers } from '@/lib/db/queries/questions';
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
    // Buscar el array de preguntas en el JSON
    const questionsMatch = jsonText.match(/"questions"\s*:\s*\[([\s\S]*)/);
    if (!questionsMatch) {
      console.error('No se encontró el array de preguntas en el JSON');
      return [];
    }
    
    let questionsText = questionsMatch[1];
    
    // Remover texto después del último objeto completo
    // Buscar el último '}' seguido de coma o cierre de array
    const lastCompleteObject = questionsText.lastIndexOf('},');
    if (lastCompleteObject > -1) {
      questionsText = questionsText.substring(0, lastCompleteObject + 1);
    }
    
    // Intentar parsear como array
    const questions = JSON.parse(`[${questionsText}]`);
    
    // Filtrar solo preguntas válidas
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

// Get OpenRouter API key
function getOpenRouterAPIKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }
  return apiKey;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    // 2. Parse form data
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const pdfFile = formData.get('pdf') as File;
    const configStr = formData.get('config') as string;
    const customPrompt = formData.get('customPrompt') as string;
    
    // 3. Validate inputs
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }
    
    if (!pdfFile) {
      return NextResponse.json(
        { success: false, error: 'El archivo PDF es obligatorio' },
        { status: 400 }
      );
    }
    
    if (!pdfFile.type.includes('pdf')) {
      return NextResponse.json(
        { success: false, error: 'El archivo debe ser un PDF' },
        { status: 400 }
      );
    }
    
    if (pdfFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'El PDF no puede superar 10MB' },
        { status: 400 }
      );
    }
    
    if (!configStr) {
      return NextResponse.json(
        { success: false, error: 'La configuración es obligatoria' },
        { status: 400 }
      );
    }
    
    const config = JSON.parse(configStr);
    
    if (config.totalQuestions < 3 || config.totalQuestions > 100) {
      return NextResponse.json(
        { success: false, error: 'El número de preguntas debe estar entre 3 y 100' },
        { status: 400 }
      );
    }
    
    const totalCheck = config.easyCount + config.mediumCount + config.hardCount;
    if (totalCheck !== config.totalQuestions) {
      return NextResponse.json(
        { success: false, error: 'La distribución de dificultad no coincide con el total' },
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
    
    console.log(`Creating question bank for user ${user.id}: ${name}`);
    
    // 4. Generate bank ID and upload PDF to Supabase Storage
    const bankId = crypto.randomUUID();
    console.log(`Uploading PDF to storage...`);
    const { url: pdfUrl } = await uploadPDF(user.id, pdfFile, bankId);
    console.log(`PDF uploaded successfully: ${pdfUrl}`);
    
    // 5. Generate questions with OpenRouter AI
    console.log(`Generating ${config.totalQuestions} questions with AI...`);
    
    // Convert PDF to base64
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64PDF = buffer.toString('base64');
    const pdfDataUrl = `data:application/pdf;base64,${base64PDF}`;
    
    // Build prompts
    const promptConfig = {
      totalQuestions: config.totalQuestions,
      easyCount: config.easyCount,
      mediumCount: config.mediumCount,
      hardCount: config.hardCount,
      customPrompt: customPrompt?.trim() || undefined,
    };
    
    const systemPrompt = buildSystemPrompt(promptConfig);
    const userMessage = buildUserMessage(promptConfig);
    
    // Call OpenRouter API
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
                  filename: pdfFile.name,
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
        max_tokens: 16000,  // Duplicado para PDFs grandes
        response_format: { type: 'json_object' },
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API error:', errorData);
      throw new Error(`Error de la IA: ${response.status} ${response.statusText}`);
    }
    
    const completion = await response.json();
    const responseText = completion.choices[0].message.content;
    
    if (!responseText) {
      throw new Error('Respuesta vacía de la IA');
    }
    
    console.log('AI Response received, parsing...');
    
    // Parse and validate AI response
    let aiQuestions: AIQuestion[];

    try {
      const parsedResponse: AIResponse = JSON.parse(responseText);
      aiQuestions = parsedResponse.questions;
    } catch (parseError) {
      console.error('❌ Error parsing complete JSON, attempting recovery...');
      console.error('Parse error:', parseError);
      console.log('Response text length:', responseText.length);
      
      // Intentar extraer preguntas parciales
      const partialQuestions = extractPartialQuestions(responseText);
      
      console.log(`📊 Recovered ${partialQuestions.length} valid questions from partial JSON`);
      
      if (partialQuestions.length === 0) {
        throw new Error(
          'No se pudo generar ninguna pregunta válida. ' +
          'Intenta con un PDF más pequeño o menos preguntas.'
        );
      }
      
      const minRequired = Math.min(3, config.totalQuestions);
      if (partialQuestions.length < minRequired) {
        throw new Error(
          `Solo se pudieron generar ${partialQuestions.length} preguntas válidas ` +
          `(mínimo ${minRequired}). Intenta con un PDF más pequeño.`
        );
      }
      
      // Usar las preguntas recuperadas
      aiQuestions = partialQuestions;
      
      console.warn(
        `⚠️ Se usarán ${partialQuestions.length} preguntas recuperadas ` +
        `(se solicitaron ${config.totalQuestions} originalmente)`
      );
    }
    
    if (!Array.isArray(aiQuestions)) {
      throw new Error('Formato de respuesta inválido: questions debe ser un array');
    }
    
    if (aiQuestions.length === 0) {
      throw new Error('No se generaron preguntas. Intenta nuevamente.');
    }
    
    // Solo advertir si hay diferencia, no fallar
    if (aiQuestions.length !== config.totalQuestions) {
      console.warn(
        `⚠️ Se generaron ${aiQuestions.length} preguntas ` +
        `(se solicitaron ${config.totalQuestions})`
      );
    }
    
    // Validate each question
    aiQuestions.forEach((q, index) => {
      if (!q.question || !q.difficulty || !Array.isArray(q.answers)) {
        throw new Error(`Pregunta ${index + 1} tiene estructura inválida`);
      }
      
      if (q.answers.length !== 4) {
        throw new Error(`Pregunta ${index + 1} debe tener exactamente 4 respuestas`);
      }
      
      const correctAnswers = q.answers.filter(a => a.isCorrect);
      if (correctAnswers.length !== 1) {
        throw new Error(`Pregunta ${index + 1} debe tener exactamente 1 respuesta correcta`);
      }
      
      q.answers.forEach((a, answerIndex) => {
        if (!a.text || typeof a.text !== 'string' || a.text.trim() === '') {
          throw new Error(`Pregunta ${index + 1}, respuesta ${answerIndex + 1} está vacía`);
        }
      });
    });
    
    console.log(`Validated ${aiQuestions.length} questions, saving to database...`);
    
    // 6. Save to database in transaction
    // Create question bank
    const bank = await createQuestionBank({
      id: bankId,
      userId: user.id,
      name: name.trim(),
      description: description?.trim() || null,
      pdfName: pdfFile.name,
      pdfUrl,
      customPrompt: customPrompt?.trim() || null,
      totalQuestions: 0, // Will be updated after inserting questions
      easyCount: 0,
      mediumCount: 0,
      hardCount: 0,
    });
    
    console.log(`Question bank created: ${bank.id}`);
    
    // Prepare questions data
    const questionsData = aiQuestions.map(q => ({
      bankId: bank.id,
      questionText: q.question,
      difficulty: q.difficulty,
    }));
    
    // Insert questions
    const insertedQuestions = await createQuestions(questionsData);
    console.log(`Inserted ${insertedQuestions.length} questions`);
    
    // Prepare answers data
    const answersData: Array<{
      questionId: string;
      text: string;
      isCorrect: boolean;
      displayOrder: number;
    }> = [];
    
    aiQuestions.forEach((q, qIndex) => {
      const questionId = insertedQuestions[qIndex].id;
      q.answers.forEach((a, aIndex) => {
        answersData.push({
          questionId,
          text: a.text.trim(),
          isCorrect: a.isCorrect,
          displayOrder: aIndex,
        });
      });
    });
    
    // Insert answers
    await createAnswers(answersData);
    console.log(`Inserted ${answersData.length} answers`);
    
    // Update question counts
    await updateQuestionBankCounts(bank.id);
    console.log('Updated question bank counts');
    
    // Count questions by difficulty
    const easyCount = aiQuestions.filter(q => q.difficulty === 'easy').length;
    const mediumCount = aiQuestions.filter(q => q.difficulty === 'medium').length;
    const hardCount = aiQuestions.filter(q => q.difficulty === 'hard').length;
    
    console.log(`Question bank created successfully: ${bank.id} with ${aiQuestions.length} questions`);
    
    return NextResponse.json({
      success: true,
      bank: {
        id: bank.id,
        name: bank.name,
        totalQuestions: aiQuestions.length,
      },
      stats: {
        total: aiQuestions.length,
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
      },
    });
  } catch (error) {
    console.error('Error creating question bank:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al crear el banco de preguntas';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    // Get all banks for this user
    const banks = await getQuestionBanksByUserId(user.id);
    
    return NextResponse.json({
      success: true,
      banks,
    });
  } catch (error) {
    console.error('Error fetching question banks:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al obtener los bancos';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
