import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Publication {
  id: string;
  titre: string;
  resume?: string;
  annee: number;
  mois?: number;
  type: string;
  journal?: string;
  conference?: string;
  volume?: string;
  numero?: string;
  pages?: string;
  doi?: string;
  url?: string;
  pdf_url?: string;
  nombre_citations?: number;
  nombre_lectures?: number;
  quartile?: string;
  impact_factor?: number;
  mots_cles?: string[];
  est_peer_reviewed?: boolean;
  est_publie?: boolean;
  langue?: string;
  editeur?: string;
  isbn?: string;
  issn?: string;
  created_at?: string;
  auteurs?: Array<{
    chercheur_id: string;
    ordre: number;
    est_correspondant?: boolean;
    chercheur?: { nom: string; prenom: string };
  }>;
}

export interface PublicationsFilters {
  search?: string;
  annee?: number;
  type?: string;
  quartile?: string;
  chercheur_id?: string;
  est_publie?: boolean;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PublicationsResponse {
  data: Publication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function usePublicationsAPI() {
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

  const fetchPublications = useCallback(async (filters: PublicationsFilters = {}): Promise<PublicationsResponse | null> => {
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
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/publications-api?${params}`,
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

  const getPublication = useCallback(async (id: string): Promise<Publication | null> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/publications-api?id=${id}`,
        { method: 'GET', headers }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Publication non trouvée');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const createPublication = useCallback(async (data: Partial<Publication> & { auteurs?: string[] }): Promise<Publication | null> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/publications-api`,
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
        description: 'Publication créée avec succès',
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

  const updatePublication = useCallback(async (id: string, data: Partial<Publication>): Promise<Publication | null> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/publications-api?id=${id}`,
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
        description: 'Publication mise à jour avec succès',
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

  const deletePublication = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/publications-api?id=${id}`,
        { method: 'DELETE', headers }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      toast({
        title: 'Succès',
        description: 'Publication supprimée avec succès',
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
    fetchPublications,
    getPublication,
    createPublication,
    updatePublication,
    deletePublication,
  };
}
