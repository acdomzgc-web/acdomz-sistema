CREATE TABLE IF NOT EXISTS public.pastas_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID REFERENCES public.condominios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'Folder',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pastas_documentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all" ON public.pastas_documentos;
CREATE POLICY "allow_all" ON public.pastas_documentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
DECLARE
  c RECORD;
  pasta_id UUID;
BEGIN
  FOR c IN SELECT id FROM public.condominios LOOP
    -- Atas
    INSERT INTO public.pastas_documentos (condominio_id, name, icon) VALUES (c.id, 'ATAS', 'FileArchive') RETURNING id INTO pasta_id;
    UPDATE public.documentos_condominio SET folder = pasta_id::text WHERE condominio_id = c.id AND folder = 'ata';
    
    -- Regimento
    INSERT INTO public.pastas_documentos (condominio_id, name, icon) VALUES (c.id, 'REGIMENTO INTERNO', 'FileText') RETURNING id INTO pasta_id;
    UPDATE public.documentos_condominio SET folder = pasta_id::text WHERE condominio_id = c.id AND folder = 'regimento';
    
    -- Convenção
    INSERT INTO public.pastas_documentos (condominio_id, name, icon) VALUES (c.id, 'CONVENÇÃO', 'FileBadge') RETURNING id INTO pasta_id;
    UPDATE public.documentos_condominio SET folder = pasta_id::text WHERE condominio_id = c.id AND folder = 'convencao';

    -- Financeiro
    INSERT INTO public.pastas_documentos (condominio_id, name, icon) VALUES (c.id, 'PARECERES FINANC.', 'Folder') RETURNING id INTO pasta_id;
    UPDATE public.documentos_condominio SET folder = pasta_id::text WHERE condominio_id = c.id AND folder = 'financeiro';

    -- FAQ
    INSERT INTO public.pastas_documentos (condominio_id, name, icon) VALUES (c.id, 'FAQ', 'Folder') RETURNING id INTO pasta_id;
    UPDATE public.documentos_condominio SET folder = pasta_id::text WHERE condominio_id = c.id AND folder = 'faq';
    
    -- Inadimplência
    INSERT INTO public.pastas_documentos (condominio_id, name, icon) VALUES (c.id, 'INADIMPLÊNCIA', 'Folder');
  END LOOP;
END $$;
