# Configuración de Sitemap Automático

## ¿Qué se implementó?

Se ha configurado el proyecto para generar automáticamente un `sitemap.xml` en cada build que incluye:

- ✅ Todas las páginas principales del sitio
- ✅ Todos los artículos normales (tabla `articles`)
- ✅ Todos los artículos especiales (tabla `special_articles`)
- ✅ Solo artículos visibles (is_hidden = false)
- ✅ Fechas de última modificación
- ✅ Prioridades y frecuencias de cambio optimizadas para SEO

## Archivos modificados y creados

### Archivos nuevos:
1. **`scripts/generate-sitemap.js`** - Script que genera el sitemap consultando Supabase
2. **`public/robots.txt`** - Archivo robots.txt que referencia el sitemap
3. **`SITEMAP_SETUP.md`** - Esta documentación

### Archivos modificados:
1. **`package.json`** - Se modificó el script `build` para ejecutar la generación del sitemap automáticamente

## ¿Cómo funciona?

Cada vez que ejecutas `npm run build`, el proceso:

1. Compila la aplicación React con Vite
2. Conecta a Supabase y obtiene todos los artículos visibles
3. Genera `dist/sitemap.xml` con todas las URLs
4. Copia automáticamente `public/robots.txt` a `dist/robots.txt`

**No necesitas hacer nada manual** - el sitemap se actualiza solo en cada build.

## URLs incluidas en el sitemap

### Páginas estáticas (prioridad alta):
- `/` - Página principal (prioridad 1.0)
- `/normas` - Normas (prioridad 0.9)
- `/fechas` - Calendario (prioridad 0.9)
- `/categorias` - Categorías (prioridad 0.9)
- `/especiales` - Especiales (prioridad 0.9)
- `/contacto` - Contacto (prioridad 0.8)

### Artículos dinámicos:
- `/articulo/normal/{id}` - Artículos normales (prioridad 0.7)
- `/articulo/especial/{id}` - Artículos especiales (prioridad 0.8)

## Cómo publicarlo en Hostinger

### Paso 1: Hacer el build
```bash
npm run build
```

### Paso 2: Subir los archivos a Hostinger

Sube todo el contenido de la carpeta `dist/` a tu servidor Hostinger mediante:

**Opción A - Panel de control de Hostinger:**
1. Accede al File Manager de Hostinger
2. Ve a la carpeta `public_html` (o la carpeta raíz de tu dominio)
3. Sube todos los archivos de `dist/`
4. Asegúrate de que `sitemap.xml` y `robots.txt` estén en la raíz

**Opción B - FTP:**
1. Conecta via FTP a tu servidor Hostinger
2. Sube todo el contenido de `dist/` a `public_html/`
3. Verifica que los archivos estén correctamente ubicados

### Paso 3: Verificar que funciona

Visita estas URLs para confirmar:
- https://rojascalaperu.com/sitemap.xml
- https://rojascalaperu.com/robots.txt

Deberías ver el contenido XML del sitemap y el archivo robots.txt.

### Paso 4: Enviar a Google Search Console (opcional pero recomendado)

1. Ve a https://search.google.com/search-console
2. Selecciona tu propiedad (rojascalaperu.com)
3. En el menú lateral, ve a "Sitemaps"
4. Ingresa: `https://rojascalaperu.com/sitemap.xml`
5. Haz clic en "Enviar"

Google empezará a rastrear tu sitio usando el sitemap automáticamente.

## Mantenimiento

**No necesitas hacer nada especial.** Cada vez que:

- Publiques un nuevo artículo
- Modifiques un artículo existente
- Ocultes o muestres un artículo

Solo ejecuta `npm run build` y sube los archivos a Hostinger. El sitemap se actualizará automáticamente con los cambios.

## Notas técnicas

- El sitemap usa el dominio: `https://rojascalaperu.com`
- Solo incluye artículos con `is_hidden = false`
- Las fechas de modificación se toman de `updated_at` o `published_date`
- El formato cumple con el estándar XML de sitemaps
- Compatible con Google, Bing y otros motores de búsqueda
