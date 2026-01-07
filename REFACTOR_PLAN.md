# Plan de Refactorización: Mejoras de Mantenibilidad

## Resumen Ejecutivo

Análisis del codebase de Tutorcito identificó **23+ problemas** de mantenibilidad en 3 áreas:
- **Componentes**: Duplicación y violaciones del principio de responsabilidad única
- **API/Data Layer**: Funciones duplicadas, manejo inconsistente de errores
- **Types/Store**: Tipos legacy, duplicación, store con demasiadas responsabilidades

**Métricas de Éxito Esperadas:**
- ~500+ líneas de código duplicado eliminadas
- 3 archivos legacy eliminados
- 4+ componentes simplificados con responsabilidad única
- 3 validadores centralizados reutilizables

---

# FASE 1: LIMPIEZA (Eliminar código muerto)

**Objetivo:** Eliminar archivos legacy y código duplicado obvio.
**Dificultad:** Baja
**Riesgo:** Bajo

## Paso 1.1: Eliminar lib/api/external-api.ts

**Archivo:** `lib/api/external-api.ts`
**Razón:** Solo re-exporta funciones de django-api.ts, marcado como @deprecated.

**Acciones:**
1. Buscar imports de este archivo:
   ```bash
   grep -r "from '@/lib/api/external-api'" --include="*.ts" --include="*.tsx"
   grep -r "from '../api/external-api'" --include="*.ts" --include="*.tsx"
   ```
2. Reemplazar imports encontrados con `'@/lib/api/django-api'`
3. Eliminar el archivo `lib/api/external-api.ts`
4. Verificar que no hay errores de TypeScript: `npx tsc --noEmit`

---

## Paso 1.2: Eliminar types/external-api.ts

**Archivo:** `types/external-api.ts`
**Razón:** Solo re-exporta tipos de django-api.ts, marcado como @deprecated.

**Acciones:**
1. Buscar imports de este archivo:
   ```bash
   grep -r "from '@/types/external-api'" --include="*.ts" --include="*.tsx"
   ```
2. Reemplazar con `'@/types/django-api'`
3. Los tipos tienen aliases: `ExternalDocument = DjangoDocument`, etc.
4. Eliminar el archivo `types/external-api.ts`
5. Verificar: `npx tsc --noEmit`

---

## Paso 1.3: Unificar PDFUploader duplicado

**Archivos afectados:**
- `components/home/PDFUploader.tsx` (160 líneas) - ELIMINAR
- `components/shared/PDFUploader.tsx` (160 líneas) - MANTENER

**Razón:** Ambos componentes son prácticamente idénticos.

**Acciones:**
1. Verificar diferencias entre ambos archivos:
   ```bash
   diff components/home/PDFUploader.tsx components/shared/PDFUploader.tsx
   ```
2. Buscar quién usa el de home/:
   ```bash
   grep -r "from '@/components/home/PDFUploader'" --include="*.tsx"
   grep -r "from '../home/PDFUploader'" --include="*.tsx"
   ```
3. Actualizar imports para usar `'@/components/shared/PDFUploader'`
4. Eliminar `components/home/PDFUploader.tsx`
5. Verificar que la app funciona correctamente

---

## Paso 1.4: Eliminar función duplicada mapDifficulty

**Archivos afectados:**
- `lib/utils/difficulty-mapper.ts` - `toFrontendDifficulty()` (MANTENER)
- `lib/utils/transform-api-data.ts` - `mapDifficulty()` (ELIMINAR)

**Razón:** Ambas funciones hacen exactamente lo mismo.

**Acciones:**
1. En `lib/utils/transform-api-data.ts`:
   - Agregar import: `import { toFrontendDifficulty } from './difficulty-mapper';`
   - Eliminar la función `mapDifficulty()` (líneas 19-30)
   - Reemplazar llamadas a `mapDifficulty()` con `toFrontendDifficulty()`
2. Verificar: `npx tsc --noEmit`

---

## Verificación Final Fase 1

