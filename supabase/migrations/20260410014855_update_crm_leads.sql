-- Add new columns for CRM Analytics
ALTER TABLE public.crm_leads 
ADD COLUMN IF NOT EXISTS lead_type TEXT DEFAULT 'sindico',
ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'prospeccao_ativa',
ADD COLUMN IF NOT EXISTS units_count INTEGER;

-- Map old statuses to new pipeline stages safely
UPDATE public.crm_leads SET status = 'qualificacao' WHERE status = 'lead';
UPDATE public.crm_leads SET status = 'primeiro_contato' WHERE status = 'em_contato';
UPDATE public.crm_leads SET status = 'reuniao' WHERE status = 'respondido';
