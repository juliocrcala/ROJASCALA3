# Instrucciones para Subir el Blog a Hostinger

## Pasos para el Despliegue

### 1. Preparar los Archivos

Los archivos que necesitas subir están en la carpeta `dist/`:
- `dist/index.html`
- `dist/assets/` (toda la carpeta)
- `public/.htaccess`

### 2. Conectar por FTP a Hostinger

1. Accede a tu panel de Hostinger
2. Ve a **Archivos** → **Administrador de Archivos** o usa un cliente FTP como FileZilla
3. Navega a la carpeta `public_html` de tu dominio

### 3. Subir los Archivos

**Opción A: Usando el Administrador de Archivos de Hostinger**
1. Abre el Administrador de Archivos
2. Navega a `public_html`
3. Sube el archivo `index.html` desde la carpeta `dist/`
4. Crea una carpeta llamada `assets`
5. Sube todo el contenido de `dist/assets/` a `public_html/assets/`
6. Sube el archivo `.htaccess` desde `public/` a `public_html/`

**Opción B: Usando FileZilla (Cliente FTP)**
1. Conecta con tus credenciales FTP de Hostinger
2. Arrastra los archivos de `dist/` a `public_html/`
3. Asegúrate de subir también el `.htaccess`

### 4. Estructura Final en Hostinger

Tu carpeta `public_html` debe verse así:

```
public_html/
├── index.html
├── .htaccess
└── assets/
    ├── index-Ck6ae498.css
    └── index-BYwfBDJ_.js
```

### 5. Configurar Variables de Entorno en Hostinger

**IMPORTANTE:** Las variables de entorno ya están compiladas en el código, pero si necesitas cambiarlas:

1. Ve al panel de Hostinger
2. No es necesario configurar nada adicional ya que Supabase funciona desde el navegador
3. Las credenciales están en los archivos JavaScript compilados

### 6. Verificar el Sitio

1. Visita tu dominio (ej: `https://tudominio.com`)
2. Verifica que el sitio carga correctamente
3. Prueba el panel de administración en `https://tudominio.com/admin`

### 7. Panel de Administración

**Usuario:** lucascarluis@gmail.com
**Contraseña:** La que configuraste en Supabase

**Acceso:** `https://tudominio.com/admin`

## Funcionalidades Disponibles

✅ **Sistema de Artículos** - Crear, editar y publicar artículos de blog
✅ **Categorías** - Gestionar categorías de artículos
✅ **Contactos** - Ver mensajes de contacto del formulario
✅ **Consultas** - Gestionar solicitudes de consultas legales
✅ **Newsletter** - Ver y gestionar suscriptores
✅ **Analytics** - Estadísticas de visitas y páginas más vistas
✅ **SEO** - Meta tags y optimización para buscadores
✅ **Modo Mantenimiento** - Activar/desactivar el sitio temporalmente
✅ **Banner de Cookies** - Cumplimiento GDPR

## Base de Datos (Supabase)

Tu base de datos está en Supabase y funcionará automáticamente. No necesitas configurar nada en Hostinger relacionado con la base de datos.

**URL de Supabase:** https://wckamhympcjsryqztwfz.supabase.co

## Resolución de Problemas

### El sitio muestra una página en blanco
- Verifica que el archivo `.htaccess` esté subido
- Revisa que la estructura de carpetas sea correcta
- Asegúrate de que el archivo `index.html` esté en la raíz de `public_html`

### Error 404 en las rutas
- El archivo `.htaccess` debe estar en `public_html/`
- Verifica que tenga el contenido correcto para React Router

### No puedo acceder al panel de administración
- Verifica en Supabase que el usuario exista
- Revisa la consola del navegador (F12) para ver errores
- Asegúrate de usar la contraseña correcta

## Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12 → Console)
2. Verifica que Supabase esté funcionando
3. Contacta al soporte de Hostinger si hay problemas con el hosting

---

**¡Tu blog está listo para funcionar en Hostinger!**
