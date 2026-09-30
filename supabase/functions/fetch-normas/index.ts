import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ADMIN_EMAIL = "rojas.ca.la.admi@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function verifyAdmin(req: Request, supabase: any): Promise<boolean> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  return !error && user?.email === ADMIN_EMAIL;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function parseNormType(title: string): { norm_type: string; norm_number: string } {
  const patterns = [
    /^(LEY)\s+N[°ºo.]?\s*(\d[\d.-]*)/i,
    /^(DECRETO\s+SUPREMO)\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i,
    /^(DECRETO\s+LEGISLATIVO)\s+N[°ºo.]?\s*(\d[\d.-]*)/i,
    /^(DECRETO\s+DE\s+URGENCIA)\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i,
    /^(RESOLUCI[OÓ]N\s+MINISTERIAL)\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i,
    /^(RESOLUCI[OÓ]N\s+SUPREMA)\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i,
    /^(RESOLUCI[OÓ]N\s+DIRECTORAL)\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i,
    /^(RESOLUCI[OÓ]N\s+(?:DE\s+)?(?:SUPERINTENDENCIA|JEFATURAL|ADMINISTRATIVA|VICEMINISTERIAL|GERENCIA\s+GENERAL|PRESIDENCIA\s+EJECUTIVA))\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i,
    /^(ORDENANZA)\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i,
    /^(ACUERDO)\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i,
    /^(FE\s+DE\s+ERRATAS)/i,
    /^(ANEXO)\s*/i,
    /^(COMUNICADO)\s*/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return {
        norm_type: match[1].trim(),
        norm_number: match[2]?.trim() || "",
      };
    }
  }

  return { norm_type: "", norm_number: "" };
}

interface ElPeruanoNorm {
  edicionId: string;
  nombre: string;
  slug?: string;
  fechaPublicacion?: string;
  urlPdf?: string;
}

