import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    // GET - List all provinces or get single province
    if (req.method === 'GET') {
      if (id) {
        const { data, error } = await supabase
          .from('provinces')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('provinces')
        .select('*')
        .order('nom', { ascending: true });

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For POST, PUT, DELETE - require admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Token invalide' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Accès réservé aux administrateurs' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Create province
    if (req.method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('provinces')
        .insert({
          nom: body.nom,
          code: body.code,
          chef_lieu: body.chef_lieu,
          description: body.description,
          population: body.population,
          superficie: body.superficie,
        })
        .select()
        .single();

      if (error) throw error;
      console.log(`Province créée: ${data.nom} par ${user.email}`);
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT - Update province
    if (req.method === 'PUT') {
      if (!id) {
        return new Response(JSON.stringify({ error: 'ID requis' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = await req.json();
      const { data, error } = await supabase
        .from('provinces')
        .update({
          nom: body.nom,
          code: body.code,
          chef_lieu: body.chef_lieu,
          description: body.description,
          population: body.population,
          superficie: body.superficie,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log(`Province mise à jour: ${data.nom} par ${user.email}`);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE - Delete province
    if (req.method === 'DELETE') {
      if (!id) {
        return new Response(JSON.stringify({ error: 'ID requis' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabase
        .from('provinces')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log(`Province supprimée: ${id} par ${user.email}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Méthode non supportée' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur provinces-api:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
