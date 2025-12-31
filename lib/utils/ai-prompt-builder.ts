export interface PromptConfig {
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  customPrompt?: string;
}

export function buildSystemPrompt(config: PromptConfig): string {
  const basePrompt = `Eres un experto en crear preguntas educativas de alta calidad. 
Analiza el documento PDF proporcionado y genera preguntas de opción múltiple que 
evalúen la comprensión del contenido.

REQUISITOS ESTRICTOS:
1. Genera EXACTAMENTE ${config.totalQuestions} preguntas basadas en el contenido del PDF
2. Distribución exacta: 
   - ${config.easyCount} preguntas FÁCILES (conceptos básicos, definiciones, comprensión directa)
   - ${config.mediumCount} preguntas MEDIAS (aplicación de conceptos, análisis, relaciones)
   - ${config.hardCount} preguntas DIFÍCILES (síntesis, evaluación, casos complejos)
3. Cada pregunta tiene exactamente 4 opciones (A, B, C, D)
4. Solo UNA opción correcta por pregunta
5. Las preguntas deben cubrir diferentes secciones y conceptos del documento
6. Las opciones incorrectas deben ser plausibles pero claramente incorrectas
7. CRÍTICO: Cada opción DEBE tener texto descriptivo, completo y claro (no vacío)
8. Las preguntas deben ser claras, concisas y sin ambigüedades`;

  const customInstructions = config.customPrompt?.trim()
    ? `\n\n⚠️ INSTRUCCIONES ADICIONALES DEL USUARIO (PRIORIDAD MÁXIMA):
"${config.customPrompt}"

IMPORTANTE: Respeta ESTRICTAMENTE estas instrucciones del usuario al generar las preguntas.
- Si especifica secciones/capítulos específicos → SOLO genera preguntas de esos tópicos
- Si excluye algo → NO generes preguntas sobre esos temas
- Si especifica un tipo de pregunta → Enfócate en ese tipo
- Mantén la distribución de dificultad requerida (${config.easyCount}/${config.mediumCount}/${config.hardCount})

Las instrucciones del usuario tienen prioridad sobre cualquier otro criterio.\n`
    : '';

  const formatInstructions = `
FORMATO JSON REQUERIDO (responde SOLO con este JSON, sin texto adicional):
{
  "questions": [
    {
      "question": "Texto de la pregunta clara y concisa",
      "difficulty": "easy" | "medium" | "hard",
      "answers": [
        {"text": "Opción A - texto completo y descriptivo", "isCorrect": false},
        {"text": "Opción B - texto completo y descriptivo", "isCorrect": true},
        {"text": "Opción C - texto completo y descriptivo", "isCorrect": false},
        {"text": "Opción D - texto completo y descriptivo", "isCorrect": false}
      ]
    }
  ]
}`;

  return basePrompt + customInstructions + formatInstructions;
}

export function buildUserMessage(config: PromptConfig): string {
  const baseMessage = `Analiza este documento PDF y genera ${config.totalQuestions} preguntas de opción múltiple.`;

  const customContext = config.customPrompt?.trim()
    ? `\n\nINSTRUCCIONES ESPECÍFICAS DEL USUARIO:
${config.customPrompt}

Las preguntas deben seguir estas instrucciones estrictamente mientras mantienen 
la distribución de dificultad especificada (${config.easyCount} fáciles, ${config.mediumCount} medias, ${config.hardCount} difíciles).`
    : `\n\nLas preguntas deben cubrir diferentes secciones del documento de forma 
educativa y progresiva, con la distribución: ${config.easyCount} fáciles, 
${config.mediumCount} medias, ${config.hardCount} difíciles.`;

  return baseMessage + customContext;
}
