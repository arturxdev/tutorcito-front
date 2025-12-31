/**
 * Valida que el custom prompt no contenga instrucciones peligrosas
 * o que puedan confundir al modelo de IA
 */

const DANGEROUS_PATTERNS = [
  /ignore\s+(previous|all|above|earlier)\s+instructions/i,
  /disregard\s+(previous|all|above|earlier)/i,
  /forget\s+(previous|all|above|earlier)/i,
  /system\s+prompt/i,
  /you\s+are\s+now/i,
  /new\s+instructions/i,
  /pretend\s+(you|to)\s+are/i,
  /act\s+as\s+(if|a)/i,
];

const SPAM_PATTERNS = [
  /(.)\1{20,}/, // Caracteres repetidos más de 20 veces
  /(https?:\/\/[^\s]+)/gi, // URLs
];

export interface PromptValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateCustomPrompt(prompt: string): PromptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check si está vacío (OK - es opcional)
  if (!prompt || prompt.trim().length === 0) {
    return { isValid: true, errors: [], warnings: [] };
  }

  // 2. Check longitud mínima útil
  if (prompt.trim().length < 10) {
    warnings.push('El prompt es muy corto. Sé más específico para mejores resultados.');
  }

  // 3. Check longitud máxima
  if (prompt.length > 500) {
    errors.push('El prompt no puede exceder 500 caracteres.');
  }

  // 4. Check patrones peligrosos
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(prompt)) {
      errors.push(
        'El prompt contiene instrucciones que podrían interferir con la generación. ' +
        'Por favor, reformula usando instrucciones directas sobre el contenido del PDF.'
      );
      break; // Solo mostrar error una vez
    }
  }

  // 5. Check spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(prompt)) {
      errors.push('El prompt contiene contenido no permitido (spam, URLs, etc).');
      break;
    }
  }

  // 6. Check caracteres especiales excesivos
  const specialCharsCount = (prompt.match(/[^a-zA-Z0-9\s\-.,;:áéíóúñÁÉÍÓÚÑ¿?¡!]/g) || []).length;
  if (specialCharsCount > prompt.length * 0.3) {
    warnings.push('El prompt contiene muchos caracteres especiales. Asegúrate de que sea claro.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
