.
├── AGENTS.md
├── app
│   ├── (auth)
│   │   ├── dashboard
│   │   │   └── page.tsx
│   │   ├── documentos
│   │   │   ├── [id]
│   │   │   │   └── page.tsx
│   │   │   ├── new
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── historial
│   │   │   ├── [id]
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api
│   │   ├── auth
│   │   │   ├── callback
│   │   │   └── sync
│   │   │       └── route.ts
│   │   └── sentry-example-api
│   │       └── route.ts
│   ├── favicon.ico
│   ├── global-error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── login
│   ├── page.tsx
│   ├── quiz
│   │   └── page.tsx
│   ├── results
│   │   └── page.tsx
│   ├── sentry-example-page
│   │   └── page.tsx
│   ├── sign-in
│   │   └── [[...sign-in]]
│   │       └── page.tsx
│   └── sign-up
│       └── [[...sign-up]]
│           └── page.tsx
├── CLAUDE.md
├── components
│   ├── auth
│   │   └── UserMenu.tsx
│   ├── dashboard
│   │   ├── CreateExamDialog.tsx
│   │   └── DashboardContent.tsx
│   ├── documents
│   │   ├── CreateExamDialog.tsx
│   │   ├── DocumentCard.tsx
│   │   ├── DocumentDetailHeader.tsx
│   │   ├── DocumentUploader.tsx
│   │   └── ExamCard.tsx
│   ├── layout
│   │   ├── LandingNavbar.tsx
│   │   ├── Logo.tsx
│   │   ├── MobileMenu.tsx
│   │   ├── MobileMenuItem.tsx
│   │   └── Navbar.tsx
│   ├── providers
│   │   └── ApiProvider.tsx
│   ├── question-banks
│   │   ├── AddQuestionsDialog.tsx
│   │   ├── BankCard.tsx
│   │   ├── CreateBankForm.tsx
│   │   ├── DeleteQuestionsDialog.tsx
│   │   ├── EditBankDialog.tsx
│   │   ├── QuestionItem.tsx
│   │   ├── QuestionList.tsx
│   │   └── RegenerateQuestionsDialog.tsx
│   ├── quiz
│   │   ├── AnswerButton.tsx
│   │   ├── DifficultyBadge.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── QuestionProgressDots.tsx
│   │   └── QuizResults.tsx
│   ├── shared
│   │   ├── CustomPromptInput.tsx
│   │   ├── PDFUploader.tsx
│   │   └── QuestionConfig.tsx
│   └── ui
│       ├── badge.tsx
│       ├── button-3d.tsx
│       ├── button.tsx
│       ├── card-3d.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── slider.tsx
│       └── sonner.tsx
├── components.json
├── eslint.config.mjs
├── GEMINI.md
├── instrumentation-client.ts
├── instrumentation.ts
├── lib
│   ├── api
│   │   ├── django-api.ts
│   │   └── documents-api.ts
│   ├── clerk
│   │   └── get-token.ts
│   ├── hooks
│   │   └── useMediaQuery.ts
│   ├── mappers
│   │   └── question-bank-mapper.ts
│   ├── utils
│   │   ├── decode-jwt.ts
│   │   ├── difficulty-mapper.ts
│   │   └── transform-api-data.ts
│   └── utils.ts
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── opencode.json
├── opencode.jsonc
├── package-lock.json
├── package.json
├── plans
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── sounds
│   ├── vercel.svg
│   └── window.svg
├── README.md
├── reconocimiento-y-estrategia-seo-template-worksheet_3efc594e-9e75-49e4-9cd4-809da354d89b.xlsx
├── REFACTOR_PLAN.md
├── sentry.edge.config.ts
├── sentry.server.config.ts
├── skill-creator.zip
├── src
│   ├── entities
│   │   └── index.ts
│   ├── features
│   │   └── index.ts
│   ├── shared
│   │   ├── api
│   │   │   └── index.ts
│   │   ├── config
│   │   ├── index.ts
│   │   ├── lib
│   │   │   └── index.ts
│   │   └── ui
│   │       └── index.ts
│   └── widgets
│       └── index.ts
├── store
│   └── quizStore.ts
├── tree.md
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── types
│   ├── django-api.ts
│   ├── question-bank.ts
│   └── quiz.ts
└── utils
    ├── document-status.ts
    ├── random.ts
    ├── scoring.ts
    ├── sounds.ts
    └── storage.ts

53 directories, 114 files
