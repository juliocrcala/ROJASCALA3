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

### 1. ✅ Email autorizado (Ya configurado)

Tu email **ya está configurado** en todos los archivos necesarios:

#### a) `src/SecureLogin.tsx` (línea 8)
```typescript
const AUTHORIZED_EMAIL = 'rojas.ca.la.admi@gmail.com';  // ✅ Configurado
```

#### b) `src/ProtectedRoute.tsx` (línea 6)
```typescript
const AUTHORIZED_EMAIL = 'rojas.ca.la.admi@gmail.com';  // ✅ Configurado
```

#### c) `src/useAuth.ts` (línea 5)
```typescript
const AUTHORIZED_EMAIL = 'rojas.ca.la.admi@gmail.com';  // ✅ Configurado
```

---

### 2. ✅ Cuenta de administrador (Ya creada)

Tu cuenta de administrador **ya está creada y activa** en Supabase:

- **Email:** `rojas.ca.la.admi@gmail.com`
- **Contraseña temporal:** `AdminRojasCala2026!`
- **Estado:** Confirmado y listo para usar

**Recomendación:** Cambia tu contraseña después del primer login por seguridad.

#### Cambiar tu contraseña desde Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, haz clic en **"Authentication"**
3. Haz clic en **"Users"**
4. Busca tu email: `rojas.ca.la.admi@gmail.com`
5. Haz clic en el usuario y luego en **"Reset password"**
6. Ingresa tu nueva contraseña y guarda

#### Opción B: Usando SQL (Ya configurado)

Tu cuenta ya está creada con el email: `rojas.ca.la.admi@gmail.com`

Si necesitas cambiar la contraseña, usa:

```sql
UPDATE auth.users
SET encrypted_password = crypt('TU_NUEVA_CONTRASEÑA', gen_salt('bf'))
WHERE email = 'rojas.ca.la.admi@gmail.com';
```

---

### 3. ¡Ya está listo! Inicia sesión ahora

Todo está configurado. Usa estas credenciales:

**Email:**
```
rojas.ca.la.admi@gmail.com
```

**Contraseña temporal:**
```
AdminRojasCala2026!
```

**Pasos para iniciar sesión:**
1. Ve a: `https://tu-sitio.com/login`
2. Ingresa el email y contraseña de arriba
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

### ✅ Ya está todo configurado:
1. ✅ Email configurado: `rojas.ca.la.admi@gmail.com`
2. ✅ Usuario creado en Supabase
3. ✅ Base de datos protegida con RLS
4. ✅ Contraseña temporal: `AdminRojasCala2026!`

### 🚀 Lo que DEBES hacer ahora:
1. Ir a `/login` e iniciar sesión
2. Cambiar tu contraseña temporal (recomendado)
3. ¡Disfrutar de tu panel admin seguro!

### URLs importantes:
- **Login**: `/login`
- **Panel Admin**: `/admin` (protegido, requiere login)
- **Sitio público**: `/` (cualquiera puede ver)

---

¡Tu panel admin ahora es seguro y profesional! 🚀
