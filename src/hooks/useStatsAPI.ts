import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DashboardStats {
  chercheurs: {
    total: number;
    actifs: number;
    parGrade: Record<string, number>;
    parProvince: Record<string, number>;
  };
  publications: {
    total: number;
    cetteAnnee: number;
    parType: Record<string, number>;
    parQuartile: Record<string, number>;
    parAnnee: Record<string, number>;
  };
  centres: {
    total: number;
    actifs: number;
    parProvince: Record<string, number>;
  };
  projets: {
    total: number;
    enCours: number;
    parStatut: Record<string, number>;
  };
  metriques: {
    hIndexMoyen: number;
    citationsTotales: number;
    collaborationsTotales: number;
  };
  topChercheurs: Array<{
    id: string;
    nom: string;
    prenom: string;
    h_index: number;
    nombre_publications: number;
    total_citations: number;
  }>;
  activiteRecente: Array<{
    id: string;
    action: string;
    table_name: string;
    timestamp: string;
    user_id: string;
  }>;
}

export function useStatsAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { toast } = useToast();

  const getAuthHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  const fetchStats = useCallback(async (): Promise<DashboardStats | null> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stats-dashboard`,
        { method: 'GET', headers }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des statistiques');
      }

      const data = await response.json();
      setStats(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, toast]);

  return {
    loading,
    error,
    stats,
    fetchStats,
  };
}
