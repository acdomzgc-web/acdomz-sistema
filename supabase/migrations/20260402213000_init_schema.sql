-- Setup Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'morador' CHECK (role IN ('admin', 'sindico', 'morador')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Administradoras
CREATE TABLE IF NOT EXISTS public.administradoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Condominios
CREATE TABLE IF NOT EXISTS public.condominios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT,
  address TEXT,
  total_units INTEGER,
  admin_id UUID REFERENCES public.administradoras(id),
  sindico_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Moradores
CREATE TABLE IF NOT EXISTS public.moradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  unit TEXT,
  role TEXT,
  status TEXT DEFAULT 'Ativo',
  condominio_id UUID REFERENCES public.condominios(id),
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documentos Condominio
CREATE TABLE IF NOT EXISTS public.documentos_condominio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  size TEXT,
  folder TEXT,
  file_path TEXT,
  condominio_id UUID REFERENCES public.condominios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Receitas ACDOMZ
CREATE TABLE IF NOT EXISTS public.receitas_acdomz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT,
  amount DECIMAL(10,2),
  date DATE,
  condominio_id UUID REFERENCES public.condominios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Despesas Recorrentes ACDOMZ
CREATE TABLE IF NOT EXISTS public.despesas_recorrentes_acdomz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT,
  amount DECIMAL(10,2),
  day_of_month INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Despesas Pontuais ACDOMZ
CREATE TABLE IF NOT EXISTS public.despesas_pontuais_acdomz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT,
  amount DECIMAL(10,2),
  date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Financeiro Condominio
CREATE TABLE IF NOT EXISTS public.financeiro_condominio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID REFERENCES public.condominios(id),
  type TEXT CHECK (type IN ('receita', 'despesa')),
  description TEXT,
  amount DECIMAL(10,2),
  date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Parecer Financeiro
CREATE TABLE IF NOT EXISTS public.parecer_financeiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID REFERENCES public.condominios(id),
  month VARCHAR(7),
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comunicados
CREATE TABLE IF NOT EXISTS public.comunicados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID REFERENCES public.condominios(id),
  title TEXT,
  content TEXT,
  date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversas Sindia
CREATE TABLE IF NOT EXISTS public.conversas_sindia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  condominio_id UUID REFERENCES public.condominios(id),
  message TEXT,
  response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tipos Condominio
CREATE TABLE IF NOT EXISTS public.tipos_condominio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_smn DECIMAL(10,2) DEFAULT 1621.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Regras Calculo Honorarios
CREATE TABLE IF NOT EXISTS public.regras_calculo_honorarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_condominio_id UUID REFERENCES public.tipos_condominio(id),
  description TEXT,
  multiplier DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Calculos Honorarios
CREATE TABLE IF NOT EXISTS public.calculos_honorarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID REFERENCES public.condominios(id),
  calculated_value DECIMAL(10,2),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Handle New User Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'), 
    COALESCE(NEW.raw_user_meta_data->>'role', 'morador')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS and set policies
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(table_name) || ' ENABLE ROW LEVEL SECURITY;';
    EXECUTE 'DROP POLICY IF EXISTS "allow_all" ON public.' || quote_ident(table_name) || ';';
    EXECUTE 'CREATE POLICY "allow_all" ON public.' || quote_ident(table_name) || ' FOR ALL TO authenticated USING (true) WITH CHECK (true);';
  END LOOP;
END $$;

-- Data Seeding
DO $$
DECLARE
  admin_user_id uuid;
  sindico_user_id uuid;
  tipo_id uuid;
  admin_id uuid;
  condominio_id uuid;
BEGIN
  -- Admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'acdomz.gc@gmail.com') THEN
    admin_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      admin_user_id, '00000000-0000-0000-0000-000000000000', 'acdomz.gc@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Administrador", "role": "admin"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Sindico
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sindico@acdomz.com.br') THEN
    sindico_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      sindico_user_id, '00000000-0000-0000-0000-000000000000', 'sindico@acdomz.com.br', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Síndico Teste", "role": "sindico"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', ''
    );
  END IF;

  -- Tipos Condominio
  IF NOT EXISTS (SELECT 1 FROM public.tipos_condominio WHERE name = 'horizontal_residencial') THEN
    INSERT INTO public.tipos_condominio (name, base_smn) VALUES ('horizontal_residencial', 1621.00) RETURNING id INTO tipo_id;
    INSERT INTO public.regras_calculo_honorarios (tipo_condominio_id, description, multiplier) VALUES 
      (tipo_id, 'cascata lotes', 1.0),
      (tipo_id, 'multiplicadores densidade', 1.2),
      (tipo_id, 'tetos trilha', 1.5);
  END IF;

  -- Administradoras
  IF NOT EXISTS (SELECT 1 FROM public.administradoras) THEN
    INSERT INTO public.administradoras (name, cnpj, email, phone, address) VALUES 
      ('Gestão Prime', '12.345.678/0001-90', 'contato@gestaoprime.com', '(11) 3456-7890', 'Av. Paulista, 1000'),
      ('CondoMaster Sul', '98.765.432/0001-10', 'atendimento@condomaster.com', '(41) 3333-4444', 'Rua das Flores, 500');
  END IF;

  -- Condominios
  IF NOT EXISTS (SELECT 1 FROM public.condominios) THEN
    SELECT id INTO admin_id FROM public.administradoras LIMIT 1;
    INSERT INTO public.condominios (name, address, total_units, admin_id)
    VALUES ('Residencial Alpha', 'Rua das Flores, 100', 120, admin_id)
    RETURNING id INTO condominio_id;
    INSERT INTO public.condominios (name, address, total_units, admin_id)
    VALUES ('Torres do Sol', 'Av. Brasil, 2000', 250, admin_id);
  END IF;

  -- Moradores
  IF NOT EXISTS (SELECT 1 FROM public.moradores) THEN
    SELECT id INTO condominio_id FROM public.condominios LIMIT 1;
    INSERT INTO public.moradores (name, email, phone, unit, role, condominio_id) VALUES 
      ('Roberto Almeida', 'roberto@email.com', '(11) 98765-4321', 'Apto 101 - Bloco A', 'Proprietário', condominio_id),
      ('Fernanda Lima', 'fernanda@email.com', '(11) 91234-5678', 'Apto 205 - Bloco B', 'Locatário', condominio_id);
  END IF;

END $$;