```bash
# Verificar que no hay errores de TypeScript
npx tsc --noEmit

# Verificar que la app compila
npm run build

# Ejecutar en desarrollo para prueba manual
npm run dev
```

**Archivos eliminados en esta fase:**
- `lib/api/external-api.ts`
- `types/external-api.ts`
- `components/home/PDFUploader.tsx`

**Líneas eliminadas:** ~350 líneas

---

# FASE 2: CONSOLIDACIÓN (Unificar duplicados)

**Objetivo:** Consolidar lógica duplicada en módulos centralizados.
**Dificultad:** Media
**Riesgo:** Medio

## Paso 2.1: Crear lib/utils/parse-options.ts

**Razón:** Lógica de parsing de options duplicada en:
- `lib/mappers/question-bank-mapper.ts` (líneas 37-79)
- `lib/utils/transform-api-data.ts` (líneas 41-107)

**Crear archivo:** `lib/utils/parse-options.ts`

```typescript
/**
 * Parsea las opciones de una pregunta de Django a formato estándar.
 * Maneja múltiples formatos: array, objeto con claves, objeto anidado.
 */

export interface ParsedOption {
  text: string;
  isCorrect: boolean;
}

export function parseQuestionOptions(
  options: Record<string, any> | Array<{ text: string; isCorrect: boolean }>
): ParsedOption[] {
  const result: ParsedOption[] = [];

  // Caso 1: Array directo de opciones
  if (Array.isArray(options)) {
    options.forEach((opt) => {
      if (opt && typeof opt === 'object' && 'text' in opt && 'isCorrect' in opt) {
        result.push({
          text: String(opt.text),
          isCorrect: Boolean(opt.isCorrect),
        });
      }
    });
    return result;
  }

  // Caso 2: Objeto
  if (typeof options === 'object' && options !== null) {
    // Caso 2a: Objeto con propiedad 'options' anidada
    const opts = (options as any).options || options;

    if (Array.isArray(opts)) {
      opts.forEach((opt: any) => {
        if (opt && typeof opt === 'object' && 'text' in opt) {
          result.push({
            text: String(opt.text),
            isCorrect: Boolean(opt.isCorrect),
          });
        }
      });
    } else {
      // Caso 2b: Objeto con claves arbitrarias (A, B, C, D o 1, 2, 3, 4)
      Object.entries(opts).forEach(([key, value]) => {
        if (typeof value === 'string') {
          // Formato: { "A": "texto", "B": "texto" }
          // No tenemos info de isCorrect aquí
          result.push({
            text: value,
            isCorrect: false, // Se debe determinar externamente
          });
        } else if (value && typeof value === 'object') {
          // Formato: { "A": { text: "...", isCorrect: true } }
          const opt = value as any;
          result.push({
            text: String(opt.text || ''),
            isCorrect: Boolean(opt.isCorrect),
          });
        }
      });
    }
  }

  return result;
}
```

**Acciones después de crear:**
1. Actualizar `lib/mappers/question-bank-mapper.ts`:
   - Import: `import { parseQuestionOptions } from '@/lib/utils/parse-options';`
   - Reemplazar lógica inline (líneas 44-79) con llamada a `parseQuestionOptions()`
2. Actualizar `lib/utils/transform-api-data.ts`:
   - Import: `import { parseQuestionOptions } from './parse-options';`
   - Eliminar función `parseOptions()` (líneas 41-107)
   - Usar `parseQuestionOptions()` en su lugar
3. Verificar: `npx tsc --noEmit`

---

## Paso 2.2: Unificar CreateExamDialog

**Archivos afectados:**
- `components/dashboard/CreateExamDialog.tsx` (335 líneas)
- `components/documents/CreateExamDialog.tsx` (224 líneas)

**Razón:** Ambos hacen casi lo mismo pero con pequeñas diferencias.

**Estrategia:** Crear versión unificada en `components/shared/CreateExamDialog.tsx`

**Diferencias a considerar:**
1. Dashboard version: Más compleja, transforma datos al store
2. Documents version: Más simple, llama API directamente

