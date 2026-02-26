CREATE POLICY "Anyone can update shared items"
ON public.shared_items
FOR UPDATE
USING (true)
WITH CHECK (true);