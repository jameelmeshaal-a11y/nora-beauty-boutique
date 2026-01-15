
-- إضافة دور المورد للـ enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'supplier';

-- إنشاء جدول الموردين
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_name_ar TEXT,
  logo_url TEXT,
  description TEXT,
  description_ar TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  address_ar TEXT,
  rating DECIMAL DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  commission_rate DECIMAL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- إنشاء جدول التصنيفات المتداخلة
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- إنشاء جدول تقييمات المنتجات
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- إنشاء جدول إعدادات المتجر
CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_supplier_name BOOLEAN DEFAULT false,
  allow_supplier_registration BOOLEAN DEFAULT true,
  min_order_amount DECIMAL DEFAULT 0,
  free_shipping_threshold DECIMAL DEFAULT 200,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- إدراج إعدادات افتراضية
INSERT INTO public.store_settings (show_supplier_name, allow_supplier_registration) 
VALUES (false, true);

-- تحديث جدول المنتجات - إضافة أعمدة جديدة
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;

-- تحديث جدول product_variants - إضافة أعمدة جديدة
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS lip_image_url TEXT,
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- تمكين RLS للجداول الجديدة
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- سياسات suppliers
CREATE POLICY "Anyone can view active suppliers"
ON public.suppliers FOR SELECT
USING (is_active = true AND is_verified = true);

CREATE POLICY "Suppliers can view own data"
ON public.suppliers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can register as supplier"
ON public.suppliers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Suppliers can update own data"
ON public.suppliers FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage suppliers"
ON public.suppliers FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- سياسات categories
CREATE POLICY "Anyone can view active categories"
ON public.categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- سياسات product_reviews
CREATE POLICY "Anyone can view approved reviews"
ON public.product_reviews FOR SELECT
USING (is_approved = true);

CREATE POLICY "Users can view own reviews"
ON public.product_reviews FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can add reviews"
ON public.product_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
ON public.product_reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
ON public.product_reviews FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage reviews"
ON public.product_reviews FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- سياسات store_settings
CREATE POLICY "Anyone can view store settings"
ON public.store_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage store settings"
ON public.store_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- سياسة إضافية للموردين لإدارة منتجاتهم
CREATE POLICY "Suppliers can manage their products"
ON public.products FOR ALL
USING (
  supplier_id IN (
    SELECT id FROM public.suppliers WHERE user_id = auth.uid()
  )
);

-- سياسة للموردين لإدارة variants منتجاتهم
CREATE POLICY "Suppliers can manage their product variants"
ON public.product_variants FOR ALL
USING (
  product_id IN (
    SELECT p.id FROM public.products p
    JOIN public.suppliers s ON p.supplier_id = s.id
    WHERE s.user_id = auth.uid()
  )
);

-- إنشاء trigger لتحديث updated_at للموردين
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- إنشاء trigger لتحديث updated_at للإعدادات
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- إدراج التصنيفات الرئيسية
INSERT INTO public.categories (name, name_ar, slug, sort_order) VALUES
('Cosmetics', 'مستحضرات التجميل', 'cosmetics', 1),
('Fragrance', 'العطور', 'fragrance', 2),
('Skin', 'العناية بالبشرة', 'skin', 3),
('Discover', 'اكتشف', 'discover', 4);

-- إدراج التصنيفات الفرعية لـ Cosmetics
INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Lips', 'الشفاه', 'lips', id, 1 FROM public.categories WHERE slug = 'cosmetics';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Face', 'الوجه', 'face', id, 2 FROM public.categories WHERE slug = 'cosmetics';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Eyes & Brows', 'العيون والحواجب', 'eyes-brows', id, 3 FROM public.categories WHERE slug = 'cosmetics';

-- تصنيفات فرعية لـ Lips
INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Lip Gloss', 'ملمع الشفاه', 'lip-gloss', id, 1 FROM public.categories WHERE slug = 'lips';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Lipstick', 'أحمر الشفاه', 'lipstick', id, 2 FROM public.categories WHERE slug = 'lips';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Lip Oil', 'زيت الشفاه', 'lip-oil', id, 3 FROM public.categories WHERE slug = 'lips';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Lip Liner', 'محدد الشفاه', 'lip-liner', id, 4 FROM public.categories WHERE slug = 'lips';

-- تصنيفات فرعية لـ Face
INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Foundation', 'كريم الأساس', 'foundation', id, 1 FROM public.categories WHERE slug = 'face';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Concealer', 'الكونسيلر', 'concealer', id, 2 FROM public.categories WHERE slug = 'face';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Blush', 'أحمر الخدود', 'blush', id, 3 FROM public.categories WHERE slug = 'face';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Bronzer', 'برونزر', 'bronzer', id, 4 FROM public.categories WHERE slug = 'face';

-- تصنيفات فرعية لـ Eyes & Brows
INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Mascara', 'ماسكارا', 'mascara', id, 1 FROM public.categories WHERE slug = 'eyes-brows';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Eyeliner', 'محدد العيون', 'eyeliner', id, 2 FROM public.categories WHERE slug = 'eyes-brows';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Eyeshadow', 'ظلال العيون', 'eyeshadow', id, 3 FROM public.categories WHERE slug = 'eyes-brows';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Brow Products', 'منتجات الحواجب', 'brow-products', id, 4 FROM public.categories WHERE slug = 'eyes-brows';

-- تصنيفات فرعية لـ Fragrance
INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Perfumes', 'العطور', 'perfumes', id, 1 FROM public.categories WHERE slug = 'fragrance';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Body Mists', 'بخاخات الجسم', 'body-mists', id, 2 FROM public.categories WHERE slug = 'fragrance';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Scented Oils', 'زيوت معطرة', 'scented-oils', id, 3 FROM public.categories WHERE slug = 'fragrance';

-- تصنيفات فرعية لـ Skin
INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Cleansers', 'منظفات', 'cleansers', id, 1 FROM public.categories WHERE slug = 'skin';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Moisturizers', 'مرطبات', 'moisturizers', id, 2 FROM public.categories WHERE slug = 'skin';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Serums', 'سيرومات', 'serums', id, 3 FROM public.categories WHERE slug = 'skin';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Masks', 'أقنعة', 'masks', id, 4 FROM public.categories WHERE slug = 'skin';

-- تصنيفات فرعية لـ Discover
INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Best Sellers', 'الأكثر مبيعاً', 'best-sellers', id, 1 FROM public.categories WHERE slug = 'discover';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'New Arrivals', 'وصل حديثاً', 'new-arrivals', id, 2 FROM public.categories WHERE slug = 'discover';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Sets & Bundles', 'مجموعات', 'sets-bundles', id, 3 FROM public.categories WHERE slug = 'discover';

INSERT INTO public.categories (name, name_ar, slug, parent_id, sort_order)
SELECT 'Sale', 'تخفيضات', 'sale', id, 4 FROM public.categories WHERE slug = 'discover';

-- إنشاء Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images', 'product-images', true),
  ('lip-swatches', 'lip-swatches', true),
  ('supplier-logos', 'supplier-logos', true),
  ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- سياسات Storage للصور العامة
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id IN ('product-images', 'lip-swatches', 'supplier-logos', 'category-images'));

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('product-images', 'lip-swatches', 'supplier-logos', 'category-images')
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own uploaded images"
ON storage.objects FOR UPDATE
USING (
  bucket_id IN ('product-images', 'lip-swatches', 'supplier-logos', 'category-images')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own uploaded images"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('product-images', 'lip-swatches', 'supplier-logos', 'category-images')
  AND auth.uid()::text = (storage.foldername(name))[1]
);
