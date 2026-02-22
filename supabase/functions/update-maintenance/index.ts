import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Admin-Token",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const adminToken = req.headers.get('X-Admin-Token');

    // Validar token de admin (hash simple del password almacenado en localStorage)
    // En producción, esto debería validar contra una tabla de usuarios admin
    if (!adminToken || adminToken !== 'admin-authenticated') {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { maintenance_mode } = await req.json();

    if (typeof maintenance_mode !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'maintenance_mode debe ser un booleano' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Crear cliente de Supabase con service role (tiene permisos totales)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Obtener el primer registro de site_settings
    const { data: settings, error: fetchError } = await supabaseAdmin
      .from('site_settings')
      .select('id')
      .limit(1)
      .single();

    if (fetchError || !settings) {
      return new Response(
        JSON.stringify({ error: 'Error al obtener configuración' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Actualizar el modo mantenimiento
    const { error: updateError } = await supabaseAdmin
      .from('site_settings')
      .update({ maintenance_mode, updated_at: new Date().toISOString() })
      .eq('id', settings.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Error al actualizar', details: updateError.message }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, maintenance_mode }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor', message: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
