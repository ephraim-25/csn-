-- Insert some valid admin matricules for testing
INSERT INTO public.admin_matricules (matricule, nom_complet, email) VALUES
  ('ADM202501', 'Administrateur Principal', 'admin@csn.cd'),
  ('ADM202502', 'Administrateur Système', 'sysadmin@csn.cd'),
  ('ADM202503', 'Modérateur Principal', 'mod@csn.cd'),
  ('ADM202504', 'Administrateur DBH', 'dbh.admin@csn.cd'),
  ('ADM202505', 'Administrateur Recherche', 'research.admin@csn.cd')
ON CONFLICT DO NOTHING;

-- Update the handle_new_user function to mark matricule as used
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
  user_matricule TEXT;
BEGIN
  -- Get role from metadata, default to 'chercheur'
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'chercheur'::app_role);
  user_matricule := NEW.raw_user_meta_data->>'matricule';

  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- If admin with matricule, mark it as used
  IF user_role = 'admin' AND user_matricule IS NOT NULL THEN
    UPDATE public.admin_matricules
    SET 
      est_utilise = true,
      utilise_par = NEW.id,
      date_utilisation = now(),
      email = NEW.email
    WHERE matricule = user_matricule AND est_utilise = false;
  END IF;
  
  -- Si c'est un chercheur, créer une entrée dans la table chercheurs
  IF user_role = 'chercheur' THEN
    INSERT INTO public.chercheurs (
      user_id,
      email,
      nom,
      prenom,
      nom_complet,
      matricule
    )
    VALUES (
      NEW.id,
      NEW.email,
      SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', 'Chercheur'), ' ', -1),
      SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nouveau'), ' ', 1),
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nouveau Chercheur'),
      NULL
    );
  END IF;
  
  -- Créer une notification de bienvenue
  INSERT INTO public.notifications (user_id, titre, message, type)
  VALUES (
    NEW.id,
    'Bienvenue sur la plateforme CSN!',
    CASE 
      WHEN user_role = 'admin' THEN 'Votre compte administrateur a été créé avec succès. Vous avez maintenant accès à toutes les fonctionnalités de gestion.'
      ELSE 'Votre compte chercheur a été créé avec succès. Complétez votre profil pour maximiser votre visibilité.'
    END,
    'success'
  );
  
  RETURN NEW;
END;
$$;