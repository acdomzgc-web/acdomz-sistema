-- Adiciona novas colunas para o CRM profissional
ALTER TABLE public.crm_leads 
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Atualiza leads existentes que não têm data de status
UPDATE public.crm_leads 
SET status_updated_at = updated_at 
WHERE status_updated_at IS NULL;
