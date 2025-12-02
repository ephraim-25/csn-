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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const centresIndex = pathParts.indexOf('centres-api');
    const action = pathParts[centresIndex + 1] || 'list';

    // GET: List centres (public endpoint)
    if (req.method === 'GET' && action === 'list') {
      const province_id = url.searchParams.get('province_id');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = supabase
        .from('centres_recherche')
        .select(`
          *,
          province:provinces(id, nom, code),
          directeur:chercheurs!directeur_id(id, nom, prenom, photo_url),
          departements:departements(count)
        `, { count: 'exact' })
        .eq('est_actif', true)
        .order('nom', { ascending: true });

      if (province_id) {
        query = query.eq('province_id', province_id);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          data, 
          count,
          page: Math.floor(offset / limit) + 1,
          total_pages: Math.ceil((count || 0) / limit)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET: Single centre (public endpoint)
    if (req.method === 'GET' && action !== 'list') {
      const centreId = action;

      const { data, error } = await supabase
        .from('centres_recherche')
        .select(`
          *,
          province:provinces(*),
          directeur:chercheurs!directeur_id(*),
          departements:departements(
            *,
            responsable:chercheurs!responsable_id(id, nom, prenom)
          ),
          chercheurs:chercheurs(
            id, nom, prenom, grade, specialite, photo_url, h_index
          ),
          projets:projets_recherche(
            id, titre, statut, date_debut
          ),
          partenariats:partenariats(
            id, nom_partenaire, type, pays
          )
        `)
        .eq('id', centreId)
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST: Create centre (admin only)
    if (req.method === 'POST') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: isAdmin } = await supabase.rpc('is_admin_or_moderator', { 
        user_uuid: user.id 
      });

      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Admin or Moderator role required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();

      const { data, error } = await supabase
        .from('centres_recherche')
        .insert(body)
        .select()
        .single();

      if (error) throw error;

      console.log('[CENTRES-API] Created centre:', data.id);

      return new Response(
        JSON.stringify({ data, message: 'Centre créé avec succès' }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT: Update centre (admin only)
    if (req.method === 'PUT') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: isAdmin } = await supabase.rpc('is_admin_or_moderator', { 
        user_uuid: user.id 
      });

      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Admin or Moderator role required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const centreId = body.id;

      if (!centreId) {
        return new Response(
          JSON.stringify({ error: 'Centre ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('centres_recherche')
        .update(body)
        .eq('id', centreId)
        .select()
        .single();

      if (error) throw error;

      console.log('[CENTRES-API] Updated centre:', centreId);

      return new Response(
        JSON.stringify({ data, message: 'Centre mis à jour avec succès' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE: Delete centre (admin only)
    if (req.method === 'DELETE') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: isAdmin } = await supabase.rpc('has_role', { 
        _user_id: user.id,
        _role: 'admin' 
      });

      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Admin role required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const centreId = url.searchParams.get('id');

      if (!centreId) {
        return new Response(
          JSON.stringify({ error: 'Centre ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Soft delete
      const { error } = await supabase
        .from('centres_recherche')
        .update({ est_actif: false })
        .eq('id', centreId);

      if (error) throw error;

      console.log('[CENTRES-API] Deleted centre:', centreId);

      return new Response(
        JSON.stringify({ message: 'Centre supprimé avec succès' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[CENTRES-API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
