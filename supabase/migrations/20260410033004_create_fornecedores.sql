-- Create fornecedores tables

CREATE TABLE IF NOT EXISTS public.fornecedores_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cor TEXT NOT NULL DEFAULT '#cccccc',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fornecedores_categorias_nome_key UNIQUE (nome)
);

CREATE TABLE IF NOT EXISTS public.fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  documento TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  contato_responsavel TEXT,
  contato_telefone TEXT,
  contato_email TEXT,
  contato_site TEXT,
  avaliacao INTEGER DEFAULT 0,
  forma_pagamento TEXT,
  contrato_assinado BOOLEAN DEFAULT false,
  validade_documentos DATE,
  faixa_preco TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fornecedores_fornecedor_categorias (
  fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.fornecedores_categorias(id) ON DELETE CASCADE,
  PRIMARY KEY (fornecedor_id, categoria_id)
);

CREATE TABLE IF NOT EXISTS public.fornecedores_condominios (
  fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE CASCADE,
  condominio_id UUID REFERENCES public.condominios(id) ON DELETE CASCADE,
  PRIMARY KEY (fornecedor_id, condominio_id)
);

CREATE TABLE IF NOT EXISTS public.fornecedores_dashboard_prefs (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  prefs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Enable
ALTER TABLE public.fornecedores_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores_fornecedor_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores_condominios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores_dashboard_prefs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "allow_all" ON public.fornecedores_categorias;
CREATE POLICY "allow_all" ON public.fornecedores_categorias FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all" ON public.fornecedores;
CREATE POLICY "allow_all" ON public.fornecedores FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all" ON public.fornecedores_fornecedor_categorias;
CREATE POLICY "allow_all" ON public.fornecedores_fornecedor_categorias FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all" ON public.fornecedores_condominios;
CREATE POLICY "allow_all" ON public.fornecedores_condominios FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all" ON public.fornecedores_dashboard_prefs;
CREATE POLICY "allow_all" ON public.fornecedores_dashboard_prefs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed Categories
INSERT INTO public.fornecedores_categorias (id, nome, cor) VALUES
  (gen_random_uuid(), 'Limpeza', '#3b82f6'),
  (gen_random_uuid(), 'Elétrica', '#eab308'),
  (gen_random_uuid(), 'Hidráulica', '#06b6d4'),
  (gen_random_uuid(), 'Jardinagem', '#22c55e'),
  (gen_random_uuid(), 'Segurança', '#ef4444'),
  (gen_random_uuid(), 'Pintura', '#f97316'),
  (gen_random_uuid(), 'Elevadores', '#8b5cf6'),
  (gen_random_uuid(), 'Dedetização', '#a855f7'),
  (gen_random_uuid(), 'TI/Câmeras', '#6366f1'),
  (gen_random_uuid(), 'Piscina', '#0ea5e9'),
  (gen_random_uuid(), 'Contabilidade', '#64748b'),
  (gen_random_uuid(), 'Jurídico', '#1e293b')
ON CONFLICT (nome) DO NOTHING;
