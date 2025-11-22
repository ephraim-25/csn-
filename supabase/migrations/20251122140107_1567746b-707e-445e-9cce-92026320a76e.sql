-- Table pour les commentaires sur les publications
CREATE TABLE IF NOT EXISTS public.commentaires_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contenu TEXT NOT NULL,
  est_publie BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.commentaires_publications ENABLE ROW LEVEL SECURITY;

-- Policies pour les commentaires
CREATE POLICY "Tout le monde peut voir les commentaires publiés"
  ON public.commentaires_publications
  FOR SELECT
  USING (est_publie = true);

CREATE POLICY "Utilisateurs authentifiés peuvent créer des commentaires"
  ON public.commentaires_publications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs propres commentaires"
  ON public.commentaires_publications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent supprimer leurs propres commentaires"
  ON public.commentaires_publications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins peuvent tout gérer sur les commentaires"
  ON public.commentaires_publications
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Trigger pour updated_at
CREATE TRIGGER update_commentaires_publications_updated_at
  BEFORE UPDATE ON public.commentaires_publications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_commentaires_publication_id ON public.commentaires_publications(publication_id);
CREATE INDEX idx_commentaires_user_id ON public.commentaires_publications(user_id);
CREATE INDEX idx_commentaires_created_at ON public.commentaires_publications(created_at DESC);