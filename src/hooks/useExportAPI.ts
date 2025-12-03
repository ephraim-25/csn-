import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ExportType = 'chercheurs' | 'publications' | 'centres' | 'projets';
export type ExportFormat = 'json' | 'csv' | 'excel';

export interface ExportFilters {
  type: ExportType;
  format: ExportFormat;
  filters?: Record<string, any>;
}

export function useExportAPI() {
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

  const exportData = useCallback(async ({ type, format, filters = {} }: ExportFilters): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-data`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ type, format, filters }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'export');
      }

      // Get the blob and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Set filename based on format
      const extension = format === 'excel' ? 'xlsx' : format;
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `export_${type}_${timestamp}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Succès',
        description: `Export ${type} en ${format.toUpperCase()} téléchargé`,
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, toast]);

  return {
    loading,
    error,
    exportData,
  };
}
