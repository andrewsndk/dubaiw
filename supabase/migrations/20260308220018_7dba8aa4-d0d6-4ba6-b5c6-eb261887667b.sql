
-- Create watches table
CREATE TABLE public.watches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  reference TEXT,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  condition TEXT DEFAULT 'Brand New',
  box BOOLEAN DEFAULT true,
  papers BOOLEAN DEFAULT true,
  sex TEXT DEFAULT 'Male',
  movement TEXT,
  case_diameter_mm NUMERIC,
  case_material TEXT,
  strap TEXT,
  complications TEXT,
  condition_report TEXT,
  waterproof TEXT,
  caliber TEXT,
  sku TEXT,
  image_url TEXT,
  additional_images TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.watches ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view watches" ON public.watches FOR SELECT USING (true);

-- Admin writes via authenticated users (we'll refine with roles later)
CREATE POLICY "Authenticated users can insert watches" ON public.watches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update watches" ON public.watches FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete watches" ON public.watches FOR DELETE TO authenticated USING (true);

-- Create storage bucket for watch images
INSERT INTO storage.buckets (id, name, public) VALUES ('watch-images', 'watch-images', true);

CREATE POLICY "Anyone can view watch images" ON storage.objects FOR SELECT USING (bucket_id = 'watch-images');
CREATE POLICY "Authenticated users can upload watch images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'watch-images');
CREATE POLICY "Authenticated users can update watch images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'watch-images');
CREATE POLICY "Authenticated users can delete watch images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'watch-images');

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_watches_updated_at
  BEFORE UPDATE ON public.watches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
