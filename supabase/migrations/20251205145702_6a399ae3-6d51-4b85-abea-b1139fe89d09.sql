-- Allow public read access to admin_matricules for signup verification
-- Only show matricules that are NOT used (for security)
CREATE POLICY "Allow public read for signup verification"
ON public.admin_matricules
FOR SELECT
TO anon, authenticated
USING (est_utilise = false);

-- Also ensure admins can manage all matricules
CREATE POLICY "Admins can manage all matricules"
ON public.admin_matricules
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));