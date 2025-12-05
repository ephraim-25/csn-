import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminMatricule {
  id: string;
  matricule: string;
  nom_complet: string;
  email: string | null;
  est_utilise: boolean;
  utilise_par: string | null;
  date_utilisation: string | null;
  created_at: string;
}

export function useMatriculesAPI() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: matricules, isLoading, error } = useQuery({
    queryKey: ['admin-matricules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_matricules')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminMatricule[];
    },
  });

  const createMatricule = useMutation({
    mutationFn: async (newMatricule: { matricule: string; nom_complet: string; email?: string }) => {
      const { data, error } = await supabase
        .from('admin_matricules')
        .insert([newMatricule])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-matricules'] });
      toast({
        title: "Matricule créé",
        description: "Le matricule administrateur a été créé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le matricule.",
        variant: "destructive",
      });
    },
  });

  const deleteMatricule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_matricules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-matricules'] });
      toast({
        title: "Matricule supprimé",
        description: "Le matricule a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le matricule.",
        variant: "destructive",
      });
    },
  });

  return {
    matricules,
    isLoading,
    error,
    createMatricule,
    deleteMatricule,
  };
}
