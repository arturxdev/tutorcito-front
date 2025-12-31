# 🎓 Tutorcito - Quiz Inteligente con IA

Aplicación web interactiva que genera quizzes automáticamente desde PDFs usando inteligencia artificial, con una interfaz divertida estilo Kahoot.

## ✨ Características

- 📄 **Análisis de PDF con IA**: Sube un PDF y Grok generará 60 preguntas automáticamente
- 🎯 **Tres niveles de dificultad**: Fácil, Media y Difícil
- 🎮 **Interfaz estilo Kahoot**: Botones coloridos y animaciones divertidas
- 🔀 **Preguntas aleatorizadas**: Cada intento usa diferentes preguntas
- 📊 **Resultados detallados**: Revisa tus respuestas y aprende de tus errores
- 🎉 **Efectos visuales**: Confetti, animaciones suaves y efectos de sonido
- 💾 **Persistencia local**: Tus quizzes y resultados se guardan en el navegador
- 🌙 **Dark mode**: Soporte para tema oscuro

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Una API key de [OpenRouter](https://openrouter.ai/)

### Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Configura las variables de entorno:
```bash
cp .env.local.example .env.local
```

Edita `.env.local` y agrega tu API key de OpenRouter:
```env
OPENROUTER_API_KEY=tu_api_key_aqui
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 📖 Cómo Usar

1. **Sube un PDF**: Arrastra o selecciona un archivo PDF con el contenido que quieres estudiar
2. **Configura el quiz**: Elige cuántas preguntas quieres responder (de 3 a 60)
3. **Genera el quiz**: La IA analizará el PDF y creará 60 preguntas automáticamente
4. **Responde las preguntas**: Selecciona tus respuestas en la interfaz estilo Kahoot
5. **Revisa tus resultados**: Ve tu puntuación y revisa las respuestas correctas

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4
- **Componentes UI**: ShadCN/UI
- **State Management**: Zustand
- **Animaciones**: Framer Motion
- **IA**: OpenRouter (Grok)
- **Efectos**: React Confetti, Sonidos

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Crea una build de producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

Hecho con ❤️ usando Next.js y IA
