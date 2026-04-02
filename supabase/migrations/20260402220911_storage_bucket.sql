-- Create 'documentos' storage bucket safely
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documentos', 'documentos', true) 
ON CONFLICT (id) DO NOTHING;

-- Apply public access policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
  FOR ALL USING (bucket_id = 'documentos') WITH CHECK (bucket_id = 'documentos');
