DO $$
BEGIN
  -- Create global configs table
  CREATE TABLE IF NOT EXISTS public.sindia_configuracoes_globais (
    id integer PRIMARY KEY DEFAULT 1,
    sindia_active boolean DEFAULT true,
    sindia_prompt text DEFAULT 'Você é SINDIA, a assistente virtual inteligente da ACDOMZ.',
    sindia_tone text DEFAULT 'formal',
    sindia_response_length text DEFAULT 'curta',
    sindia_delay_seconds integer DEFAULT 2,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Enable RLS
  ALTER TABLE public.sindia_configuracoes_globais ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policies if any
  DROP POLICY IF EXISTS "allow_all" ON public.sindia_configuracoes_globais;
  
  -- Create policy
  CREATE POLICY "allow_all" ON public.sindia_configuracoes_globais 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Insert default
  INSERT INTO public.sindia_configuracoes_globais (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

  -- Add columns to condominios
  ALTER TABLE public.condominios ADD COLUMN IF NOT EXISTS use_global_sindia_config boolean DEFAULT true;
  ALTER TABLE public.condominios ADD COLUMN IF NOT EXISTS sindia_tone text;
  ALTER TABLE public.condominios ADD COLUMN IF NOT EXISTS sindia_response_length text;
  ALTER TABLE public.condominios ADD COLUMN IF NOT EXISTS sindia_delay_seconds integer;

  -- Add phone to conversas_sindia
  ALTER TABLE public.conversas_sindia ADD COLUMN IF NOT EXISTS phone text;
END $$;
