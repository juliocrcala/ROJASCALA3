import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SITE_URL = "https://rojascala.org";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const staticPages = [
  { url: "/", priority: "1.0", changefreq: "daily" },
  { url: "/normas", priority: "0.9", changefreq: "weekly" },
  { url: "/fechas", priority: "0.9", changefreq: "weekly" },
  { url: "/categorias", priority: "0.9", changefreq: "weekly" },
  { url: "/especiales", priority: "0.9", changefreq: "weekly" },
  { url: "/repositorio", priority: "0.9", changefreq: "daily" },
  { url: "/contacto", priority: "0.8", changefreq: "monthly" },
];

function formatDate(date: string | null): string {
  if (!date) return new Date().toISOString().split("T")[0];
  return new Date(date).toISOString().split("T")[0];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = formatDate(null);

    const urls: string[] = [];

    for (const page of staticPages) {
      urls.push(`  <url>
    <loc>${escapeXml(SITE_URL + page.url)}</loc>
    <lastmod>${today}</lastmod>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
  </url>`);
    }

    const { data: articles } = await supabase
      .from("articles")
      .select("id, slug, updated_at, published_date")
      .eq("is_hidden", false);

    if (articles) {
      for (const a of articles) {
        const slug = a.slug || a.id;
        urls.push(`  <url>
    <loc>${escapeXml(SITE_URL + "/articulo/normal/" + slug)}</loc>
    <lastmod>${formatDate(a.updated_at || a.published_date)}</lastmod>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
  </url>`);
      }
    }

    const { data: specialArticles } = await supabase
      .from("special_articles")
      .select("id, slug, updated_at, published_date")
      .eq("is_hidden", false);

    if (specialArticles) {
      for (const a of specialArticles) {
        const slug = a.slug || a.id;
        urls.push(`  <url>
    <loc>${escapeXml(SITE_URL + "/articulo/special/" + slug)}</loc>
    <lastmod>${formatDate(a.updated_at || a.published_date)}</lastmod>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>`);
      }
    }

    const { data: repoNorms } = await supabase
      .from("repository_norms")
      .select("slug, updated_at, published_date")
      .eq("is_hidden", false);

    if (repoNorms) {
      for (const n of repoNorms) {
        if (!n.slug) continue;
        urls.push(`  <url>
    <loc>${escapeXml(SITE_URL + "/repositorio/" + n.slug)}</loc>
    <lastmod>${formatDate(n.updated_at || n.published_date)}</lastmod>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
  </url>`);
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/xml; charset=utf-8",
        },
      }
    );
  }
});
