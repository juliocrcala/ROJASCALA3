import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ADMIN_EMAIL = "rojas.ca.la.admi@gmail.com";
const BASE_URL = "https://busquedas.elperuano.pe";
const PAGE_SIZE = 20;

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

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNormType(title: string): {
  norm_type: string;
  norm_number: string;
} {
  const patterns: [RegExp, boolean][] = [
    [/^(LEY)\s+N[°ºo.]?\s*(\d[\d.-]*)/i, true],
    [/^(DECRETO\s+SUPREMO)\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i, true],
    [/^(DECRETO\s+LEGISLATIVO)\s+N[°ºo.]?\s*(\d[\d.-]*)/i, true],
    [/^(DECRETO\s+DE\s+URGENCIA)\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i, true],
    [/^(RESOLUCI[OÓ]N\s+MINISTERIAL)\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i, true],
    [/^(RESOLUCI[OÓ]N\s+SUPREMA)\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i, true],
    [/^(RESOLUCI[OÓ]N\s+DIRECTORAL)\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i, true],
    [
      /^(RESOLUCI[OÓ]N\s+(?:DE\s+)?(?:SUPERINTENDENCIA|JEFATURAL|ADMINISTRATIVA|VICEMINISTERIAL|GERENCIA\s+GENERAL|PRESIDENCIA\s+EJECUTIVA))\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i,
      true,
    ],
    [/^(ORDENANZA)\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i, true],
    [/^(ACUERDO)\s+N[°ºo.]?\s*(\d[\d.-]*\S*)/i, true],
    [/^(FE\s+DE\s+ERRATAS)/i, false],
    [/^(ANEXO)\s*/i, false],
    [/^(COMUNICADO)\s*/i, false],
  ];

  for (const [pattern, hasNumber] of patterns) {
    const match = title.match(pattern);
    if (match) {
      return {
        norm_type: match[1].trim(),
        norm_number: hasNumber ? match[2]?.trim() || "" : "",
      };
    }
  }

  return { norm_type: "", norm_number: "" };
}

interface ParsedNorm {
  op: string;
  sector: string;
  tipo_dispositivo: string;
  numero: string;
  fecha: string;
  titulo: string;
  url: string;
}

async function fetchSearchPage(
  fecha: string,
  start: number
): Promise<string> {
  const params = new URLSearchParams({
    tipoPublicacion: "NL",
    ci: "ONLY",
    fecha: fecha,
    start: String(start),
  });

  const url = `${BASE_URL}/?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "es-PE,es;q=0.9,en;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from El Peruano`);
  }

  const text = await response.text();
  const mainEnd = text.indexOf("</main>");
  if (mainEnd > 0) {
    return text.slice(0, mainEnd + 7);
  }
  return text.slice(0, 2 * 1024 * 1024);
}

function parseTotal(body: string): number | null {
  const m = body.match(/(\d+)\s*(?:<!--\s*-->\s*){1,2}[a-zA-Z ]*?encontrad[oa]s?/);
  return m ? parseInt(m[1], 10) : null;
}