**Acciones:**
1. Analizar diferencias exactas entre ambos archivos
2. Crear `components/shared/CreateExamDialog.tsx` con props para configurar comportamiento:
   ```typescript
   interface CreateExamDialogProps {
     documentId?: number;
     documents?: DjangoDocument[]; // Para selector si no hay documentId
     onSuccess: (exam: DjangoExam, questions: DjangoQuestion[]) => void;
     onClose: () => void;
     // ... otros props necesarios
   }
   ```
3. Actualizar imports en páginas que usan estos diálogos
4. Eliminar versiones duplicadas una vez verificado
5. Verificar funcionamiento en ambos contextos

---

## Paso 2.3: Eliminar countByDifficulty duplicado

**Archivos afectados:**
- `lib/utils/difficulty-mapper.ts` - `countByDifficulty()` (líneas 42-61) - MANTENER
- `lib/utils/transform-api-data.ts` - Lógica inline (líneas 139-142) - ELIMINAR

**Acciones:**
1. En `lib/utils/transform-api-data.ts`:
   - Import: `import { countByDifficulty } from './difficulty-mapper';`
   - Reemplazar lógica inline con llamada a la función
2. Verificar: `npx tsc --noEmit`

---

## Verificación Final Fase 2

```bash
npx tsc --noEmit
npm run build
npm run dev
```

**Archivos creados:**
- `lib/utils/parse-options.ts`
- `components/shared/CreateExamDialog.tsx` (unificado)

**Archivos eliminados:**
- `components/dashboard/CreateExamDialog.tsx` (o movido)
- `components/documents/CreateExamDialog.tsx` (o movido)

**Líneas eliminadas:** ~200 líneas de duplicación

---

# FASE 3: EXTRACCIÓN (Mejorar responsabilidad única)

**Objetivo:** Extraer lógica a módulos separados, crear validadores centralizados.
**Dificultad:** Media-Alta
**Riesgo:** Medio

## Paso 3.1: Crear lib/validators/

**Crear estructura:**
```
lib/validators/
  index.ts
  examValidator.ts
  questionBankValidator.ts
  fileValidator.ts
```

### 3.1.1: fileValidator.ts

```typescript
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export function validatePdfFile(
  file: File | null,
  options: FileValidationOptions = {}
): FileValidationResult {
  const { maxSizeMB = 10, allowedTypes = ['application/pdf'] } = options;

  if (!file) {
    return { isValid: false, error: 'No se ha seleccionado ningún archivo' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'El archivo debe ser un PDF' };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `El archivo excede ${maxSizeMB}MB` };
  }

  return { isValid: true };
}
```

### 3.1.2: examValidator.ts

```typescript
export interface ExamConfigValidation {
  pageStart: string;
  pageEnd: string;
  numQuestions: string;
  totalPages?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateExamConfig(config: ExamConfigValidation): ValidationResult {
  const errors: Record<string, string> = {};

  const pageStart = parseInt(config.pageStart, 10);
  const pageEnd = parseInt(config.pageEnd, 10);
  const numQuestions = parseInt(config.numQuestions, 10);

  if (isNaN(pageStart) || pageStart < 1) {
    errors.pageStart = 'La página inicial debe ser mayor a 0';
  }

  if (isNaN(pageEnd) || pageEnd < 1) {
    errors.pageEnd = 'La página final debe ser mayor a 0';
  }

  if (pageStart > pageEnd) {
    errors.pageEnd = 'La página final debe ser mayor o igual a la inicial';
  }

  if (config.totalPages && pageEnd > config.totalPages) {
    errors.pageEnd = `El documento solo tiene ${config.totalPages} páginas`;
  }

  if (isNaN(numQuestions) || numQuestions < 1) {
    errors.numQuestions = 'Debe generar al menos 1 pregunta';
  }

  if (numQuestions > 100) {
    errors.numQuestions = 'Máximo 100 preguntas por generación';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
```

### 3.1.3: questionBankValidator.ts

