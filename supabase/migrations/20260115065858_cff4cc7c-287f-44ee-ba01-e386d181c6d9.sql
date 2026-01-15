-- Create table for site images management
CREATE TABLE public.site_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  title TEXT,
  title_ar TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active site images" 
ON public.site_images 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage site images" 
ON public.site_images 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default images
INSERT INTO public.site_images (key, image_url, title, title_ar) VALUES
('hero_main', '/assets/hero-lipsticks.png', 'Hero Banner', 'صورة البانر الرئيسية'),
('category_lip_gloss', '/assets/lip-gloss-category.jpg', 'Lip Gloss Category', 'فئة ملمع الشفاه'),
('category_lipstick', '/assets/lipstick-category.jpg', 'Lipstick Category', 'فئة أحمر الشفاه'),
('category_lip_oil', '/assets/lip-oil-category.jpg', 'Lip Oil Category', 'فئة زيت الشفاه');

-- Add trigger for updated_at
CREATE TRIGGER update_site_images_updated_at
BEFORE UPDATE ON public.site_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();