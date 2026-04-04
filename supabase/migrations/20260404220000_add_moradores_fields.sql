ALTER TABLE public.moradores ADD COLUMN IF NOT EXISTS perfil_tipo text DEFAULT 'Proprietário';
ALTER TABLE public.moradores ADD COLUMN IF NOT EXISTS funcao text DEFAULT 'Morador';

DO $$
BEGIN
  -- Migrate existing role data if necessary
  UPDATE public.moradores 
  SET perfil_tipo = CASE 
      WHEN role IN ('Proprietário', 'Locatário') THEN role 
      ELSE 'Proprietário' 
    END,
    funcao = CASE 
      WHEN role IN ('Conselho Consultivo', 'Conselho Fiscal', 'Morador') THEN role 
      ELSE 'Morador' 
    END
  WHERE perfil_tipo IS NULL OR funcao IS NULL;
END $$;
