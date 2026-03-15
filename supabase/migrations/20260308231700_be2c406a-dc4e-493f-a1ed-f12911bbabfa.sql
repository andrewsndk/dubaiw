
-- Fix watches RLS: only admins can insert/update/delete
DROP POLICY "Authenticated users can delete watches" ON public.watches;
DROP POLICY "Authenticated users can insert watches" ON public.watches;
DROP POLICY "Authenticated users can update watches" ON public.watches;

CREATE POLICY "Admins can insert watches"
ON public.watches FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update watches"
ON public.watches FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete watches"
ON public.watches FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
