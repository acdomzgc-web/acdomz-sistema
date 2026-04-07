DO $$
BEGIN
  ALTER TABLE public.condominios ADD COLUMN IF NOT EXISTS sindia_prompt text DEFAULT 'Você é SINDIA, a assistente virtual inteligente da ACDOMZ. Responda de forma educada, formal e APENAS baseada nos documentos fornecidos do condomínio.';
  
  ALTER TABLE public.conversas_sindia ADD COLUMN IF NOT EXISTS manual_reply text;
END $$;
