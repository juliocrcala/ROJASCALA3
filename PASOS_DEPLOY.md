# Pasos para Deploy a Hostinger

## Archivos listos para desplegar

La carpeta `dist/` ya tiene todo compilado y listo. Contiene:
- ✅ index.html
- ✅ .htaccess
- ✅ robots.txt
- ✅ sitemap.xml (con 24 URLs)
- ✅ assets/ (CSS y JavaScript)
- ✅ favicon.svg

## Primera vez - Deploy inicial

### 1. Descarga el proyecto completo de Bolt
- Click en el botón de descarga de Bolt
- Descomprime el archivo .zip

### 2. Abre una terminal en la carpeta del proyecto

```bash
cd ruta/donde/descargaste/el-proyecto
```

### 3. Instala dependencias (solo primera vez)

```bash
npm install
```

### 4. Haz el build

```bash
npm run build
```

Verás un mensaje que dice:
- ✓ built in X.XXs
- ✓ 16 artículos normales agregados
- ✓ 2 artículos especiales agregados
- ✓ Total de URLs: 24

### 5. Sube los archivos a Hostinger

**Opción A - File Manager de Hostinger:**
1. Entra a tu panel de Hostinger
2. Ve a "Archivos" → "Administrador de Archivos"
3. Navega a `public_html`
4. Borra todo lo que esté ahí (si hay algo viejo)
5. Sube TODO el contenido de la carpeta `dist/` (arrastra todos los archivos y carpetas)

**Opción B - FTP con FileZilla:**
1. Conecta a Hostinger con FTP
2. Ve a la carpeta `public_html`
3. Sube todo el contenido de `dist/`

### 6. Verifica que funciona

Visita estas URLs:
- https://rojascalaperu.com (tu sitio)
- https://rojascalaperu.com/sitemap.xml (el sitemap)
- https://rojascalaperu.com/robots.txt (robots.txt)

---

## Actualizaciones futuras - Cuando publiques un artículo nuevo

### 1. Vuelve a Bolt y descarga el proyecto actualizado

### 2. En tu computadora, abre terminal en la carpeta

```bash
cd ruta/del/proyecto
```

### 3. Instala dependencias (por si acaso hay nuevas)

```bash
npm install
```

### 4. Haz el build nuevamente

```bash
npm run build
```

Esto regenerará el sitemap con el nuevo artículo.

### 5. Sube SOLO el sitemap.xml actualizado

Como solo cambió el sitemap, puedes subir únicamente:
- `dist/sitemap.xml`

Pero si quieres estar seguro, sube todo `dist/` completo.

---

## Resumen rápido

**Primera vez:**
1. Descargar proyecto
2. `npm install`
3. `npm run build`
4. Subir `dist/` a Hostinger

**Actualizaciones:**
1. Descargar proyecto actualizado de Bolt
2. `npm install` (opcional, por si hay cambios)
3. `npm run build`
4. Subir `dist/sitemap.xml` a Hostinger (o todo `dist/` para estar seguro)

---

## Notas importantes

- El sitemap se regenera automáticamente en cada build
- Solo incluye artículos visibles (is_hidden = false)
- Incluye 6 páginas estáticas + todos los artículos
- No necesitas editar nada manualmente

---

## ¿Problemas?

Si algo no funciona, revisa:
1. Que todos los archivos estén en `public_html` (no en una subcarpeta)
2. Que el `.htaccess` esté presente
3. La consola del navegador (F12 → Console) para ver errores
4. Que Supabase esté funcionando correctamente
