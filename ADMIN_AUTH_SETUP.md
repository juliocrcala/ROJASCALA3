# Configuración de Autenticación Segura para el Panel Admin

## ¿Qué cambió?

Tu panel de administración ahora está **protegido con Supabase Auth**, un sistema de autenticación profesional y seguro. Ya no usa una contraseña simple en el frontend.

### Ventajas del nuevo sistema:
- ✅ Autenticación real con email y contraseña
- ✅ Sesiones seguras manejadas por Supabase
- ✅ Solo tu email puede acceder al panel admin
- ✅ Base de datos protegida con Row Level Security (RLS)
- ✅ Sin contraseñas visibles en el código frontend

---

## Configuración Paso a Paso

### 1. Actualiza tu email autorizado

En tu código, hay **3 archivos** donde debes reemplazar `'tu_email@ejemplo.com'` con tu email real:

#### a) `src/SecureLogin.tsx` (línea 8)
```typescript
const AUTHORIZED_EMAIL = 'tu_email@ejemplo.com';  // ← Cambia esto por tu email
```

#### b) `src/ProtectedRoute.tsx` (línea 6)
```typescript
const AUTHORIZED_EMAIL = 'tu_email@ejemplo.com';  // ← Cambia esto por tu email
```

#### c) `src/useAuth.ts` (línea 5)
```typescript
const AUTHORIZED_EMAIL = 'tu_email@ejemplo.com';  // ← Cambia esto por tu email
```

**Ejemplo:**
Si tu email es `julio.rojas@gmail.com`, reemplaza:
```typescript
const AUTHORIZED_EMAIL = 'julio.rojas@gmail.com';
```

---

### 2. Crea tu cuenta de administrador en Supabase

Ahora necesitas crear tu usuario en Supabase:

#### Opción A: Desde el Dashboard de Supabase (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, haz clic en **"Authentication"**
3. Haz clic en **"Users"**
4. Haz clic en **"Add user"** → **"Create new user"**
5. Completa el formulario:
   - **Email**: Tu email (el mismo que pusiste en el código)
   - **Password**: Tu contraseña segura
   - **Auto Confirm User**: ✅ Activar (para confirmar el email automáticamente)
6. Haz clic en **"Create user"**

#### Opción B: Usando SQL (Alternativa)

Si prefieres usar SQL, ejecuta esto en el SQL Editor de Supabase:

```sql
-- Reemplaza con tu email y contraseña
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  'tu_email@ejemplo.com',  -- ← Tu email aquí
  crypt('TU_CONTRASEÑA_SEGURA', gen_salt('bf')),  -- ← Tu contraseña aquí
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  'authenticated',
  'authenticated'
);
```

---

### 3. ¡Ya está listo!

Ahora puedes iniciar sesión:

1. Ve a: `https://tu-sitio.com/login`
2. Ingresa tu email y contraseña
3. ¡Accede al panel admin!

**URL antigua:** `/rojascalaperu2025` (ya no funciona)
**URL nueva:** `/admin` (protegida con autenticación)

---

## Cómo usar el panel admin

### Para iniciar sesión:
- Ve a: `/login`
- Ingresa tu email y contraseña
- Serás redirigido automáticamente a `/admin`

### Para cerrar sesión:
- En el panel admin, haz clic en el botón **"Cerrar Sesión"** (arriba a la derecha)
- Serás redirigido a la página de login

---

## Seguridad implementada

### 1. Autenticación
- Solo usuarios registrados en Supabase pueden intentar acceder
- Las contraseñas están cifradas y nunca se envían en texto plano
- Las sesiones expiran automáticamente por seguridad

### 2. Autorización
- Solo tu email específico puede acceder al panel admin
- Cualquier otro usuario autenticado será rechazado
- Verificación en frontend y backend

### 3. Base de datos (RLS)
Todas las tablas están protegidas con Row Level Security:

#### Usuarios públicos (sin autenticación):
- ✅ **VER** artículos publicados (is_hidden = false)
- ✅ **VER** contactos activos
- ✅ **VER** categorías activas
- ✅ **ENVIAR** consultas
- ✅ **SUSCRIBIRSE** al newsletter
- ❌ **NO PUEDEN** editar, eliminar o ver contenido oculto

#### Tú (admin autenticado):
- ✅ **VER TODO** (incluido contenido oculto)
- ✅ **CREAR** artículos, contactos, categorías
- ✅ **EDITAR** cualquier contenido
- ✅ **ELIMINAR** cualquier contenido
- ✅ **VER** consultas y suscriptores
- ✅ **GESTIONAR** configuración del sitio

---

## Tablas protegidas

Estas tablas tienen políticas RLS activas:

1. **articles** - Artículos legales
2. **special_articles** - Artículos destacados
3. **contacts** - Contactos profesionales
4. **consultations** - Solicitudes de consulta
5. **categories_config** - Categorías y tipos de documentos
6. **site_settings** - Configuración del sitio
7. **analytics_summary** - Reportes de analíticas
8. **newsletter_subscribers** - Suscriptores del newsletter

---

## Solución de problemas

### "No tienes autorización para acceder al panel de administración"
- ✅ Verifica que el email en el código coincida EXACTAMENTE con el email de tu cuenta
- ✅ Asegúrate de haber creado el usuario en Supabase
- ✅ Revisa que no haya espacios en blanco antes o después del email

### "Error al iniciar sesión"
- ✅ Verifica que tu contraseña sea correcta
- ✅ Asegúrate de que el usuario esté confirmado en Supabase
- ✅ Revisa la consola del navegador para más detalles

### "Cannot read properties of undefined"
- ✅ Verifica que las variables de entorno de Supabase estén configuradas:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### No puedo editar contenido en el admin
- ✅ Asegúrate de estar autenticado con el email correcto
- ✅ Verifica que las políticas RLS se hayan aplicado correctamente
- ✅ Revisa la consola del navegador para errores de permisos

---

## Notas importantes

1. **NUNCA** compartas tu contraseña
2. **NUNCA** uses `SUPABASE_SERVICE_ROLE_KEY` en el frontend
3. **SIEMPRE** usa contraseñas fuertes (mínimo 8 caracteres, con letras y números)
4. Si necesitas cambiar tu contraseña, hazlo desde el Dashboard de Supabase
5. Las sesiones se mantienen activas hasta que cierres sesión o se expire el token

---

## Resumen rápido

### Lo que DEBES hacer:
1. ✅ Reemplazar `'tu_email@ejemplo.com'` en 3 archivos
2. ✅ Crear tu usuario en Supabase con ese email
3. ✅ Ir a `/login` e iniciar sesión
4. ✅ ¡Disfrutar de tu panel admin seguro!

### URLs importantes:
- **Login**: `/login`
- **Panel Admin**: `/admin` (protegido, requiere login)
- **Sitio público**: `/` (cualquiera puede ver)

---

¡Tu panel admin ahora es seguro y profesional! 🚀
