import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || '*';
const ADMIN_EMAIL = 'rojas.ca.la.admi@gmail.com';

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  "Access-Control-Allow-Credentials": "true",
};

const adminCorsHeaders = {
  ...corsHeaders,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const MAX_REQUESTS = 5;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

function isValidName(name: string): boolean {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,100}$/;
  return nameRegex.test(name);
}

async function verifyAdmin(req: Request, supabase: any): Promise<boolean> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user || user.email !== ADMIN_EMAIL) {
    return false;
  }

  return true;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: adminCorsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const url = new URL(req.url);
    const path = url.pathname.replace('/newsletter', '');
    const method = req.method;

    if (method === 'GET' && path === '/subscribers') {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const isAdmin = await verifyAdmin(req, supabase);

      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('newsletter')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data || []), {
        headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'POST' && path === '/subscribe') {
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                       req.headers.get('x-real-ip') ||
                       'unknown';

      if (!checkRateLimit(clientIp)) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const body = await req.json();
      const { name, email, ip_address, user_agent } = body;

      if (!email || !isValidEmail(email)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email address' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (!name || !isValidName(name)) {
        return new Response(
          JSON.stringify({ error: 'Invalid name. Only letters and spaces allowed (2-100 characters)' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data, error } = await supabase
        .from('newsletter')
        .insert([{
          name: name.trim(),
          email: email.toLowerCase().trim(),
          ip_address,
          user_agent
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return new Response(
            JSON.stringify({ error: 'Email already subscribed' }),
            {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        console.error('Newsletter subscription error:', error);
        throw error;
      }

      return new Response(JSON.stringify({ success: true, id: data.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'PUT' && path.startsWith('/subscribers/')) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const isAdmin = await verifyAdmin(req, supabase);

      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const id = path.replace('/subscribers/', '');
      const body = await req.json();
      const { is_active } = body;

      if (typeof is_active !== 'boolean') {
        return new Response(
          JSON.stringify({ error: 'Invalid request' }),
          {
            status: 400,
            headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const { data, error } = await supabase
        .from('newsletter')
        .update({
          is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'DELETE' && path.startsWith('/subscribers/')) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const isAdmin = await verifyAdmin(req, supabase);

      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const id = path.replace('/subscribers/', '');

      const { error } = await supabase
        .from('newsletter')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      {
        status: 404,
        headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      {
        status: 500,
        headers: { ...adminCorsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
