# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tutorcito is a Next.js 16 application that generates interactive quizzes from PDFs using AI. Users upload PDFs, and the system generates questions with a Kahoot-style interface. The app uses Clerk for authentication and communicates with a Django backend API.

## Development Commands

```bash
# Development
npm run dev              # Start development server on localhost:3000

# Production
npm run build           # Create production build
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint
npx tsc --noEmit        # Type check without emitting files
```

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Clerk Authentication (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Django API Backend (required)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

The Django backend must be running for full functionality. See SETUP.md and SUPABASE_SETUP.md for detailed setup instructions.

## Architecture

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **State Management**: Zustand (store/quizStore.ts)
- **Authentication**: Clerk
- **UI**: Tailwind CSS v4, ShadCN/UI, Framer Motion
- **Backend**: Django API (separate repository)

### Directory Structure

```
app/
  (auth)/              # Protected routes (dashboard, documentos)
  api/                 # API routes (auth/sync)
  quiz/                # Quiz taking page
  results/             # Results page
  sign-in/, sign-up/   # Auth pages

components/
  auth/                # Authentication components
  documents/           # Document upload/management (legacy)
  question-banks/      # Question bank management (primary)
  quiz/                # Quiz interface components
  shared/              # Shared UI components
  ui/                  # ShadCN/UI components

lib/
  api/                 # API client modules
    django-api.ts      # Main Django API client
    documents-api.ts   # Document operations
  clerk/               # Clerk authentication utilities
  mappers/             # Data transformation between Django/Frontend
  utils/               # Utility functions

types/
  django-api.ts        # Django API response types
  question-bank.ts     # QuestionBank abstraction types
  quiz.ts              # Quiz/Question types (legacy local storage)

store/
  quizStore.ts         # Zustand store for quiz state (legacy)
```

### Data Architecture

The app has two data layers:

1. **Django Backend** (Primary):
   - `DjangoDocument`: Uploaded PDFs stored in Cloudflare R2
   - `DjangoExam`: Generated question sets linked to documents
   - `DjangoQuestion`: Individual questions with difficulty levels
   - API client: `lib/api/django-api.ts`

2. **QuestionBank Abstraction** (Frontend):
   - `QuestionBank`: Frontend abstraction over Django's Document+Exam
   - Mappers in `lib/mappers/` convert between Django and QuestionBank types
   - Used by `components/question-banks/` for UI presentation

3. **Legacy LocalStorage** (Deprecated):
   - `GeneratedQuiz`, `QuizAttempt` types in `types/quiz.ts`
   - `store/quizStore.ts` manages local state
   - Being phased out in favor of Django backend

### Authentication Flow

1. **Clerk Integration**:
   - All routes except `/sign-in` and `/sign-up` are protected (middleware.ts)
   - `ClerkProvider` wraps the app in app/layout.tsx
   - `ApiProvider` configures token getter for Django API calls

2. **Token Management**:
   - `lib/api/django-api.ts` exports `setTokenGetter()` to configure auth
   - `components/providers/ApiProvider.tsx` sets up Clerk token getter on mount
   - All Django API calls automatically include Clerk JWT in Authorization header

3. **Sync Endpoint**:
   - `app/api/auth/sync/route.ts` syncs Clerk user to Django backend
   - Called after successful Clerk authentication

### Question Generation

The system generates quiz questions from PDFs via the Django backend:

1. User uploads PDF → `lib/api/documents-api.ts::uploadDocument()`
2. Backend creates DjangoDocument and DjangoExam
3. AI generates questions (OpenRouter API, stored in Django)
4. Frontend fetches questions via `django-api.ts`

### Component Organization

**Question Banks** (Primary UI):

- `CreateBankForm.tsx`: Upload PDF and configure question generation
- `BankCard.tsx`: Display question bank with metadata
- `QuestionList.tsx`: List all questions in a bank
- `AddQuestionsDialog.tsx`: Add more questions to existing bank
- `RegenerateQuestionsDialog.tsx`: Regenerate questions for a bank

**Quiz Interface**:

- `components/quiz/`: Quiz-taking components (Kahoot-style buttons)
- `app/quiz/page.tsx`: Main quiz page
- `app/results/page.tsx`: Results display with score breakdown

### Type Mapping

Django uses Spanish difficulty levels, frontend uses English:

- Django: `'facil' | 'medio' | 'dificil'`
- Frontend: `'easy' | 'medium' | 'hard'`

Mappers in `lib/mappers/` handle these conversions automatically.

### Common Development Patterns

**API Calls from Server Components**:

```typescript
import { auth } from '@clerk/nextjs/server';
import { getDocuments } from '@/lib/api/django-api';

const { getToken } = await auth();
const token = await getToken();
const documents = await getDocuments(token);
```

**API Calls from Client Components**:

```typescript
'use client';
import { getDocuments } from '@/lib/api/django-api';

// Token getter is configured via ApiProvider
const documents = await getDocuments(); // Token added automatically
```

**Creating a QuestionBank**:

```typescript
import { createQuestionBank } from '@/lib/api/documents-api';

const bank = await createQuestionBank({
  name: "My Quiz",
  pdf: file,
  config: { totalQuestions: 30, page_start: 1, page_end: 10 }
});
```

## Important Files

- `middleware.ts`: Route protection with Clerk
- `lib/api/django-api.ts`: Main API client with auth token management
- `lib/mappers/`: Data transformation between Django and frontend types
- `components/providers/ApiProvider.tsx`: Sets up API authentication
- `types/django-api.ts`: Source of truth for Django API types
- `types/question-bank.ts`: Frontend abstraction types

## Testing Considerations

When testing question generation:

- PDFs <1MB with <30 questions: Optimal performance
- PDFs 1-2MB with 30-60 questions: May show warnings but should succeed
- PDFs >2MB with >60 questions: High risk of token limit issues
- Use smaller page ranges for large PDFs to reduce load

## Important Rules

Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
