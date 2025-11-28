-- Modifier la fonction handle_new_user pour gérer les rôles et matricules
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
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