```typescript
export interface QuestionBankValidation {
  name: string;
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateQuestionBankConfig(config: QuestionBankValidation): ValidationResult {
  const errors: Record<string, string> = {};

  if (!config.name || config.name.trim().length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres';
  }

  if (config.name && config.name.length > 100) {
    errors.name = 'El nombre no puede exceder 100 caracteres';
  }

  const sum = config.easyCount + config.mediumCount + config.hardCount;
  if (sum !== config.totalQuestions) {
    errors.distribution = 'La distribución debe sumar el total de preguntas';
  }

  if (config.totalQuestions < 1) {
    errors.totalQuestions = 'Debe generar al menos 1 pregunta';
  }

  if (config.totalQuestions > 60) {
    errors.totalQuestions = 'Se recomienda máximo 60 preguntas (riesgo de token limit)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
```

### 3.1.4: index.ts

```typescript
export * from './fileValidator';
export * from './examValidator';
export * from './questionBankValidator';
```

**Acciones después de crear:**
1. Actualizar componentes que tienen validación inline:
   - `components/question-banks/CreateBankForm.tsx`
   - `components/dashboard/CreateExamDialog.tsx` (o el unificado)
2. Importar validadores y reemplazar lógica inline

---

## Paso 3.2: Estandarizar manejo de errores en API

**Archivo:** `lib/api/django-api.ts`

**Crear función auxiliar al inicio del archivo:**

```typescript
/**
 * Extrae mensaje de error de una respuesta HTTP.
 * Intenta parsear JSON, fallback a status text.
 */
async function getErrorMessage(response: Response, defaultMsg: string): Promise<string> {
  try {
    const data = await response.json();
    return data.error || data.message || data.detail || defaultMsg;
  } catch {
    return `${defaultMsg} (HTTP ${response.status})`;
  }
}
```

**Actualizar funciones que no lo usan consistentemente:**
- `getDocuments()` - línea 174
- `getExams()` - línea 256
- `getQuestionsByExam()` - línea 354
- Y otras que lanzan errores genéricos

**Ejemplo de cambio:**
```typescript
// Antes
if (!response.ok) {
  throw new Error('Error al obtener documentos');
}

// Después
if (!response.ok) {
  const errorMsg = await getErrorMessage(response, 'Error al obtener documentos');
  throw new Error(errorMsg);
}
```

---

## Paso 3.3: Dividir CreateBankForm

**Archivo actual:** `components/question-banks/CreateBankForm.tsx` (305 líneas)

**Crear estructura:**
```
components/question-banks/
  CreateBankForm.tsx (simplificado, ~150 líneas)
  form/
    BankNameInput.tsx
    BankDescriptionInput.tsx
hooks/
  useQuestionBankForm.ts
```

### 3.3.1: hooks/useQuestionBankForm.ts

```typescript
import { useState, useCallback } from 'react';
import { validateQuestionBankConfig } from '@/lib/validators';

interface UseQuestionBankFormReturn {
  // Estado
  name: string;
  description: string;
  pdfFile: File | null;
  config: QuestionConfig;
  customPrompt: string;
  errors: Record<string, string>;
  isSubmitting: boolean;

  // Setters
  setName: (name: string) => void;
  setDescription: (desc: string) => void;
  setPdfFile: (file: File | null) => void;
  setConfig: (config: QuestionConfig) => void;
  setCustomPrompt: (prompt: string) => void;

  // Validación
  validate: () => boolean;
  clearErrors: () => void;
}

export function useQuestionBankForm(): UseQuestionBankFormReturn {
  // ... implementación
}
```

### 3.3.2: Componentes de input simples

