import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Province {
  id: string;
  nom: string;
  code?: string;
  chef_lieu?: string;
  description?: string;
  population?: number;
  superficie?: number;
  created_at?: string;
}

export function useProvincesAPI() {
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

  const fetchProvinces = useCallback(async (): Promise<Province[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/provinces-api`,
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
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getProvince = useCallback(async (id: string): Promise<Province | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/provinces-api?id=${id}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Province non trouvée');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProvince = useCallback(async (data: Partial<Province>): Promise<Province | null> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/provinces-api`,
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
        description: 'Province créée avec succès',
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

  const updateProvince = useCallback(async (id: string, data: Partial<Province>): Promise<Province | null> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/provinces-api?id=${id}`,
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
        description: 'Province mise à jour avec succès',
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

  const deleteProvince = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/provinces-api?id=${id}`,
        { method: 'DELETE', headers }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      toast({
        title: 'Succès',
        description: 'Province supprimée avec succès',
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
    fetchProvinces,
    getProvince,
    createProvince,
    updateProvince,
    deleteProvince,
  };
}
