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

    // Verify admin access
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

    // Gather comprehensive statistics
    const [
      { count: totalChercheurs },
      { count: chercheursActifs },
      { count: totalPublications },
      { count: publicationsThisYear },
      { count: totalProjets },
      { count: projetsActifs },
      { count: totalCentres },
      { count: totalCollaborations },
      { data: topChercheurs },
      { data: recentPublications },
      { data: publicationsByYear },
      { data: publicationsByType },
    ] = await Promise.all([
      // Total chercheurs
      supabase.from('chercheurs').select('*', { count: 'exact', head: true }),
      
      // Chercheurs actifs
      supabase.from('chercheurs').select('*', { count: 'exact', head: true }).eq('est_actif', true),
      
      // Total publications
      supabase.from('publications').select('*', { count: 'exact', head: true }),
      
      // Publications cette année
      supabase.from('publications')
        .select('*', { count: 'exact', head: true })
        .eq('annee', new Date().getFullYear()),
      
      // Total projets
      supabase.from('projets_recherche').select('*', { count: 'exact', head: true }),
      
      // Projets actifs
      supabase.from('projets_recherche')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'en_cours'),
      
      // Total centres
      supabase.from('centres_recherche').select('*', { count: 'exact', head: true }),
      
      // Total collaborations
      supabase.from('collaborations').select('*', { count: 'exact', head: true }),
      
      // Top 10 chercheurs par publications
      supabase.from('chercheurs')
        .select('id, nom, prenom, specialite, nombre_publications, h_index, photo_url')
        .order('nombre_publications', { ascending: false })
        .limit(10),
      
      // Publications récentes
      supabase.from('publications')
        .select(`
          id, 
          titre, 
          annee, 
          type, 
          journal,
          auteurs:auteurs_publications(
            chercheur:chercheurs(nom, prenom)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20),
      
      // Publications par année (5 dernières années)
      supabase.from('publications')
        .select('annee')
        .gte('annee', new Date().getFullYear() - 5)
        .order('annee', { ascending: true }),
      
      // Publications par type
      supabase.from('publications')
        .select('type'),
    ]);

    // Process publications by year
    const pubsByYearMap = publicationsByYear?.reduce((acc: any, pub: any) => {
      acc[pub.annee] = (acc[pub.annee] || 0) + 1;
      return acc;
    }, {});

    const pubsByYearData = Object.entries(pubsByYearMap || {}).map(([annee, count]) => ({
      annee: parseInt(annee),
      count,
    }));

    // Process publications by type
    const pubsByTypeMap = publicationsByType?.reduce((acc: any, pub: any) => {
      acc[pub.type] = (acc[pub.type] || 0) + 1;
      return acc;
    }, {});

    const pubsByTypeData = Object.entries(pubsByTypeMap || {}).map(([type, count]) => ({
      type,
      count,
    }));

    // Calculate average H-index
    const { data: avgHIndex } = await supabase.rpc('get_chercheur_stats', { 
      chercheur_uuid: user.id 
    });

    // Get recent audit logs
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user:profiles(full_name, email)
      `)
      .order('timestamp', { ascending: false })
      .limit(50);

    const stats = {
      overview: {
        total_chercheurs: totalChercheurs,
        chercheurs_actifs: chercheursActifs,
        total_publications: totalPublications,
        publications_this_year: publicationsThisYear,
        total_projets: totalProjets,
        projets_actifs: projetsActifs,
        total_centres: totalCentres,
        total_collaborations: totalCollaborations,
      },
      top_chercheurs: topChercheurs,
      recent_publications: recentPublications,
      publications_by_year: pubsByYearData,
      publications_by_type: pubsByTypeData,
      recent_audit_logs: auditLogs,
      generated_at: new Date().toISOString(),
    };

    console.log('[STATS-DASHBOARD] Generated stats for admin:', user.id);

    return new Response(
      JSON.stringify({ data: stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[STATS-DASHBOARD] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
