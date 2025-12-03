import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Centre {
  id: string;
  nom: string;
  acronyme?: string;
  description?: string;
  adresse?: string;
  email?: string;
  telephone?: string;
  site_web?: string;
  logo_url?: string;
  directeur_id?: string;
  province_id?: string;
  date_creation?: string;
  budget_annuel?: number;
  nombre_chercheurs?: number;
  domaines_recherche?: string[];
  est_actif?: boolean;
  created_at?: string;
  directeur?: { nom: string; prenom: string };
  province?: { nom: string };
}

export interface CentresFilters {
  search?: string;
  province_id?: string;
  est_actif?: boolean;
  page?: number;
  limit?: number;
}

export interface CentresResponse {
  data: Centre[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useCentresAPI() {
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

  const fetchCentres = useCallback(async (filters: CentresFilters = {}): Promise<CentresResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      // Public endpoint - no auth required for GET
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/centres-api?${params}`,
        { method: 'GET' }
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
  }, [toast]);

  const getCentre = useCallback(async (id: string): Promise<Centre | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/centres-api?id=${id}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Centre non trouvé');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCentre = useCallback(async (data: Partial<Centre>): Promise<Centre | null> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/centres-api`,
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
        description: 'Centre créé avec succès',
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

  const updateCentre = useCallback(async (id: string, data: Partial<Centre>): Promise<Centre | null> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/centres-api?id=${id}`,
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
        description: 'Centre mis à jour avec succès',
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

  const deleteCentre = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/centres-api?id=${id}`,
        { method: 'DELETE', headers }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      toast({
        title: 'Succès',
        description: 'Centre désactivé avec succès',
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
    fetchCentres,
    getCentre,
    createCentre,
    updateCentre,
    deleteCentre,
  };
}
