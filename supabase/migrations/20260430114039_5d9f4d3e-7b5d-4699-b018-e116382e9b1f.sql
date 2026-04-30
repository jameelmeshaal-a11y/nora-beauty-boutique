-- Community posts table for beauty forum
CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_ar text,
  title_ru text,
  content text,
  content_ar text,
  content_ru text,
  author_name text NOT NULL,
  author_avatar text,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image','video')),
  thumbnail_url text,
  product_tag text,
  likes_count int DEFAULT 0,
  views_count int DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_approved boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved posts"
  ON public.community_posts FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admins manage community posts"
  ON public.community_posts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed sample posts (Russian beauty influencers content)
INSERT INTO public.community_posts (title, title_ar, title_ru, content_ar, content_ru, content, author_name, author_avatar, media_url, media_type, thumbnail_url, product_tag, likes_count, views_count, is_featured, sort_order) VALUES
('Red Lip Tutorial', 'تطبيق أحمر الشفاه الكلاسيكي', 'Классический красный макияж губ', 'تعلمي معي تطبيق أحمر الشفاه الروسي الكلاسيكي بطريقة احترافية', 'Учитесь со мной наносить классическую русскую помаду', 'Learn the iconic Russian red lip', 'Анна Ковалева', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200', 'https://images.unsplash.com/photo-1583241800698-9c2e0e7c1a73?w=800', 'image', null, 'Red Velvet Lipstick', 1240, 8500, true, 1),
('Glass Skin Routine', 'روتين البشرة الزجاجية', 'Уход за кожей "стеклянная кожа"', 'روتين العناية اليومي بمنتجات روسية طبيعية للحصول على بشرة مشرقة', 'Ежедневный уход с натуральными русскими продуктами', 'Daily glow routine with Russian skincare', 'Мария Соколова', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800', 'image', null, 'Natura Siberica Cream', 980, 6200, true, 2),
('Smoky Eye Look', 'مكياج العيون الدخاني', 'Дымчатый макияж глаз', 'مكياج عيون دخاني مثالي للسهرات بألوان دافئة', 'Идеальный дымчатый макияж для вечера', 'Perfect smoky eye for evening', 'Елена Петрова', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800', 'image', null, 'Vivienne Sabo Palette', 1560, 11200, true, 3),
('Gloss Application', 'تطبيق ملمع الشفاه', 'Нанесение блеска для губ', 'طريقة سهلة لشفاه ممتلئة وبراقة', 'Простой способ объёмных и блестящих губ', 'Easy plump glossy lips', 'Ольга Иванова', 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800', 'image', null, 'Plump Gloss', 720, 4800, false, 4),
('Natural Day Makeup', 'مكياج نهاري طبيعي', 'Натуральный дневной макияж', 'لوك نهاري بسيط بمنتجات Faberlic', 'Простой дневной образ с Faberlic', 'Simple daily look with Faberlic', 'Дарья Морозова', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', 'image', null, 'Faberlic BB Cream', 890, 5100, false, 5),
('Bold Lipstick Swatches', 'سواتشات أحمر الشفاه الجريء', 'Свотчи яркой помады', 'جربي أجرأ ألوان أحمر الشفاه الروسي هذا الموسم', 'Самые смелые оттенки помады этого сезона', 'Boldest lipstick shades this season', 'Виктория Романова', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', 'https://images.unsplash.com/photo-1631214540242-3cd8c4b0b3b8?w=800', 'image', null, 'Matte Lip Collection', 1100, 7400, false, 6);