**BankNameInput.tsx:**
```typescript
interface BankNameInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function BankNameInput({ value, onChange, error }: BankNameInputProps) {
  return (
    <div>
      <Label htmlFor="name">Nombre del banco</Label>
      <Input
        id="name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej: Examen Parcial Matemáticas"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

---

## Verificación Final Fase 3

```bash
npx tsc --noEmit
npm run build
npm run dev
```

**Archivos creados:**
- `lib/validators/index.ts`
- `lib/validators/fileValidator.ts`
- `lib/validators/examValidator.ts`
- `lib/validators/questionBankValidator.ts`
- `hooks/useQuestionBankForm.ts`
- `components/question-banks/form/BankNameInput.tsx`
- `components/question-banks/form/BankDescriptionInput.tsx`

**Archivos modificados:**
- `lib/api/django-api.ts`
- `components/question-banks/CreateBankForm.tsx`

---

# FASE 4: REFINAMIENTO (Mejoras de calidad)

**Objetivo:** Mejorar tipos, crear componentes base, extraer hooks.
**Dificultad:** Media
**Riesgo:** Bajo

## Paso 4.1: Separar tipos de dificultad

**Archivo:** `types/django-api.ts`

**Cambio:**
```typescript
// Antes (línea 33)
export type QuestionDifficulty = 'facil' | 'medio' | 'dificil' | 'easy' | 'medium' | 'hard';

// Después
/** Dificultad en formato Django (español) */
export type DjangoDifficulty = 'facil' | 'medio' | 'dificil';

/** Dificultad en formato Frontend (inglés) */
export type FrontendDifficulty = 'easy' | 'medium' | 'hard';

/** Unión de ambos formatos (para transición) */
export type QuestionDifficulty = DjangoDifficulty | FrontendDifficulty;
```

**Actualizar difficulty-mapper.ts:**
```typescript
import type { DjangoDifficulty, FrontendDifficulty } from '@/types/django-api';

export function toFrontendDifficulty(difficulty: DjangoDifficulty | FrontendDifficulty): FrontendDifficulty {
  // ... sin cambios en la lógica
}
```

---

## Paso 4.2: Crear DialogFormBase

**Archivo:** `components/shared/DialogFormBase.tsx`

**Propósito:** Componente base para diálogos con formulario (AddQuestions, Regenerate, Edit, Delete).

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DialogFormBaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  isLoading: boolean;
  onSubmit: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
}

export function DialogFormBase({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  isLoading,
  onSubmit,
  children,
  variant = 'default',
}: DialogFormBaseProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant={variant}
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Actualizar diálogos existentes para usar DialogFormBase:**
- `AddQuestionsDialog.tsx`
- `RegenerateQuestionsDialog.tsx`
- `EditBankDialog.tsx`
- `DeleteQuestionsDialog.tsx`

---

## Paso 4.3: Extraer hook useQuestionDistribution

**Archivo:** `hooks/useQuestionDistribution.ts`

**Razón:** Lógica de distribución de preguntas en QuestionConfig.tsx es compleja.

```typescript
import { useState, useCallback, useEffect } from 'react';

interface UseQuestionDistributionReturn {
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;

  setTotalQuestions: (total: number) => void;
  setEasyCount: (count: number) => void;
  setMediumCount: (count: number) => void;
  setHardCount: (count: number) => void;

  // Auto-rebalanceo cuando cambia un valor
  rebalance: (changed: 'easy' | 'medium' | 'hard') => void;
}

export function useQuestionDistribution(initialTotal: number = 30): UseQuestionDistributionReturn {
  const [totalQuestions, setTotal] = useState(initialTotal);
  const [easyCount, setEasy] = useState(Math.round(initialTotal * 0.3));
  const [mediumCount, setMedium] = useState(Math.round(initialTotal * 0.4));
  const [hardCount, setHard] = useState(Math.round(initialTotal * 0.3));

  // Rebalancear cuando cambia el total
  useEffect(() => {
    setEasy(Math.round(totalQuestions * 0.3));
    setMedium(Math.round(totalQuestions * 0.4));
    setHard(Math.round(totalQuestions * 0.3));
  }, [totalQuestions]);

  const rebalance = useCallback((changed: 'easy' | 'medium' | 'hard') => {
    // Lógica de rebalanceo...
  }, [totalQuestions, easyCount, mediumCount, hardCount]);

  return {
    totalQuestions,
    easyCount,
    mediumCount,
    hardCount,
    setTotalQuestions: setTotal,
    setEasyCount: setEasy,
    setMediumCount: setMedium,
    setHardCount: setHard,
    rebalance,
  };
}
```

---

## Paso 4.4: Simplificar props de BankCard

**Archivo:** `components/question-banks/BankCard.tsx`

**Cambio:**
```typescript
// Antes (13 props)
interface BankCardProps {
  id: string;
  name: string;
  description: string | null;
  pdfName: string;
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  createdAt: Date;
  onDelete?: (id: string) => void;
}