function parseCards(body: string): ParsedNorm[] {
  const cardSplitRe =
    /<div class="rounded-xl border bg-card text-card-foreground shadow flex h-full flex-col/g;
  const chunks: string[] = [];
  let lastIndex = 0;
  let match;

  const splitPositions: number[] = [];
  while ((match = cardSplitRe.exec(body)) !== null) {
    splitPositions.push(match.index);
  }

  for (let i = 0; i < splitPositions.length; i++) {
    const start = splitPositions[i];
    const end =
      i + 1 < splitPositions.length ? splitPositions[i + 1] : body.length;
    chunks.push(body.slice(start, end));
  }

  const results: ParsedNorm[] = [];

  const linkRe = /href="\/dispositivo\/([A-Z]{2})\/(\d+-\d+)"/;
  const sectorRe =
    /<p class="text-sm font-semibold text-primary">([^<]*)<\/p>/;
  const tipoDispRe =
    /<p class="text-xs text-muted-foreground">([^<]*)<\/p>/;
  const numeroRe =
    /<p class="text-xs font-medium text-muted-foreground">([^<]*)<\/p>/;
  const spansRe = /<span>([^<]*)<\/span>\s*<span>([^<]*)<\/span>/;
  const snippetRe =
    /<a class="[^"]*(?:line-clamp-2|line-clamp-3)[^"]*"[^>]*>([\s\S]*?)<\/a>/;

  for (const chunk of chunks) {
    const lnk = chunk.match(linkRe);
    if (!lnk) continue;

    const sectorMatch = chunk.match(sectorRe);
    const tipoMatch = chunk.match(tipoDispRe);
    const numMatch = chunk.match(numeroRe);
    const spanMatch = chunk.match(spansRe);
    const snipMatch = chunk.match(snippetRe);

    results.push({
      op: lnk[2],
      sector: cleanHtml(sectorMatch?.[1] || ""),
      tipo_dispositivo: cleanHtml(tipoMatch?.[1] || ""),
      numero: cleanHtml(numMatch?.[1] || ""),
      fecha: cleanHtml(spanMatch?.[2] || spanMatch?.[1] || ""),
      titulo: cleanHtml(snipMatch?.[1] || ""),
      url: `${BASE_URL}/dispositivo/${lnk[1]}/${lnk[2]}`,
    });
  }

  return results;
}

async function fetchNormsFromElPeruano(
  dateStr: string
): Promise<ParsedNorm[]> {
  // dateStr: "2026-09-29" -> "20260929"
  const fechaParam = dateStr.replace(/-/g, "");

  const allNorms: ParsedNorm[] = [];
  const seenOps = new Set<string>();
  let start = 0;
  let maxPages = 15;

  for (let page = 0; page < maxPages; page++) {
    const body = await fetchSearchPage(fechaParam, start);

    if (page === 0) {
      const total = parseTotal(body);
      if (total !== null && total > 0) {
        maxPages = Math.min(15, Math.ceil(total / PAGE_SIZE));
      }
    }

    const cards = parseCards(body);
    if (cards.length === 0) break;

    for (const card of cards) {
      if (!seenOps.has(card.op)) {
        seenOps.add(card.op);
        allNorms.push(card);
      }
    }

    const hasMore = body.includes(`start=${start + PAGE_SIZE}`);
    if (!hasMore) break;
    start += PAGE_SIZE;
  }

  return allNorms;
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

    if (
      req.method === "POST" &&
      (path === "/import" || path === "" || path === "/")
    ) {
      const body = await req.json();
      const { date } = body;

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return new Response(
          JSON.stringify({
            error: "Se requiere una fecha valida (YYYY-MM-DD)",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const norms = await fetchNormsFromElPeruano(date);

      if (norms.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            imported: 0,
            skipped: 0,
            message: `No se encontraron normas para el ${date}. Es posible que El Peruano no haya publicado ese dia o que su pagina haya cambiado.`,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

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
        const title = norm.titulo || norm.tipo_dispositivo || "";
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
        const uniqueSlug = `${baseSlug}-${norm.op || Date.now()}`;

        const { error: insertError } = await supabase
          .from("repository_norms")
          .insert({
            slug: uniqueSlug.slice(0, 120),
            title,
            norm_type: norm_type || norm.tipo_dispositivo || "",
            norm_number: norm_number || norm.numero || "",
            published_date: date,
            content: "",
            summary: norm.sector
              ? `${norm.sector} — Importado de El Peruano (${date}).`
              : `Importado automaticamente de El Peruano (${date}).`,
            pdf_url: norm.url || null,
            is_hidden: false,
          });

        if (insertError) {
          if (insertError.code === "23505") {
            skipped++;
          } else {
            errors.push(
              `Error "${title.slice(0, 50)}...": ${insertError.message}`
            );
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
          message: `Se encontraron ${norms.length} normas en El Peruano. ${imported} importadas, ${skipped} omitidas (ya existian o eran muy cortas).`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "GET" && path === "/preview") {
      const date = url.searchParams.get("date");
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return new Response(
          JSON.stringify({
            error: "Se requiere una fecha valida (YYYY-MM-DD)",
          }),
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
            title: n.titulo,
            tipo_dispositivo: n.tipo_dispositivo,
            numero: n.numero,
            sector: n.sector,
            fecha: n.fecha,
            url: n.url,
            op: n.op,
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
