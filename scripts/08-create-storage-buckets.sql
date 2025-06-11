-- Create storage bucket for hotel images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-images', 'hotel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for hotel images
CREATE POLICY "Hotel images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'hotel-images');

CREATE POLICY "Hotel owners can upload hotel images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hotel-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Hotel owners can update their hotel images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hotel-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Hotel owners can delete their hotel images"
ON storage.objects FOR DELETE
USING (bucket_id = 'hotel-images' AND auth.uid() IS NOT NULL);
