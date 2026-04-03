ALTER TABLE public.comunicados ADD COLUMN IF NOT EXISTS descricao_original TEXT;
ALTER TABLE public.comunicados ADD COLUMN IF NOT EXISTS comunicado_gerado TEXT;
ALTER TABLE public.comunicados ADD COLUMN IF NOT EXISTS formato_download TEXT;
ALTER TABLE public.comunicados ADD COLUMN IF NOT EXISTS data_criacao TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.comunicados ADD COLUMN IF NOT EXISTS criado_por UUID REFERENCES public.profiles(id);

DROP POLICY IF EXISTS "allow_all" ON public.comunicados;
CREATE POLICY "allow_all" ON public.comunicados FOR ALL TO authenticated USING (true) WITH CHECK (true);
