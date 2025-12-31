# 🚀 Instrucciones de Configuración - Tutorcito

## Paso 1: Configurar API Key de OpenRouter

1. Ve a [OpenRouter](https://openrouter.ai/) y crea una cuenta si no tienes una
2. Obtén tu API key desde el dashboard
3. Copia el archivo de ejemplo:
   ```bash
   cp .env.local.example .env.local
   ```
4. Edita `.env.local` y agrega tu API key:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-tu_api_key_aqui
   ```

## Paso 2: Instalar Dependencias

```bash
npm install
```

## Paso 3: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🎮 Cómo Usar la Aplicación

### 1. Página Principal (Home)
- Arrastra o selecciona un archivo PDF
- Usa el slider para configurar cuántas preguntas quieres responder (3-60)
- La distribución de dificultad se calcula automáticamente
- Haz clic en "Generar Quiz"

### 2. Generación del Quiz
- La IA analizará el contenido y generará 60 preguntas
- El proceso puede tardar 30-60 segundos dependiendo del tamaño del PDF
- Las preguntas se guardan automáticamente en localStorage

### 3. Responder el Quiz
- Las preguntas se muestran una por una
- Haz clic en uno de los 4 botones de colores (estilo Kahoot)
- Usa los botones "Anterior" y "Siguiente" para navegar
- Tu progreso se guarda automáticamente
- Puedes salir y volver más tarde

### 4. Ver Resultados
- Al finalizar, verás:
  - Tu puntuación total con animación
  - Confetti si obtienes más de 60%
  - Desglose por dificultad (fácil, media, difícil)
  - Revisión detallada de cada pregunta
- Puedes expandir cada pregunta para ver:
  - Tu respuesta (marcada en rojo si es incorrecta)
  - La respuesta correcta (marcada en verde)

### 5. Nuevo Intento
- Desde la página de resultados, haz clic en "Nuevo Intento"
- El sistema seleccionará diferentes preguntas del pool de 60
- Las opciones de respuesta también se aleatorizan

## 🎨 Características Especiales

### Efectos de Sonido
- **Click**: Al seleccionar una respuesta
- **Next**: Al avanzar de pregunta
- **Complete**: Al finalizar el quiz

### Animaciones
- **Logo**: Animación continua del birrete
- **Botones**: Efecto de escala al hacer hover
- **Progreso**: Barra animada
- **Confetti**: Celebración al finalizar con buen resultado

### Badges de Dificultad
- 🌱 **Fácil** (Verde): Preguntas básicas
- ⚡ **Media** (Amarillo): Nivel intermedio
- 🔥 **Difícil** (Rojo): Desafío avanzado

### Colores de Botones Kahoot
- 🔴 **Rojo** - Opción A
- 🔵 **Azul** - Opción B
- 🟡 **Amarillo** - Opción C
- 🟢 **Verde** - Opción D

## 💾 Datos Guardados (LocalStorage)

La aplicación guarda automáticamente:
- `tutorcito_quizzes`: Todos los quizzes generados
- `tutorcito_attempts`: Historial de intentos completados
- `tutorcito_current_attempt`: Progreso actual (se elimina al finalizar)

Para limpiar todos los datos:
```javascript
// En la consola del navegador
localStorage.clear()
```

## 🐛 Solución de Problemas

### Error: "No hay quiz cargado"
- Asegúrate de haber subido un PDF y generado el quiz primero
- Verifica que JavaScript esté habilitado
- Revisa la consola del navegador para más detalles

### Error: "Failed to generate quiz"
- Verifica que tu API key de OpenRouter sea válida
- Asegúrate de tener créditos en tu cuenta de OpenRouter
- Revisa que el PDF contenga texto legible (no solo imágenes)

### Las animaciones no funcionan bien
- Asegúrate de estar usando un navegador moderno (Chrome, Firefox, Safari, Edge)
- Verifica que las animaciones del sistema estén habilitadas

### Los sonidos no se reproducen
- Los navegadores bloquean autoplay de audio
- Interactúa con la página primero (haz click en cualquier lugar)
- Verifica que el volumen del sistema esté activado

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linter
npm run lint

# Type checking
npx tsc --noEmit
```

## 📝 Notas Importantes

1. **Privacidad**: Todos los datos se guardan localmente en tu navegador. No se envía información a ningún servidor externo excepto a OpenRouter para generar las preguntas.

2. **Límites de API**: OpenRouter tiene rate limits. Si generas muchos quizzes seguidos, podrías alcanzar el límite.

3. **Tamaño de PDF**: PDFs muy grandes (>10MB) pueden fallar. El contenido se trunca a 15,000 caracteres.

4. **Compatibilidad**: La aplicación funciona mejor en navegadores modernos con JavaScript habilitado.

5. **Responsive**: La interfaz se adapta a móviles, tablets y escritorio.

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Agrega la variable de entorno `OPENROUTER_API_KEY`
3. Deploy automático

### Otras Plataformas

- **Netlify**: Soporta Next.js con configuración adicional
- **Railway**: Deploy directo desde GitHub
- **Docker**: Usa el Dockerfile incluido (si lo tienes)

## 💡 Próximas Mejoras Sugeridas

- [ ] Extracción real de texto del PDF (usando pdf-parse o similar)
- [ ] Modo multijugador en tiempo real
- [ ] Exportar resultados a PDF
- [ ] Categorías y tags para organizar quizzes
- [ ] Leaderboard global
- [ ] Timer configurable por pregunta
- [ ] Modo estudio (mostrar respuestas antes del quiz)
- [ ] Soporte para más idiomas

---

¿Tienes preguntas? Revisa el [README.md](README.md) o abre un issue en GitHub.
