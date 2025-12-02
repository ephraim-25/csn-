-- =============================================
-- STORAGE BUCKETS POUR UPLOADS
-- =============================================

-- Bucket pour les photos de profil des chercheurs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chercheurs-photos',
  'chercheurs-photos',
  true,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket pour les CVs des chercheurs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chercheurs-cvs',
  'chercheurs-cvs',
  false,
  10485760, -- 10MB max
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Bucket pour les logos des centres
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'centres-logos',
  'centres-logos',
  true,
  2097152, -- 2MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Bucket pour les documents des publications
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'publications-pdfs',
  'publications-pdfs',
  false,
  52428800, -- 50MB max
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- RLS POLICIES POUR STORAGE
-- =============================================

-- Photos de profil : tout le monde peut voir, seul le propriétaire peut upload/update
CREATE POLICY "Photos publiques accessibles à tous"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chercheurs-photos');

CREATE POLICY "Chercheurs peuvent uploader leur photo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chercheurs-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Chercheurs peuvent modifier leur photo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'chercheurs-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Chercheurs peuvent supprimer leur photo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chercheurs-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- CVs : seul le propriétaire et les admins peuvent voir/gérer
CREATE POLICY "CVs accessibles au propriétaire et admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chercheurs-cvs' AND
  ((storage.foldername(name))[1] = auth.uid()::text OR
   has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Chercheurs peuvent uploader leur CV"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chercheurs-cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Chercheurs peuvent modifier leur CV"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'chercheurs-cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins peuvent gérer tous les CVs"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'chercheurs-cvs' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Logos centres : admins peuvent gérer, tout le monde peut voir
CREATE POLICY "Logos centres publics"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'centres-logos');

CREATE POLICY "Admins peuvent gérer logos centres"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'centres-logos' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Publications PDFs : accès selon RLS de la table publications
CREATE POLICY "Publications PDFs accessibles selon permissions"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'publications-pdfs');

CREATE POLICY "Admins peuvent gérer publications PDFs"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'publications-pdfs' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- =============================================
-- AUDIT LOG AUTOMATIQUE VIA TRIGGERS
-- =============================================

-- Fonction pour logger les actions automatiquement
CREATE OR REPLACE FUNCTION public.log_audit_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_type audit_action;
BEGIN
  -- Déterminer le type d'action
  IF TG_OP = 'INSERT' THEN
    action_type := 'CREATE';
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'UPDATE';
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'DELETE';
  END IF;

  -- Insérer dans audit_logs
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    description
  ) VALUES (
    auth.uid(),
    action_type,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    format('%s %s on %s', TG_OP, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id))
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Appliquer l'audit log aux tables critiques
DROP TRIGGER IF EXISTS audit_chercheurs ON public.chercheurs;
CREATE TRIGGER audit_chercheurs
AFTER INSERT OR UPDATE OR DELETE ON public.chercheurs
FOR EACH ROW EXECUTE FUNCTION log_audit_action();

DROP TRIGGER IF EXISTS audit_publications ON public.publications;
CREATE TRIGGER audit_publications
AFTER INSERT OR UPDATE OR DELETE ON public.publications
FOR EACH ROW EXECUTE FUNCTION log_audit_action();

DROP TRIGGER IF EXISTS audit_centres ON public.centres_recherche;
CREATE TRIGGER audit_centres
AFTER INSERT OR UPDATE OR DELETE ON public.centres_recherche
FOR EACH ROW EXECUTE FUNCTION log_audit_action();

DROP TRIGGER IF EXISTS audit_projets ON public.projets_recherche;
CREATE TRIGGER audit_projets
AFTER INSERT OR UPDATE OR DELETE ON public.projets_recherche
FOR EACH ROW EXECUTE FUNCTION log_audit_action();

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION log_audit_action();

-- =============================================
-- FONCTIONS UTILITAIRES POUR LE BACKEND
-- =============================================

-- Fonction pour vérifier si un utilisateur est admin ou modérateur
CREATE OR REPLACE FUNCTION public.is_admin_or_moderator(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = user_uuid 
      AND role IN ('admin'::app_role, 'moderateur'::app_role)
  )
$$;

-- Fonction pour obtenir le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = user_uuid
  LIMIT 1
$$;

-- Fonction pour obtenir les statistiques d'un chercheur
CREATE OR REPLACE FUNCTION public.get_chercheur_stats(chercheur_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_publications', COUNT(DISTINCT ap.publication_id),
    'total_collaborations', (
      SELECT COUNT(*)
      FROM public.collaborations c
      WHERE c.chercheur1_id = chercheur_uuid OR c.chercheur2_id = chercheur_uuid
    ),
    'total_projets', (
      SELECT COUNT(*)
      FROM public.membres_projet mp
      WHERE mp.chercheur_id = chercheur_uuid
    ),
    'total_prix', (
      SELECT COUNT(*)
      FROM public.prix_distinctions pd
      WHERE pd.chercheur_id = chercheur_uuid
    )
  ) INTO stats
  FROM public.auteurs_publications ap
  WHERE ap.chercheur_id = chercheur_uuid;
  
  RETURN stats;
END;
$$;