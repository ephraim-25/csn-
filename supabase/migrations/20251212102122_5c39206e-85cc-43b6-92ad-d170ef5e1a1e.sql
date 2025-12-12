-- Fix 1: Newsletter Campaign Data - Add explicit admin-only SELECT policy
-- The current ALL policy is restrictive (RESTRICTIVE), but adding explicit SELECT makes it clearer
CREATE POLICY "Only admins can view newsletter campaigns"
ON public.newsletter_envois FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Admin Matricules - Create a SECURITY DEFINER function for safe matricule verification
-- This prevents exposing admin emails during signup
CREATE OR REPLACE FUNCTION public.verify_admin_matricule(p_matricule TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_matricules 
    WHERE matricule = p_matricule AND est_utilise = false
  );
$$;

-- Remove the overly permissive public SELECT policies that expose admin emails
DROP POLICY IF EXISTS "Allow public read for signup verification" ON public.admin_matricules;
DROP POLICY IF EXISTS "Permettre vérification matricule pendant inscription" ON public.admin_matricules;

-- Fix 3: Chercheurs table - Restrict public access to professional fields only
-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Tout le monde peut voir les chercheurs actifs" ON public.chercheurs;

-- Create new granular policies:
-- Policy 1: Public can only see basic professional info (using a restricted column check isn't possible in RLS,
-- so we'll handle column filtering in the Edge Function, but restrict row access)
CREATE POLICY "Public can view active researchers basic info"
ON public.chercheurs FOR SELECT
TO anon, authenticated
USING (est_actif = true);

-- Policy 2: Researchers can see their own full profile
CREATE POLICY "Researchers can view own full profile"
ON public.chercheurs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 3: Admins can view all researchers (already exists via "Admins peuvent tout gérer")
-- No action needed

-- Note: Column-level security will be enforced in the Edge Functions