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

    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'csv'; // csv, json, excel
    const table = url.searchParams.get('table') || 'chercheurs';

    let data: any = null;
    let filename = '';

    // Fetch data based on table
    switch (table) {
      case 'chercheurs':
        const { data: chercheurs } = await supabase
          .from('chercheurs')
          .select(`
            id, nom, prenom, email, telephone, 
            grade, specialite, h_index, i10_index, 
            nombre_publications, total_citations,
            centre:centres_recherche(nom),
            province:provinces(nom)
          `);
        data = chercheurs;
        filename = `chercheurs_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'publications':
        const { data: publications } = await supabase
          .from('publications')
          .select(`
            id, titre, annee, type, journal, conference,
            doi, quartile, nombre_citations,
            auteurs:auteurs_publications(
              chercheur:chercheurs(nom, prenom)
            )
          `);
        data = publications;
        filename = `publications_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'centres':
        const { data: centres } = await supabase
          .from('centres_recherche')
          .select(`
            id, nom, acronyme, adresse, email, telephone,
            nombre_chercheurs, budget_annuel,
            province:provinces(nom)
          `);
        data = centres;
        filename = `centres_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'projets':
        const { data: projets } = await supabase
          .from('projets_recherche')
          .select(`
            id, titre, acronyme, statut, date_debut, date_fin_prevue,
            budget_total, source_financement,
            centre:centres_recherche(nom)
          `);
        data = projets;
        filename = `projets_export_${new Date().toISOString().split('T')[0]}`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid table specified' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No data found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Export based on format
    if (format === 'json') {
      console.log(`[EXPORT-DATA] Exported ${table} as JSON for user:`, user.id);
      return new Response(
        JSON.stringify(data, null, 2),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${filename}.json"`,
          } 
        }
      );
    }

    if (format === 'csv') {
      // Convert to CSV
      const flatData = data.map((row: any) => flattenObject(row));
      const headers = Object.keys(flatData[0]);
      const csv = [
        headers.join(','),
        ...flatData.map((row: any) => 
          headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      console.log(`[EXPORT-DATA] Exported ${table} as CSV for user:`, user.id);
      return new Response(
        csv,
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}.csv"`,
          } 
        }
      );
    }

    // For Excel format, return data as JSON with metadata for frontend to handle
    if (format === 'excel') {
      console.log(`[EXPORT-DATA] Prepared ${table} for Excel export for user:`, user.id);
      return new Response(
        JSON.stringify({ 
          data: data.map((row: any) => flattenObject(row)),
          filename,
          message: 'Use a frontend library like xlsx to convert this to Excel'
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
          } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid format specified. Use: json, csv, or excel' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[EXPORT-DATA] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to flatten nested objects
function flattenObject(obj: any, prefix = ''): any {
  return Object.keys(obj).reduce((acc: any, key: string) => {
    const pre = prefix.length ? prefix + '_' : '';
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], pre + key));
    } else if (Array.isArray(obj[key])) {
      acc[pre + key] = JSON.stringify(obj[key]);
    } else {
      acc[pre + key] = obj[key];
    }
    return acc;
  }, {});
}
