# Configuración de Variables de Entorno para Vercel

## Variables de Entorno Requeridas

Para que la integración con Supabase funcione correctamente en producción, necesitas configurar las siguientes variables de entorno en Vercel:

### 1. Variables de Supabase (REQUERIDAS)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
```

### 2. Variables de Analytics (OPCIONALES)

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=tu-pixel-id
```

### 3. Variables de Configuración (OPCIONALES)

```bash
NEXT_PUBLIC_WHATSAPP_PHONE=56934812424
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
```

## Pasos para Configurar en Vercel

### Opción 1: Dashboard de Vercel
1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Navega a Settings → Environment Variables
3. Agrega cada variable una por una:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://tu-proyecto.supabase.co`
   - Environment: `Production`, `Preview`, `Development`

### Opción 2: Vercel CLI
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

### Opción 3: Archivo .env (solo para desarrollo local)
Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local (NO subir a git)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=tu-pixel-id
NEXT_PUBLIC_WHATSAPP_PHONE=56934812424
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Obtener Credenciales de Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a Settings → API
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Configurar Base de Datos

1. En Supabase, ve a SQL Editor
2. Ejecuta el contenido del archivo `supabase-setup.sql`
3. Verifica que las tablas se crearon correctamente en Table Editor

## Actualizar URLs en el Código

Después de configurar las variables de entorno, actualiza el archivo `assets/js/supabase.js`:

```javascript
// Cambiar estas líneas:
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Por:
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
```

## Verificar Funcionamiento

1. Deploy el proyecto después de configurar las variables
2. Abre las Developer Tools (F12)
3. Ve a la consola para verificar que no hay errores de Supabase
4. Prueba completar el formulario de lead capture
5. Verifica en Supabase que los datos se están guardando

## Troubleshooting

### Error: "Failed to fetch"
- Verifica que las URLs de Supabase sean correctas
- Asegúrate de que las políticas RLS estén configuradas correctamente

### Error: "Invalid API key"
- Verifica que la clave anon key sea correcta
- Asegúrate de usar la clave `anon` y no la `service_role`

### Variables no se actualizan
- Después de cambiar variables de entorno en Vercel, haz un nuevo deploy
- Las variables solo se aplican en nuevos deployments

## Seguridad

- ✅ La clave `anon` es segura para usar en el frontend
- ✅ Las políticas RLS protegen los datos
- ❌ NUNCA uses la clave `service_role` en el frontend
- ✅ Las variables `NEXT_PUBLIC_*` son visibles en el frontend (esto es normal)