DO $$
BEGIN
  ALTER TABLE public.conversas_sindia ADD COLUMN IF NOT EXISTS status text DEFAULT 'respondido';
  ALTER TABLE public.conversas_sindia ADD COLUMN IF NOT EXISTS is_unauthorized boolean DEFAULT false;

  ALTER TABLE public.condominios ADD COLUMN IF NOT EXISTS sindia_active boolean DEFAULT true;
END $$;

DROP POLICY IF EXISTS "allow_all_conversas_sindia" ON public.conversas_sindia;
CREATE POLICY "allow_all_conversas_sindia" ON public.conversas_sindia
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
