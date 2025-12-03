import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Chercheur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  specialite?: string;
  grade?: string;
  h_index?: number;
  i10_index?: number;
  total_citations?: number;
  nombre_publications?: number;
  photo_url?: string;
  biographie?: string;
  domaines_recherche?: string[];
  orcid?: string;
  google_scholar_id?: string;
  linkedin_url?: string;
  centre_id?: string;
  province_id?: string;
  est_actif?: boolean;
  created_at?: string;
  centre?: { nom: string; acronyme?: string };
  province?: { nom: string };
}

export interface ChercheursFilters {
  search?: string;
  grade?: string;
  specialite?: string;
  centre_id?: string;
  province_id?: string;
  est_actif?: boolean;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ChercheursResponse {
  data: Chercheur[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useChercheursAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getAuthHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  const fetchChercheurs = useCallback(async (filters: ChercheursFilters = {}): Promise<ChercheursResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chercheurs-api?${params}`,
        { method: 'GET', headers }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération');
      }

      return await response.json();
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

  const getChercheur = useCallback(async (id: string): Promise<Chercheur | null> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chercheurs-api?id=${id}`,
        { method: 'GET', headers }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Chercheur non trouvé');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const createChercheur = useCallback(async (data: Partial<Chercheur>): Promise<Chercheur | null> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chercheurs-api`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création');
      }

      const result = await response.json();
      toast({
        title: 'Succès',
        description: 'Chercheur créé avec succès',
      });
      return result;
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

  const updateChercheur = useCallback(async (id: string, data: Partial<Chercheur>): Promise<Chercheur | null> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chercheurs-api?id=${id}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      const result = await response.json();
      toast({
        title: 'Succès',
        description: 'Chercheur mis à jour avec succès',
      });
      return result;
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

  const deleteChercheur = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chercheurs-api?id=${id}`,
        { method: 'DELETE', headers }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      toast({
        title: 'Succès',
        description: 'Chercheur désactivé avec succès',
      });
      return true;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, toast]);

  return {
    loading,
    error,
    fetchChercheurs,
    getChercheur,
    createChercheur,
    updateChercheur,
    deleteChercheur,
  };
}
