
-- BRANDS
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_ru TEXT,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  banner_url TEXT,
  country TEXT DEFAULT 'Russia',
  description TEXT,
  description_ar TEXT,
  description_ru TEXT,
  discount_percent INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active brands" ON public.brands FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage brands" ON public.brands FOR ALL USING (has_role(auth.uid(), 'admin'));

-- INFLUENCERS
CREATE TABLE public.influencers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_ru TEXT,
  bio TEXT,
  bio_ar TEXT,
  bio_ru TEXT,
  photo_url TEXT,
  instagram TEXT,
  tiktok TEXT,
  snapchat TEXT,
  affiliate_code TEXT UNIQUE,
  commission_rate NUMERIC DEFAULT 10,
  total_sales NUMERIC DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active influencers" ON public.influencers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage influencers" ON public.influencers FOR ALL USING (has_role(auth.uid(), 'admin'));

-- BANNERS
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  title_ar TEXT,
  title_ru TEXT,
  subtitle TEXT,
  subtitle_ar TEXT,
  subtitle_ru TEXT,
  image_url TEXT NOT NULL,
  link TEXT,
  type TEXT NOT NULL DEFAULT 'hero',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active banners" ON public.banners
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "Admins manage banners" ON public.banners FOR ALL USING (has_role(auth.uid(), 'admin'));

-- COUPONS
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percent', -- percent | fixed
  discount_value NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL USING (has_role(auth.uid(), 'admin'));

-- VENDOR PAYOUTS
CREATE TABLE public.vendor_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | paid | rejected
  payment_method TEXT,
  notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);
ALTER TABLE public.vendor_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Suppliers view own payouts" ON public.vendor_payouts FOR SELECT
  USING (supplier_id IN (SELECT id FROM suppliers WHERE user_id = auth.uid()));
CREATE POLICY "Suppliers request payouts" ON public.vendor_payouts FOR INSERT
  WITH CHECK (supplier_id IN (SELECT id FROM suppliers WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage payouts" ON public.vendor_payouts FOR ALL USING (has_role(auth.uid(), 'admin'));

-- EXTEND PRODUCTS
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name_ru TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_ru TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand_id UUID;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_percent INTEGER;

-- EXTEND SUPPLIERS
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS company_name_ru TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS total_sales NUMERIC DEFAULT 0;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Russia';

-- EXTEND CATEGORIES
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_ru TEXT;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);
CREATE INDEX IF NOT EXISTS idx_banners_type ON public.banners(type, is_active);
