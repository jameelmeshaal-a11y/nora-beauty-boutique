-- إضافة قسم العناية بالجسم
INSERT INTO categories (name, name_ar, slug, parent_id, sort_order, is_active, icon)
VALUES ('Body Care', 'العناية بالجسم', 'body-care', NULL, 5, true, 'Sparkles')
ON CONFLICT (slug) DO NOTHING;

-- إضافة أقسام فرعية للعناية بالجسم
INSERT INTO categories (name, name_ar, slug, parent_id, sort_order, is_active)
SELECT 'Body Lotions', 'لوشن الجسم', 'body-lotions', id, 1, true
FROM categories WHERE slug = 'body-care'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, name_ar, slug, parent_id, sort_order, is_active)
SELECT 'Body Oils', 'زيوت الجسم', 'body-oils', id, 2, true
FROM categories WHERE slug = 'body-care'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, name_ar, slug, parent_id, sort_order, is_active)
SELECT 'Body Scrubs', 'مقشرات الجسم', 'body-scrubs', id, 3, true
FROM categories WHERE slug = 'body-care'
ON CONFLICT (slug) DO NOTHING;