import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SITE_URL = 'https://rojascala.org';

const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/normas', priority: '0.9', changefreq: 'weekly' },
  { url: '/fechas', priority: '0.9', changefreq: 'weekly' },
  { url: '/categorias', priority: '0.9', changefreq: 'weekly' },
  { url: '/especiales', priority: '0.9', changefreq: 'weekly' },
  { url: '/repositorio', priority: '0.9', changefreq: 'weekly' },
  { url: '/contacto', priority: '0.8', changefreq: 'monthly' },
];

function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

function generateSitemapXML(urls) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, lastmod, priority, changefreq }) => `  <url>
    <loc>${url}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <priority>${priority}</priority>
    <changefreq>${changefreq}</changefreq>
  </url>`).join('\n')}
</urlset>`;
  return xml;
}

async function generateSitemap() {
  console.log('Generando sitemap.xml...');

  const urls = [];

  staticPages.forEach(page => {
    urls.push({
      url: `${SITE_URL}${page.url}`,
      lastmod: formatDate(new Date()),
      priority: page.priority,
      changefreq: page.changefreq,
    });
  });

  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('id, slug, updated_at, published_date')
    .eq('is_hidden', false);

  if (articlesError) {
    console.error('Error al obtener artículos:', articlesError);
  } else if (articles) {
    articles.forEach(article => {
      urls.push({
        url: `${SITE_URL}/articulo/normal/${article.slug || article.id}`,
        lastmod: formatDate(article.updated_at || article.published_date),
        priority: '0.7',
        changefreq: 'monthly',
      });
    });
    console.log(`✓ ${articles.length} artículos normales agregados`);
  }

  const { data: specialArticles, error: specialError } = await supabase
    .from('special_articles')
    .select('id, slug, updated_at, published_date')
    .eq('is_hidden', false);

  if (specialError) {
    console.error('Error al obtener artículos especiales:', specialError);
  } else if (specialArticles) {
    specialArticles.forEach(article => {
      urls.push({
        url: `${SITE_URL}/articulo/special/${article.slug || article.id}`,
        lastmod: formatDate(article.updated_at || article.published_date),
        priority: '0.8',
        changefreq: 'monthly',
      });
    });
    console.log(`✓ ${specialArticles.length} artículos especiales agregados`);
  }

  const { data: repoNorms, error: repoError } = await supabase
    .from('repository_norms')
    .select('id, slug, updated_at, published_date')
    .eq('is_hidden', false);

  if (repoError) {
    console.error('Error al obtener normas del repositorio:', repoError);
  } else if (repoNorms) {
    repoNorms.forEach(norm => {
      if (!norm.slug) return;
      urls.push({
        url: `${SITE_URL}/repositorio/${norm.slug}`,
        lastmod: formatDate(norm.updated_at || norm.published_date),
        priority: '0.7',
        changefreq: 'monthly',
      });
    });
    console.log(`✓ ${repoNorms.length} normas del repositorio agregadas`);
  }

  const sitemapXML = generateSitemapXML(urls);

  const outputPath = join(__dirname, '../dist/sitemap.xml');
  writeFileSync(outputPath, sitemapXML, 'utf-8');

  console.log(`✓ Sitemap generado exitosamente en: ${outputPath}`);
  console.log(`✓ Total de URLs: ${urls.length}`);
}

generateSitemap().catch(console.error);