// Después (2 props)
interface BankCardProps {
  bank: QuestionBank;
  onDelete?: (id: string) => void;
}

export function BankCard({ bank, onDelete }: BankCardProps) {
  const { id, name, description, pdfName, totalQuestions, ... } = bank;
  // ... resto del componente
}
```

**Actualizar componentes que usan BankCard** para pasar el objeto completo.

---

## Paso 4.5: Reducir logging en producción

**Archivo:** `lib/api/django-api.ts`

**Crear al inicio:**
```typescript
const isDev = process.env.NODE_ENV === 'development';

function logDebug(message: string, data?: any) {
  if (isDev) {
    console.log(message, data !== undefined ? data : '');
  }
}

function logError(message: string, error?: any) {
  console.error(message, error !== undefined ? error : '');
}
```

**Reemplazar:**
- `console.log(...)` con `logDebug(...)`
- Mantener `console.error(...)` o usar `logError(...)`

---

## Paso 4.6: Documentar tipos legacy

**Archivo:** `types/quiz.ts`

**Agregar al inicio:**
```typescript
/**
 * @deprecated TIPOS LEGACY - LocalStorage Quiz System
 *
 * Este archivo contiene tipos del sistema antiguo que almacena quizzes en localStorage.
 * El nuevo flujo usa Django backend y los tipos en `types/question-bank.ts`.
 *
 * Estos tipos se mantienen para compatibilidad con:
 * - store/quizStore.ts
 * - app/quiz/page.tsx (quiz local)
 * - app/results/page.tsx
 *
 * TODO: Migrar completamente a Django y eliminar este archivo.
 */
```

---

## Verificación Final Fase 4

```bash
npx tsc --noEmit
npm run build
npm run dev
```

**Archivos creados:**
- `components/shared/DialogFormBase.tsx`
- `hooks/useQuestionDistribution.ts`

**Archivos modificados:**
- `types/django-api.ts` (separar tipos dificultad)
- `types/quiz.ts` (documentar como legacy)
- `lib/api/django-api.ts` (logger condicional)
- `components/question-banks/BankCard.tsx` (simplificar props)
- 4 diálogos para usar DialogFormBase

---

# CHECKLIST DE VERIFICACIÓN POR FASE

## Después de cada fase:

- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] `npm run build` completa exitosamente
- [ ] `npm run dev` inicia sin errores
- [ ] Prueba manual de funcionalidades afectadas
- [ ] Commit con mensaje descriptivo

## Pruebas manuales recomendadas:

1. **Fase 1:** Verificar que imports no rotos
2. **Fase 2:** Crear un question bank, crear un exam
3. **Fase 3:** Validación de formularios funciona
4. **Fase 4:** Todos los diálogos funcionan

---

# RESUMEN DE CAMBIOS POR FASE

| Fase | Archivos Eliminados | Archivos Creados | Líneas Eliminadas |
|------|---------------------|------------------|-------------------|
| 1    | 3                   | 0                | ~350              |
| 2    | 2                   | 2                | ~200              |
| 3    | 0                   | 7+               | ~100              |
| 4    | 0                   | 2                | ~50               |
| **Total** | **5**          | **11+**          | **~700**          |

---

# NOTAS FINALES

- Cada fase puede hacerse de forma independiente
- Si una fase falla, revertir y revisar antes de continuar
- Prioriza Fase 1 y 2 que dan mayor beneficio con menor esfuerzo
- Fase 3 y 4 son refinamientos opcionales pero recomendados
- Considera hacer commits al final de cada paso, no solo de cada fase
