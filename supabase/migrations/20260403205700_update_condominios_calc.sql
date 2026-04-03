ALTER TABLE public.condominios 
ADD COLUMN IF NOT EXISTS calc_tipo_id TEXT,
ADD COLUMN IF NOT EXISTS calc_densidade_id TEXT,
ADD COLUMN IF NOT EXISTS calc_areas_comuns INTEGER DEFAULT 0;
