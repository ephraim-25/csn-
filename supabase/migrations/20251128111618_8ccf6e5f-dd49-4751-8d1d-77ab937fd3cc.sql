-- Créer une table pour les matricules d'administrateurs valides
CREATE TABLE IF NOT EXISTS public.admin_matricules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricule TEXT NOT NULL UNIQUE,
  nom_complet TEXT NOT NULL,
  email TEXT,
  est_utilise BOOLEAN DEFAULT FALSE,
  utilise_par UUID REFERENCES auth.users(id),
  date_utilisation TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_matricules ENABLE ROW LEVEL SECURITY;

-- Politique pour que les admins puissent tout gérer
CREATE POLICY "Admins peuvent gérer les matricules"
  ON public.admin_matricules FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Politique pour permettre la lecture pendant l'inscription (vérification)
CREATE POLICY "Permettre vérification matricule pendant inscription"
  ON public.admin_matricules FOR SELECT
  TO authenticated
  USING (NOT est_utilise);

-- Insérer quelques matricules d'exemple pour les tests
INSERT INTO public.admin_matricules (matricule, nom_complet, email) VALUES
  ('ADM2024001', 'Admin Test 1', 'admin1@csn.cd'),
  ('ADM2024002', 'Admin Test 2', 'admin2@csn.cd'),
  ('ADM2024003', 'Admin Test 3', 'admin3@csn.cd')
ON CONFLICT (matricule) DO NOTHING;

-- Créer une table pour les notifications des chercheurs
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  est_lu BOOLEAN DEFAULT FALSE,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs voient leurs propres notifications
CREATE POLICY "Utilisateurs voient leurs notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs marquent leurs notifications comme lues
CREATE POLICY "Utilisateurs marquent leurs notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Politique pour que les admins puissent créer des notifications
CREATE POLICY "Admins créent des notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Créer un trigger pour la mise à jour automatique
CREATE TRIGGER update_admin_matricules_updated_at
  BEFORE UPDATE ON public.admin_matricules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();