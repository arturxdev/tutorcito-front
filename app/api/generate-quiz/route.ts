import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { Difficulty } from '@/types/quiz';

interface AIAnswer {
  text: string;
  isCorrect: boolean;
}

interface AIQuestion {
  question: string;
  difficulty: Difficulty;
  answers: AIAnswer[];
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

const SYSTEM_PROMPT = `Eres un experto en crear preguntas educativas de alta calidad. Analiza el documento PDF proporcionado y genera preguntas de opción múltiple que evalúen la comprensión del contenido.

REQUISITOS ESTRICTOS:
1. Genera EXACTAMENTE 60 preguntas basadas en el contenido del PDF
2. Distribución: 20 fáciles, 20 medias, 20 difíciles
3. Cada pregunta tiene exactamente 4 opciones
4. Solo UNA opción correcta por pregunta
5. Las preguntas deben cubrir diferentes secciones y conceptos del documento
6. Las opciones incorrectas deben ser plausibles pero claramente incorrectas
7. CRÍTICO: Cada opción DEBE tener texto descriptivo, completo y claro (no vacío)

FORMATO JSON REQUERIDO:
{
  "questions": [
    {
      "question": "Texto de la pregunta clara y concisa",
      "difficulty": "easy" | "medium" | "hard",
      "answers": [
        {"text": "Opción A con texto completo y descriptivo", "isCorrect": false},
        {"text": "Opción B con texto completo y descriptivo", "isCorrect": true},
        {"text": "Opción C con texto completo y descriptivo", "isCorrect": false},
        {"text": "Opción D con texto completo y descriptivo", "isCorrect": false}
      ]
    }
  ]
}

Responde SOLO con el JSON válido, sin texto adicional antes o después.`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert PDF to base64 for OpenRouter
    console.log('Converting PDF to base64...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64PDF = buffer.toString('base64');
    const pdfDataUrl = `data:application/pdf;base64,${base64PDF}`;
    console.log(`PDF converted: ${file.name}, size: ${buffer.length} bytes`);

    // Call OpenRouter API with PDF content using fetch
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
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analiza este documento PDF y genera 60 preguntas de opción múltiple basadas en su contenido. Las preguntas deben cubrir diferentes secciones del documento de forma educativa y progresiva.',
              },
              {
                type: 'file',
                file: {
                  filename: file.name,
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
        max_tokens: 16000,  // Duplicado para PDFs grandes y 60 preguntas
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const completion = await response.json();

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty response from AI');
    }

    // Log raw response for debugging
    console.log('AI Response (first 500 chars):', responseText.substring(0, 500));

    // Parse and validate response
    let questions: AIQuestion[];

    try {
      const parsedResponse = JSON.parse(responseText);
      questions = parsedResponse.questions;
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
      
      if (partialQuestions.length < 20) {
        throw new Error(
          `Solo se pudieron generar ${partialQuestions.length} preguntas válidas (mínimo 20). ` +
          'Intenta con un PDF más pequeño o reduce el número de preguntas.'
        );
      }
      
      // Usar las preguntas recuperadas
      questions = partialQuestions;
      
      console.warn(
        `⚠️ Se usarán ${partialQuestions.length} preguntas recuperadas ` +
        `(se solicitaron 60 originalmente)`
      );
    }

    // Log parsed structure
    console.log('Parsed questions count:', questions?.length);
    if (questions && questions.length > 0) {
      console.log('First question sample:', JSON.stringify(questions[0], null, 2));
    }

    if (!Array.isArray(questions)) {
      throw new Error('Formato de respuesta inválido: questions debe ser un array');
    }

    if (questions.length === 0) {
      throw new Error('No se generaron preguntas. Intenta nuevamente.');
    }

    // Ajustar expectativa si se recuperaron menos preguntas
    const expectedCount = 60;
    if (questions.length < expectedCount) {
      console.warn(
        `⚠️ Se generaron ${questions.length} preguntas ` +
        `(se esperaban ${expectedCount})`
      );
    }

    // Validate and add IDs to questions
    const validatedQuestions = questions.map((q: AIQuestion, index: number) => {
      // Validate structure
      if (!q.question || !q.difficulty || !Array.isArray(q.answers)) {
        throw new Error(`Invalid question structure at index ${index}`);
      }

      if (q.answers.length !== 4) {
        throw new Error(`Question ${index} must have exactly 4 answers`);
      }

      const correctAnswers = q.answers.filter((a) => a.isCorrect);
      if (correctAnswers.length !== 1) {
        throw new Error(`Question ${index} must have exactly 1 correct answer`);
      }

      // Validate that all answers have text
      q.answers.forEach((a, answerIndex) => {
        if (!a.text || typeof a.text !== 'string' || a.text.trim() === '') {
          console.error(`Invalid answer at question ${index}, answer ${answerIndex}:`, a);
          throw new Error(`Question ${index}, answer ${answerIndex} has missing or empty text field`);
        }
      });

      // Add IDs
      const questionId = nanoid();
      const answersWithIds = q.answers.map((a) => ({
        id: nanoid(),
        text: a.text.trim(),
        isCorrect: a.isCorrect,
      }));

      const correctAnswer = answersWithIds.find((a) => a.isCorrect);
      if (!correctAnswer) {
        throw new Error(`Question ${index} missing correct answer after processing`);
      }

      return {
        id: questionId,
        question: q.question,
        difficulty: q.difficulty,
        answers: answersWithIds,
        correctAnswerId: correctAnswer.id,
      };
    });

    // Validate counts by difficulty
    const easyCount = validatedQuestions.filter((q) => q.difficulty === 'easy').length;
    const mediumCount = validatedQuestions.filter((q) => q.difficulty === 'medium').length;
    const hardCount = validatedQuestions.filter((q) => q.difficulty === 'hard').length;

    if (validatedQuestions.length !== 60) {
      console.warn(`Warning: Expected 60 questions, got ${validatedQuestions.length}`);
    }

    // Create quiz object
    const quiz = {
      id: nanoid(),
      pdfName: file.name,
      questions: validatedQuestions,
      createdAt: new Date().toISOString(),
      config: {
        totalQuestions: 60,
        easyCount: 20,
        mediumCount: 20,
        hardCount: 20,
      },
    };

    return NextResponse.json({
      success: true,
      quiz,
      stats: {
        total: validatedQuestions.length,
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
      },
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate quiz. Please try again.';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
