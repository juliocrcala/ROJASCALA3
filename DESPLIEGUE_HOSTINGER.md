# Guía de Despliegue en Hostinger

## Archivos para Subir

Todo el contenido de la carpeta `dist/` debe ser subido al servidor de Hostinger.

### Estructura de archivos a subir:
```
dist/
├── .htaccess          (Configuración de Apache para React Router)
├── index.html         (Página principal)
└── assets/
    ├── index-Ck6ae498.css
    └── index-DEsnsc4a.js
```

## Pasos para el Despliegue

### 1. Acceder al Panel de Hostinger
- Inicia sesión en tu cuenta de Hostinger
- Ve al panel de control de tu hosting

### 2. Acceder al Administrador de Archivos
- Busca "Administrador de archivos" o "File Manager"
- Navega a la carpeta `public_html` (o la carpeta raíz de tu dominio)

### 3. Limpiar la Carpeta (si es necesario)
- Elimina cualquier archivo anterior (index.html, index.php, etc.)
- Mantén solo archivos de configuración como `.htaccess` si ya existían

### 4. Subir los Archivos
- Sube TODO el contenido de la carpeta `dist/` al directorio raíz
- Asegúrate de subir:
  - El archivo `index.html`
  - El archivo `.htaccess` (muy importante para las rutas)
  - La carpeta `assets/` con todos sus archivos

### 5. Verificar la Estructura
Tu carpeta public_html debe verse así:
```
public_html/
├── .htaccess
├── index.html
└── assets/
    ├── index-Ck6ae498.css
    └── index-DEsnsc4a.js
```

## Configuración de Variables de Entorno

Las variables de entorno de Supabase ya están compiladas en el archivo JavaScript. NO necesitas configurar nada adicional en Hostinger.

### Variables incluidas en el build:
- **VITE_SUPABASE_URL**: https://dzqwatrhficgrioidxnw.supabase.co
- **VITE_SUPABASE_ANON_KEY**: (ya incluida en el código compilado)

## Verificación Post-Despliegue

### 1. Prueba de Acceso
Visita tu dominio en el navegador:
- ✅ Debe cargar la página principal
- ✅ Debe mostrar el banner de cookies
- ✅ Debe mostrar los artículos publicados

### 2. Prueba de Navegación
- ✅ Click en "Inicio" - debe funcionar
- ✅ Click en cualquier artículo - debe abrir el artículo
- ✅ Click en "Contacto" - debe abrir el formulario
- ✅ Usa el botón "Atrás" del navegador - debe funcionar correctamente

### 3. Prueba del Panel de Administración
- Visita: `tudominio.com/admin-login`
- Inicia sesión con:
  - Email: `rojas.ca.la.admi@gmail.com`
  - Contraseña: (la que configuraste en Supabase)
- ✅ Debe permitir el acceso al panel de administración

### 4. Prueba de Funcionalidades del Admin
- ✅ Crear/editar/eliminar artículos
- ✅ Gestionar contactos
- ✅ Ver consultas
- ✅ Configurar cookies
- ✅ Ver analíticas

## Solución de Problemas Comunes

### Error 404 en rutas internas
**Problema**: Al acceder a `/admin-login` o cualquier ruta, aparece error 404.
**Solución**: Verifica que el archivo `.htaccess` esté en la raíz y contenga:
```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

### No se cargan los estilos o scripts
**Problema**: La página se ve sin estilos.
**Solución**:
- Verifica que la carpeta `assets/` se haya subido correctamente
- Revisa los permisos de archivos (deben ser 644)
- Revisa los permisos de carpetas (deben ser 755)

### Error al iniciar sesión en admin
**Problema**: No puedes iniciar sesión en el panel de admin.
**Solución**:
- Verifica que uses el email correcto: `rojas.ca.la.admi@gmail.com`
- Asegúrate de que el usuario esté creado en Supabase Auth
- Verifica la conexión a internet

### Banner de cookies no se muestra
**Problema**: El banner de cookies no aparece.
**Solución**:
- Borra las cookies del sitio en tu navegador
- Recarga la página
- O click en "Inicio" en el footer

## Configuración de SSL (HTTPS)

Hostinger generalmente incluye SSL gratuito. Si tu sitio no tiene HTTPS:

1. Ve al panel de Hostinger
2. Busca "SSL/TLS" o "Certificados SSL"
3. Activa el certificado SSL gratuito (Let's Encrypt)
4. Espera unos minutos para que se active
5. Fuerza HTTPS agregando esto al inicio de `.htaccess`:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Base de Datos (Supabase)

Tu aplicación usa Supabase como base de datos. NO necesitas configurar MySQL en Hostinger.

### Información de Conexión:
- **URL**: https://dzqwatrhficgrioidxnw.supabase.co
- **Estado**: Ya conectada y funcionando
- **Tablas configuradas**: ✅

### Backup de la Base de Datos
Para hacer respaldo de tu base de datos:
1. Ve a tu proyecto en Supabase (https://supabase.com)
2. Desde el SQL Editor, ejecuta:
```sql
-- Esto descarga todos los datos
SELECT * FROM articles;
SELECT * FROM special_articles;
SELECT * FROM contacts;
SELECT * FROM consultations;
SELECT * FROM newsletter;
```

## Mantenimiento y Actualizaciones

### Para actualizar el sitio:
1. Haz cambios en tu código local
2. Ejecuta: `npm run build`
3. Sube el nuevo contenido de `dist/` a Hostinger
4. Reemplaza los archivos antiguos

### Para actualizar la base de datos:
- Los cambios se hacen automáticamente desde el panel de admin
- NO necesitas tocar Supabase manualmente

## URLs Importantes

- **Sitio público**: https://tudominio.com
- **Login admin**: https://tudominio.com/admin-login
- **Panel admin**: https://tudominio.com/rojascalaperu2025admin
- **Supabase Dashboard**: https://supabase.com/dashboard/project/dzqwatrhficgrioidxnw

## Contacto y Soporte

Si tienes problemas con el despliegue, verifica:
1. Que todos los archivos se hayan subido correctamente
2. Que el archivo `.htaccess` esté presente
3. Que los permisos de archivos sean correctos
4. Que el SSL esté activo

---

## Checklist Final de Despliegue

- [ ] Archivos de `dist/` subidos a `public_html/`
- [ ] Archivo `.htaccess` en su lugar
- [ ] Carpeta `assets/` con todos sus archivos
- [ ] SSL/HTTPS activado
- [ ] Página principal carga correctamente
- [ ] Navegación entre páginas funciona
- [ ] Panel de admin accesible
- [ ] Login de admin funciona
- [ ] Banner de cookies funciona
- [ ] Artículos se muestran correctamente
- [ ] Formulario de contacto funciona

¡Tu sitio está listo para producción!
