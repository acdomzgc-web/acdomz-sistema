CREATE TABLE IF NOT EXISTS public.perfis_acesso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  funcao TEXT NOT NULL CHECK (funcao IN ('admin', 'sindico', 'morador')),
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "allow_all" ON public.perfis_acesso;
CREATE POLICY "allow_all" ON public.perfis_acesso FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.perfis_acesso ENABLE ROW LEVEL SECURITY;

INSERT INTO public.perfis_acesso (nome, funcao, descricao) VALUES
('Administrador Geral', 'admin', 'Acesso total ao sistema com permissões de administrador.'),
('Síndico Profissional', 'sindico', 'Acesso às rotinas do condomínio e gestão de moradores.'),
('Assistente Financeiro', 'admin', 'Acesso focado em relatórios e rotinas financeiras.')
ON CONFLICT (nome) DO NOTHING;
