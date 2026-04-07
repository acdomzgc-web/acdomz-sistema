DO $$
BEGIN
  -- Update administradoras
  ALTER TABLE public.administradoras ADD COLUMN IF NOT EXISTS responsavel_nome TEXT;
  ALTER TABLE public.administradoras ADD COLUMN IF NOT EXISTS responsavel_email TEXT;
  ALTER TABLE public.administradoras ADD COLUMN IF NOT EXISTS responsavel_phone TEXT;

  -- Update condominios
  ALTER TABLE public.condominios ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'horizontal';
  ALTER TABLE public.condominios ADD COLUMN IF NOT EXISTS ocupacao TEXT DEFAULT 'residencial';

  -- Update receitas_acdomz
  ALTER TABLE public.receitas_acdomz ADD COLUMN IF NOT EXISTS is_recurrent BOOLEAN DEFAULT false;
  ALTER TABLE public.receitas_acdomz ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Geral';
  ALTER TABLE public.receitas_acdomz ADD COLUMN IF NOT EXISTS invoice_url TEXT;

  -- Update despesas_pontuais_acdomz
  ALTER TABLE public.despesas_pontuais_acdomz ADD COLUMN IF NOT EXISTS is_recurrent BOOLEAN DEFAULT false;
  ALTER TABLE public.despesas_pontuais_acdomz ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Geral';
  ALTER TABLE public.despesas_pontuais_acdomz ADD COLUMN IF NOT EXISTS invoice_url TEXT;
END $$;

CREATE TABLE IF NOT EXISTS public.categorias_financeiras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "allow_all" ON public.categorias_financeiras;
CREATE POLICY "allow_all" ON public.categorias_financeiras FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.categorias_financeiras (id, name, type) VALUES
  (gen_random_uuid(), 'Taxa Condominial', 'receita'),
  (gen_random_uuid(), 'Fundo de Reserva', 'receita'),
  (gen_random_uuid(), 'Multas e Juros', 'receita'),
  (gen_random_uuid(), 'Manutenção', 'despesa'),
  (gen_random_uuid(), 'Funcionários', 'despesa'),
  (gen_random_uuid(), 'Água/Luz', 'despesa')
ON CONFLICT DO NOTHING;