async function fetchNormsFromElPeruano(dateStr: string): Promise<ElPeruanoNorm[]> {
  // dateStr format: "2026-09-29" -> needs "29/09/2026"
  const [y, m, d] = dateStr.split("-");
  const formattedDate = `${d}/${m}/${y}`;

  // El Peruano uses an internal API for their search page
  const searchUrl = `https://busquedas.elperuano.pe/api/v1/normaslegales?page=1&perpage=100&fechaPublicacionInicio=${formattedDate}&fechaPublicacionFin=${formattedDate}`;

  const response = await fetch(searchUrl, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; NormBot/1.0)",
    },
  });

  if (response.ok) {
    const data = await response.json();
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map((item: any) => ({
        edicionId: item.edicionId || item.id || "",
        nombre: item.nombre || item.titulo || item.title || "",
        fechaPublicacion: dateStr,
        urlPdf: item.urlPdf || item.url || null,
      }));
    }
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        edicionId: item.edicionId || item.id || "",
        nombre: item.nombre || item.titulo || item.title || "",
        fechaPublicacion: dateStr,
        urlPdf: item.urlPdf || item.url || null,
      }));
    }
  }

  // Fallback: try the search page with different endpoint patterns
  const altUrls = [
    `https://busquedas.elperuano.pe/api/v1/normaslegales?fechaInicio=${formattedDate}&fechaFin=${formattedDate}&page=1&size=100`,
    `https://busquedas.elperuano.pe/normaslegales/api?page=1&rows=100&fechaPublicacion=${formattedDate}`,
    `https://diariooficial.elperuano.pe/Normas/GetNormasList?fecha=${formattedDate}`,
    `https://diariooficial.elperuano.pe/Normas/GetNormasList?fechaInicio=${formattedDate}&fechaFin=${formattedDate}`,
  ];

  for (const altUrl of altUrls) {
    try {
      const altResponse = await fetch(altUrl, {
        headers: {
          Accept: "application/json, text/html, */*",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "X-Requested-With": "XMLHttpRequest",
          Referer: "https://diariooficial.elperuano.pe/Normas",
        },
      });

      if (!altResponse.ok) continue;

      const contentType = altResponse.headers.get("content-type") || "";
      if (!contentType.includes("json")) continue;

      const altData = await altResponse.json();

      const items = altData?.data || altData?.normas || altData?.result || altData?.items || altData?.Data || (Array.isArray(altData) ? altData : null);

      if (items && Array.isArray(items) && items.length > 0) {
        return items.map((item: any) => ({
          edicionId: item.edicionId || item.EdicionId || item.id || item.Id || "",
          nombre: item.nombre || item.Nombre || item.titulo || item.Titulo || item.title || "",
          fechaPublicacion: dateStr,
          urlPdf: item.urlPdf || item.UrlPdf || item.url || item.Url || null,
        }));
      }
    } catch {
      // try next URL
    }
  }

  // Last resort: try scraping the cuadernillo page
  try {
    const cuadernilloUrl = `https://busquedas.elperuano.pe/cuadernillo/NL/${y}${m}${d}`;
    const htmlResponse = await fetch(cuadernilloUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (htmlResponse.ok) {
      const html = await htmlResponse.text();
      const norms: ElPeruanoNorm[] = [];

      // Extract norm entries from HTML using regex patterns
      const titleRegex = /<a[^>]*href="([^"]*\/dispositivo\/NL\/[^"]*)"[^>]*>([^<]+)<\/a>/gi;
      let match;
      while ((match = titleRegex.exec(html)) !== null) {
        const url = match[1];
        const title = match[2].trim();
        if (title.length > 10) {
          const edicionMatch = url.match(/\/(\d+-\d+)$/);
          norms.push({
            edicionId: edicionMatch ? edicionMatch[1] : "",
            nombre: title,
            fechaPublicacion: dateStr,
            urlPdf: url.startsWith("http") ? url : `https://busquedas.elperuano.pe${url}`,
          });
        }
      }

      if (norms.length > 0) return norms;
    }
  } catch {
    // scraping failed
  }

  return [];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const isAdmin = await verifyAdmin(req, supabase);
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.replace("/fetch-normas", "");

    // POST /import — fetch norms for a specific date and import them
    if (req.method === "POST" && (path === "/import" || path === "" || path === "/")) {
      const body = await req.json();
      const { date } = body;

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return new Response(
          JSON.stringify({ error: "Se requiere una fecha valida (YYYY-MM-DD)" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Fetch norms from El Peruano
      const norms = await fetchNormsFromElPeruano(date);

      if (norms.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            imported: 0,
            skipped: 0,
            message: `No se encontraron normas para el ${date}. Es posible que El Peruano no haya publicado ese dia o que el formato de su pagina haya cambiado.`,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check which norms already exist (by title + date to avoid duplicates)
      const { data: existingNorms } = await supabase
        .from("repository_norms")
        .select("title, published_date")
        .eq("published_date", date);

      const existingTitles = new Set(
        (existingNorms || []).map((n: any) =>
          n.title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
        )
      );

      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const norm of norms) {
        const title = norm.nombre.trim();
        if (!title || title.length < 5) {
          skipped++;
          continue;
        }

        const normalizedTitle = title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();

        if (existingTitles.has(normalizedTitle)) {
          skipped++;
          continue;
        }

        const { norm_type, norm_number } = parseNormType(title);

        const baseSlug = slugify(title);
        const uniqueSlug = `${baseSlug}-${norm.edicionId || Date.now()}`;

        const pdfUrl = norm.urlPdf
          ? norm.urlPdf.startsWith("http")
            ? norm.urlPdf
            : `https://busquedas.elperuano.pe${norm.urlPdf}`
          : null;

        const { error: insertError } = await supabase
          .from("repository_norms")
          .insert({
            slug: uniqueSlug.slice(0, 120),
            title,
            norm_type,
            norm_number,
            published_date: date,
            content: "",
            summary: `Norma importada automaticamente desde El Peruano (${date}).`,
            pdf_url: pdfUrl,
            is_hidden: true,
          });

        if (insertError) {
          if (insertError.code === "23505") {
            skipped++;
          } else {
            errors.push(`Error al importar "${title.slice(0, 50)}...": ${insertError.message}`);
          }
        } else {
          imported++;
          existingTitles.add(normalizedTitle);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          total_found: norms.length,
          imported,
          skipped,
          errors: errors.length > 0 ? errors : undefined,
          message: `Se encontraron ${norms.length} normas. ${imported} importadas, ${skipped} omitidas (ya existian o eran invalidas).`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // GET /preview — fetch norms without importing (preview)
    if (req.method === "GET" && path === "/preview") {
      const date = url.searchParams.get("date");
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return new Response(
          JSON.stringify({ error: "Se requiere una fecha valida (YYYY-MM-DD)" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const norms = await fetchNormsFromElPeruano(date);

      return new Response(
        JSON.stringify({
          date,
          total: norms.length,
          norms: norms.map((n) => ({
            title: n.nombre,
            ...parseNormType(n.nombre),
            pdf_url: n.urlPdf,
            edicion_id: n.edicionId,
          })),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Ruta no encontrada" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: `Error interno: ${err.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
