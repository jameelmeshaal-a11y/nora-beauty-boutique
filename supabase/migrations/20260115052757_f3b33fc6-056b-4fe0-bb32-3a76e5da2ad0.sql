-- إضافة حقول العينات المجانية للمنتجات
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_free_sample BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sample_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sample_description_ar TEXT;

-- إضافة تصنيف الشعر الرئيسي
INSERT INTO categories (name, name_ar, slug, parent_id, sort_order, is_active, icon)
VALUES ('Hair', 'الشعر', 'hair', NULL, 5, true, 'Sparkles')
ON CONFLICT (slug) DO NOTHING;

-- إضافة التصنيفات الفرعية للشعر
INSERT INTO categories (name, name_ar, slug, parent_id, sort_order, is_active)
SELECT 'Hair Oils', 'زيوت الشعر', 'hair-oils', id, 1, true
FROM categories WHERE slug = 'hair'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, name_ar, slug, parent_id, sort_order, is_active)
SELECT 'Shampoos', 'شامبوهات', 'shampoos', id, 2, true
FROM categories WHERE slug = 'hair'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, name_ar, slug, parent_id, sort_order, is_active)
SELECT 'Hair Masks', 'ماسكات الشعر', 'hair-masks', id, 3, true
FROM categories WHERE slug = 'hair'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, name_ar, slug, parent_id, sort_order, is_active)
SELECT 'Conditioners', 'بلسم الشعر', 'conditioners', id, 4, true
FROM categories WHERE slug = 'hair'
ON CONFLICT (slug) DO NOTHING;

-- إضافة تصنيف Discover للعروض
INSERT INTO categories (name, name_ar, slug, parent_id, sort_order, is_active, icon)
VALUES ('Discover', 'اكتشفي', 'discover', NULL, 6, true, 'Compass')
ON CONFLICT (slug) DO NOTHING;