CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    condominio_name TEXT,
    email TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'lead',
    value NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all" ON public.crm_leads;
CREATE POLICY "allow_all" ON public.crm_leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed some mock data
INSERT INTO public.crm_leads (id, name, condominio_name, status, value, notes)
VALUES 
  ('11111111-1111-1111-1111-111111111111'::uuid, 'João Silva', 'Condomínio Flores', 'lead', 1200, 'Interessado em redução de custos'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Maria Santos', 'Edifício Central', 'em_contato', 2500, 'Reunião agendada para semana que vem'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Carlos Oliveira', 'Residencial Parque', 'respondido', 1800, 'Pediu proposta comercial'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'Ana Costa', 'Condomínio Vista Linda', 'negociacao', 3000, 'Analisando proposta final'),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'Pedro Alves', 'Edifício Horizonte', 'ganho', 2200, 'Contrato assinado'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'Juliana Lima', 'Residencial Bosque', 'perdido', 1500, 'Fechou com concorrente')
ON CONFLICT (id) DO NOTHING;
