-- Create storage bucket for medical ID cards
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-ids', 'medical-ids', false);

-- RLS policies for medical-ids bucket
CREATE POLICY "Users can upload their own medical ID"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'medical-ids' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own medical ID"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-ids' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all medical IDs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-ids' AND
    (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
  );