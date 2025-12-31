# Configuración de Supabase

Este documento explica cómo configurar Supabase para Tutorcito.

## 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Guarda la contraseña de la base de datos

## 2. Obtener Credenciales

### En Supabase Dashboard → Settings → API:

Copia estas credenciales a tu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### En Supabase Dashboard → Settings → Database:

Copia la **Connection String** en modo **Session** y agrégala a `.env.local`:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
```

## 3. Configurar Google OAuth

### En Google Cloud Console:

1. Ve a [https://console.cloud.google.com](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services → Credentials**
4. Crea **OAuth 2.0 Client ID**
5. Tipo: **Web application**
6. **Authorized redirect URIs:**
   ```
   https://[TU-PROJECT-REF].supabase.co/auth/v1/callback
   ```
7. Copia **Client ID** y **Client Secret**

### En Supabase Dashboard:

1. Ve a **Authentication → Providers**
2. Habilita **Google**
3. Pega **Client ID** y **Client Secret**
4. Click **Save**

## 4. Configurar URLs de Autenticación

En Supabase Dashboard → Authentication → URL Configuration:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs** (agregar AMBAS):
  ```
  http://localhost:3000
  http://localhost:3000/api/auth/callback
  ```
  
  ⚠️ **IMPORTANTE**: La URL de callback debe incluir `/api` → `/api/auth/callback`

## 5. Ejecutar Migraciones

Una vez que tengas todas las credenciales en `.env.local`:

```bash
# Generar migraciones desde el schema
npm run db:generate

# Aplicar migraciones a Supabase
npm run db:push
```

## 6. Configurar Storage para PDFs

1. Ve a **Storage** en Supabase Dashboard
2. Crea un nuevo bucket llamado `pdfs`
3. Configura políticas de acceso:
   - **Política de INSERT:** Usuarios autenticados pueden subir
   - **Política de SELECT:** Solo el owner puede leer
   - **Política de DELETE:** Solo el owner puede eliminar

```sql
-- INSERT policy
CREATE POLICY "Users can upload their own PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- SELECT policy
CREATE POLICY "Users can view their own PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE policy
CREATE POLICY "Users can delete their own PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 7. Verificar Configuración

Para verificar que todo está configurado correctamente:

```bash
# Verificar conexión a base de datos
npm run db:studio

# Iniciar servidor de desarrollo
npm run dev
```

## Troubleshooting

### Error: "relation does not exist"
- Asegúrate de haber ejecutado `npm run db:push`

### Error: "Failed to fetch"
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` sea correcto
- Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` sea correcto

### Google OAuth no funciona
- Verifica que la redirect URI en Google Cloud Console sea exactamente: `https://[PROJECT-REF].supabase.co/auth/v1/callback`
- Verifica que Client ID y Client Secret estén correctos en Supabase
