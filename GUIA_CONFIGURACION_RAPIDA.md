# 🚀 Guía de Configuración Rápida - Tutorcito

Esta guía te llevará paso a paso para configurar Supabase y hacer funcionar el login con Google.

---

## ✅ CHECKLIST DE CONFIGURACIÓN

Marca cada paso completado:

### 1. Configuración de Supabase (5 minutos)

- [ ] **1.1** Crear cuenta en [supabase.com](https://supabase.com)
- [ ] **1.2** Crear nuevo proyecto
  - Nombre: `tutorcito` (o el que prefieras)
  - Database Password: Guárdala en un lugar seguro
  - Región: La más cercana a ti
  - Click **Create new project**
  - ⏳ Espera ~2 minutos mientras se crea

- [ ] **1.3** Obtener credenciales de API
  - Ve a **Settings** → **API**
  - Copia estos valores a tu `.env.local`:
    - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
    - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️

- [ ] **1.4** Obtener connection string de base de datos
  - Ve a **Settings** → **Database**
  - Busca **Connection string** → Tab **Transaction**
  - Copia la URL que empieza con `postgresql://postgres.[PROJECT]...`
  - Reemplaza `[YOUR-PASSWORD]` con la contraseña que guardaste
  - Pégala en `.env.local` como `DATABASE_URL`

### 2. Configuración de Google OAuth (10 minutos)

- [ ] **2.1** Ir a [Google Cloud Console](https://console.cloud.google.com)

- [ ] **2.2** Crear proyecto nuevo
  - Click en el selector de proyectos (arriba)
  - Click **NEW PROJECT**
  - Nombre: `Tutorcito`
  - Click **CREATE**

- [ ] **2.3** Configurar OAuth Consent Screen
  - Ve a **APIs & Services** → **OAuth consent screen**
  - User Type: **External**
  - Click **CREATE**
  - **App information**:
    - App name: `Tutorcito`
    - User support email: Tu email
    - Developer contact: Tu email
  - Click **SAVE AND CONTINUE**
  - En **Scopes**: Click **SAVE AND CONTINUE** (sin agregar nada)
  - En **Test users**: Click **SAVE AND CONTINUE** (opcional agregar tu email)
  - Click **BACK TO DASHBOARD**

- [ ] **2.4** Crear OAuth 2.0 Client ID
  - Ve a **APIs & Services** → **Credentials**
  - Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
  - Application type: **Web application**
  - Name: `Tutorcito - Supabase`
  - **Authorized JavaScript origins**:
    - Click **+ ADD URI**
    - Agregar: `http://localhost:3000`
  - **Authorized redirect URIs**:
    - Click **+ ADD URI**
    - Agregar: `https://[TU-PROJECT-REF].supabase.co/auth/v1/callback`
    - ⚠️ Reemplaza `[TU-PROJECT-REF]` con tu referencia de Supabase
    - Ejemplo: `https://abcdefghijk.supabase.co/auth/v1/callback`
  - Click **CREATE**

- [ ] **2.5** Copiar credenciales
  - Aparecerá un modal con **Client ID** y **Client Secret**
  - Cópialos en un lugar seguro (los necesitarás en el siguiente paso)

- [ ] **2.6** Configurar en Supabase
  - Vuelve a tu proyecto de Supabase
  - Ve a **Authentication** → **Providers**
  - Busca **Google** en la lista
  - Toggle **Google Enabled** a ON
  - Pega:
    - **Client ID**: El que copiaste de Google
    - **Client Secret**: El que copiaste de Google
  - Click **Save**

### 3. Configurar URLs de Redirección en Supabase (2 minutos)

- [ ] **3.1** En Supabase: **Authentication** → **URL Configuration**

- [ ] **3.2** Configurar Site URL
  - **Site URL**: `http://localhost:3000`

- [ ] **3.3** Agregar Redirect URLs
  - Click **+ Add URL** dos veces
  - Agregar:
    1. `http://localhost:3000`
    2. `http://localhost:3000/api/auth/callback` ⚠️ (importante: `/api`)
  - Click **Save**

### 4. Crear archivo .env.local (3 minutos)

- [ ] **4.1** En la raíz del proyecto, edita `.env.local`:

```env
# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (Drizzle)
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# OpenRouter (ya existe)
OPENROUTER_API_KEY=sk-or-v1-...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **4.2** Reemplazar con tus valores reales

### 5. Ejecutar Migraciones (2 minutos)

```bash
# Generar migraciones
npm run db:generate

# Aplicar a Supabase
npm run db:push
```

- [ ] **5.1** Ejecutar comandos arriba
- [ ] **5.2** Verificar que dice "✓ Done" sin errores
- [ ] **5.3** Ve a Supabase → **Table Editor** y verifica que existan 3 tablas:
  - `question_banks`
  - `questions`
  - `answers`

### 6. Configurar Storage para PDFs (3 minutos)

- [ ] **6.1** En Supabase: **Storage**

- [ ] **6.2** Crear bucket
  - Click **New bucket**
  - Name: `pdfs`
  - **Public bucket**: ❌ NO (debe estar desmarcado)
  - Click **Create bucket**

- [ ] **6.3** Configurar políticas RLS
  - Click en el bucket `pdfs`
  - Click **Policies**
  - Click **New policy** → **Create policy from scratch**
  
  **Política 1 - Upload PDFs**:
  - Policy name: `Users can upload their own PDFs`
  - Target roles: `authenticated`
  - Operation: `INSERT`
  - Policy command:
    ```sql
    (bucket_id = 'pdfs'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
    ```
  - Click **Save**
  
  **Política 2 - Read PDFs**:
  - Click **New policy** → **Create policy from scratch**
  - Policy name: `Users can view their own PDFs`
  - Target roles: `authenticated`
  - Operation: `SELECT`
  - Policy command:
    ```sql
    (bucket_id = 'pdfs'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
    ```
  - Click **Save**
  
  **Política 3 - Delete PDFs**:
  - Click **New policy** → **Create policy from scratch**
  - Policy name: `Users can delete their own PDFs`
  - Target roles: `authenticated`
  - Operation: `DELETE`
  - Policy command:
    ```sql
    (bucket_id = 'pdfs'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
    ```
  - Click **Save**

### 7. Probar el Login (2 minutos)

```bash
# Iniciar servidor de desarrollo
npm run dev
```

- [ ] **7.1** Servidor corriendo en `http://localhost:3000`
- [ ] **7.2** Ve a `http://localhost:3000/login`
- [ ] **7.3** Click "Continuar con Google"
- [ ] **7.4** Inicia sesión con tu cuenta de Google
- [ ] **7.5** Deberías ser redirigido a `http://localhost:3000/dashboard`
- [ ] **7.6** Verificar que ves tu nombre en el dashboard

---

## 🎉 ¡CONFIGURACIÓN COMPLETA!

Si llegaste hasta aquí, tu aplicación está lista. Ahora puedes:

1. Crear bancos de preguntas subiendo PDFs
2. Generar preguntas automáticamente con IA
3. Practicar con exámenes personalizados

---

## 🐛 Problemas Comunes

### "Failed to fetch" al hacer login
**Solución**: 
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctos
- Reinicia el servidor: Ctrl+C y luego `npm run dev`

### Callback queda en blanco
**Solución**:
- Verifica que en Supabase → Authentication → URL Configuration hayas agregado:
  `http://localhost:3000/api/auth/callback` (con `/api`)

### "relation does not exist"
**Solución**:
```bash
npm run db:push
```

### Google OAuth no funciona
**Solución**:
- En Google Cloud Console, verifica que la redirect URI sea exactamente:
  `https://[TU-PROJECT].supabase.co/auth/v1/callback`
- Verifica que Client ID y Secret en Supabase sean correctos

### No puedo conectarme a la base de datos
**Solución**:
- Verifica que `DATABASE_URL` tenga el formato correcto
- Asegúrate de haber reemplazado `[YOUR-PASSWORD]` con tu contraseña real
- Usa la URL de **Transaction** mode (puerto 6543), no Session mode

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la consola del navegador (F12 → Console)
2. Revisa la terminal donde corre `npm run dev`
3. Busca mensajes de error que empiecen con ❌

Los logs te dirán exactamente qué está fallando.

---

## ⏭️ Siguientes Pasos

Una vez configurado Supabase:

1. **Crear primer banco**: Ve a `/bancos/new` (próximamente)
2. **Generar preguntas**: Sube un PDF y configura las preguntas
3. **Hacer examen**: Selecciona un banco y practica

¡Disfruta Tutorcito! 🎓
