import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchParams {
  nom?: string;
  prenom?: string;
  grade?: string;
  centre_id?: string;
  province_id?: string;
  specialite?: string;
  limit?: number;
  offset?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const chercheursIndex = pathParts.indexOf('chercheurs-api');
    const action = pathParts[chercheursIndex + 1] || 'list';

    // Define public fields that can be shown to everyone (no PII)
    const PUBLIC_FIELDS = [
      'id', 'nom', 'prenom', 'nom_complet', 'grade', 'specialite',
      'domaines_recherche', 'institution_principale', 'photo_url',
      'h_index', 'i10_index', 'total_citations', 'nombre_publications',
      'centre_id', 'province_id', 'biographie', 'orcid', 'google_scholar_id',
      'researchgate_id', 'est_actif', 'created_at'
    ];
    
    // Sensitive fields that should only be visible to owner or admin
    const SENSITIVE_FIELDS = [
      'email', 'telephone', 'adresse', 'ville', 'date_naissance',
      'lieu_naissance', 'nationalite', 'sexe', 'cv_url', 'linkedin_url',
      'matricule', 'user_id'
    ];

    // Helper function to filter sensitive data
    const filterSensitiveData = (chercheur: any, isOwner: boolean, isAdmin: boolean) => {
      if (isOwner || isAdmin) {
        return chercheur; // Return full data
      }
      // Filter out sensitive fields for public access
      const filtered = { ...chercheur };
      SENSITIVE_FIELDS.forEach(field => {
        delete filtered[field];
      });
      return filtered;
    };

    // Get current user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    // Check if user is admin
    let isAdmin = false;
    if (user) {
      const { data: adminCheck } = await supabase.rpc('is_admin_or_moderator', { 
        user_uuid: user.id 
      });
      isAdmin = adminCheck === true;
    }

    // GET: List chercheurs with filters
    if (req.method === 'GET' && action === 'list') {
      const searchParams: SearchParams = {
        nom: url.searchParams.get('nom') || undefined,
        prenom: url.searchParams.get('prenom') || undefined,
        grade: url.searchParams.get('grade') || undefined,
        centre_id: url.searchParams.get('centre_id') || undefined,
        province_id: url.searchParams.get('province_id') || undefined,
        specialite: url.searchParams.get('specialite') || undefined,
        limit: parseInt(url.searchParams.get('limit') || '50'),
        offset: parseInt(url.searchParams.get('offset') || '0'),
      };

      let query = supabase
        .from('chercheurs')
        .select(`
          *,
          centre:centres_recherche!chercheurs_centre_id_fkey(id, nom, acronyme),
          province:provinces(id, nom),
          publications:auteurs_publications(count)
        `, { count: 'exact' })
        .eq('est_actif', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (searchParams.nom) {
        query = query.ilike('nom', `%${searchParams.nom}%`);
      }
      if (searchParams.prenom) {
        query = query.ilike('prenom', `%${searchParams.prenom}%`);
      }
      if (searchParams.grade) {
        query = query.eq('grade', searchParams.grade);
      }
      if (searchParams.centre_id) {
        query = query.eq('centre_id', searchParams.centre_id);
      }
      if (searchParams.province_id) {
        query = query.eq('province_id', searchParams.province_id);
      }
      if (searchParams.specialite) {
        query = query.ilike('specialite', `%${searchParams.specialite}%`);
      }

      query = query.range(searchParams.offset!, searchParams.offset! + searchParams.limit! - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Filter sensitive data for each chercheur
      const filteredData = data?.map(chercheur => {
        const isOwner = user?.id === chercheur.user_id;
        return filterSensitiveData(chercheur, isOwner, isAdmin);
      }) || [];

      console.log(`[CHERCHEURS-API] Listed ${filteredData.length} chercheurs (admin: ${isAdmin})`);

      return new Response(
        JSON.stringify({ 
          data: filteredData, 
          count,
          page: Math.floor(searchParams.offset! / searchParams.limit!) + 1,
          total_pages: Math.ceil((count || 0) / searchParams.limit!)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET: Get single chercheur by ID
    if (req.method === 'GET' && action !== 'list') {
      const chercheurId = action;

      const { data, error } = await supabase
        .from('chercheurs')
        .select(`
          *,
          centre:centres_recherche!chercheurs_centre_id_fkey(*),
          province:provinces(*),
          departement:departements(*),
          publications:auteurs_publications(
            *,
            publication:publications(*)
          ),
          collaborations:collaborations!chercheur1_id(
            *,
            collaborateur:chercheurs!chercheur2_id(id, nom, prenom, specialite, photo_url)
          ),
          projets:membres_projet(
            *,
            projet:projets_recherche(*)
          ),
          prix:prix_distinctions(*)
        `)
        .eq('id', chercheurId)
        .single();

      if (error) throw error;

      // Filter sensitive data based on user access
      const isOwner = user?.id === data.user_id;
      const filteredData = filterSensitiveData(data, isOwner, isAdmin);

      // Get stats
      const { data: stats } = await supabase.rpc('get_chercheur_stats', { 
        chercheur_uuid: chercheurId 
      });

      console.log(`[CHERCHEURS-API] Retrieved chercheur ${chercheurId} (owner: ${isOwner}, admin: ${isAdmin})`);

      return new Response(
        JSON.stringify({ data: { ...filteredData, stats } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST: Create new chercheur
    if (req.method === 'POST') {
      const body = await req.json();

      // Verify admin or moderateur
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

      const { data, error } = await supabase
        .from('chercheurs')
        .insert({
          ...body,
          derniere_mise_a_jour: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[CHERCHEURS-API] Created chercheur:', data.id);

      return new Response(
        JSON.stringify({ data, message: 'Chercheur créé avec succès' }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT: Update chercheur
    if (req.method === 'PUT') {
      const body = await req.json();
      const chercheurId = body.id;

      if (!chercheurId) {
        return new Response(
          JSON.stringify({ error: 'Chercheur ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify user is owner or admin
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user owns this chercheur profile or is admin
      const { data: chercheur } = await supabase
        .from('chercheurs')
        .select('user_id')
        .eq('id', chercheurId)
        .single();

      const { data: isAdmin } = await supabase.rpc('is_admin_or_moderator', { 
        user_uuid: user.id 
      });

      if (chercheur?.user_id !== user.id && !isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: You can only update your own profile' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('chercheurs')
        .update({
          ...body,
          derniere_mise_a_jour: new Date().toISOString(),
        })
        .eq('id', chercheurId)
        .select()
        .single();

      if (error) throw error;

      console.log('[CHERCHEURS-API] Updated chercheur:', chercheurId);

      return new Response(
        JSON.stringify({ data, message: 'Chercheur mis à jour avec succès' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE: Delete chercheur
    if (req.method === 'DELETE') {
      const chercheurId = url.searchParams.get('id');

      if (!chercheurId) {
        return new Response(
          JSON.stringify({ error: 'Chercheur ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify admin
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

      // Soft delete (set est_actif = false)
      const { error } = await supabase
        .from('chercheurs')
        .update({ est_actif: false })
        .eq('id', chercheurId);

      if (error) throw error;

      console.log('[CHERCHEURS-API] Deleted chercheur:', chercheurId);

      return new Response(
        JSON.stringify({ message: 'Chercheur supprimé avec succès' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[CHERCHEURS-API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
