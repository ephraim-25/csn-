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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const publicationsIndex = pathParts.indexOf('publications-api');
    const action = pathParts[publicationsIndex + 1] || 'list';

    // GET: List publications with filters
    if (req.method === 'GET' && action === 'list') {
      const annee = url.searchParams.get('annee');
      const type = url.searchParams.get('type');
      const quartile = url.searchParams.get('quartile');
      const chercheur_id = url.searchParams.get('chercheur_id');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = supabase
        .from('publications')
        .select(`
          *,
          auteurs:auteurs_publications(
            ordre,
            est_correspondant,
            chercheur:chercheurs(id, nom, prenom, photo_url)
          )
        `, { count: 'exact' })
        .eq('est_publie', true)
        .order('annee', { ascending: false });

      if (annee) query = query.eq('annee', annee);
      if (type) query = query.eq('type', type);
      if (quartile) query = query.eq('quartile', quartile);
      
      if (chercheur_id) {
        const { data: publications } = await supabase
          .from('auteurs_publications')
          .select('publication_id')
          .eq('chercheur_id', chercheur_id);
        
        if (publications && publications.length > 0) {
          const pubIds = publications.map(p => p.publication_id);
          query = query.in('id', pubIds);
        }
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

    // GET: Single publication
    if (req.method === 'GET' && action !== 'list') {
      const publicationId = action;

      const { data, error } = await supabase
        .from('publications')
        .select(`
          *,
          auteurs:auteurs_publications(
            ordre,
            est_correspondant,
            affiliation_publication,
            chercheur:chercheurs(*)
          ),
          commentaires:commentaires_publications(
            *,
            user:profiles(full_name, email)
          )
        `)
        .eq('id', publicationId)
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST: Create publication
    if (req.method === 'POST') {
      const body = await req.json();

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

      const { auteurs, ...publicationData } = body;

      // Create publication
      const { data: publication, error: pubError } = await supabase
        .from('publications')
        .insert(publicationData)
        .select()
        .single();

      if (pubError) throw pubError;

      // Add auteurs
      if (auteurs && auteurs.length > 0) {
        const { error: auteursError } = await supabase
          .from('auteurs_publications')
          .insert(
            auteurs.map((auteur: any, index: number) => ({
              publication_id: publication.id,
              chercheur_id: auteur.chercheur_id,
              ordre: auteur.ordre || index + 1,
              est_correspondant: auteur.est_correspondant || false,
              affiliation_publication: auteur.affiliation_publication,
            }))
          );

        if (auteursError) throw auteursError;

        // Update chercheur stats for each auteur
        for (const auteur of auteurs) {
          await supabase.rpc('update_chercheur_stats', { 
            chercheur_uuid: auteur.chercheur_id 
          });
        }
      }

      console.log('[PUBLICATIONS-API] Created publication:', publication.id);

      return new Response(
        JSON.stringify({ data: publication, message: 'Publication créée avec succès' }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT: Update publication
    if (req.method === 'PUT') {
      const body = await req.json();
      const publicationId = body.id;

      if (!publicationId) {
        return new Response(
          JSON.stringify({ error: 'Publication ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

      const { auteurs, ...publicationData } = body;

      const { data, error } = await supabase
        .from('publications')
        .update(publicationData)
        .eq('id', publicationId)
        .select()
        .single();

      if (error) throw error;

      // Update auteurs if provided
      if (auteurs) {
        // Delete existing auteurs
        await supabase
          .from('auteurs_publications')
          .delete()
          .eq('publication_id', publicationId);

        // Add new auteurs
        if (auteurs.length > 0) {
          await supabase
            .from('auteurs_publications')
            .insert(
              auteurs.map((auteur: any, index: number) => ({
                publication_id: publicationId,
                chercheur_id: auteur.chercheur_id,
                ordre: auteur.ordre || index + 1,
                est_correspondant: auteur.est_correspondant || false,
                affiliation_publication: auteur.affiliation_publication,
              }))
            );
        }
      }

      console.log('[PUBLICATIONS-API] Updated publication:', publicationId);

      return new Response(
        JSON.stringify({ data, message: 'Publication mise à jour avec succès' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE: Delete publication
    if (req.method === 'DELETE') {
      const publicationId = url.searchParams.get('id');

      if (!publicationId) {
        return new Response(
          JSON.stringify({ error: 'Publication ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

      const { error } = await supabase
        .from('publications')
        .delete()
        .eq('id', publicationId);

      if (error) throw error;

      console.log('[PUBLICATIONS-API] Deleted publication:', publicationId);

      return new Response(
        JSON.stringify({ message: 'Publication supprimée avec succès' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PUBLICATIONS-API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
