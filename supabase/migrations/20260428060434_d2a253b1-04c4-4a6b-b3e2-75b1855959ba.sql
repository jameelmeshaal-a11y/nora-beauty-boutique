
-- Rename categories per user request (التجميل/البشرة/الجسم)
UPDATE public.categories SET name_ar='التجميل', name_ru='Макияж', name='Beauty' WHERE slug='cosmetics';
UPDATE public.categories SET name_ar='البشرة', name_ru='Уход за кожей', name='Skin' WHERE slug='skin';
UPDATE public.categories SET name_ar='الجسم', name_ru='Уход за телом', name='Body' WHERE slug='body-care';
UPDATE public.categories SET name_ru='Уход за волосами' WHERE slug='hair' AND name_ru IS NULL;
UPDATE public.categories SET name_ru='Парфюмерия' WHERE slug IN ('perfumes','fragrance') AND name_ru IS NULL;

-- Update banners with Russian-beauty themed images & 3-language titles
UPDATE public.banners SET 
  image_url='https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1920&h=700&fit=crop&q=85',
  title_ar='الجمال الروسي الأصيل',
  title_ru='Подлинная русская красота',
  title='Authentic Russian Beauty',
  subtitle_ar='يصلكِ في السعودية مباشرة من روسيا',
  subtitle_ru='Доставка прямо из России в Саудовскую Аравию',
  subtitle='Delivered straight from Russia to Saudi Arabia'
WHERE id='3458c63e-5a09-4042-a10e-f25fc3b4834f';

UPDATE public.banners SET 
  image_url='https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1920&h=700&fit=crop&q=85',
  title_ar='عناية فاخرة بالبشرة',
  title_ru='Роскошный уход за кожей',
  title='Luxury Skin Care',
  subtitle_ar='منتجات Natura Siberica و Librederm بأسعار حصرية',
  subtitle_ru='Natura Siberica и Librederm по эксклюзивным ценам',
  subtitle='Natura Siberica & Librederm at exclusive prices'
WHERE id='40ac1c68-6fb1-42f1-9f14-28fdf5c71180';

UPDATE public.banners SET 
  image_url='https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1920&h=700&fit=crop&q=85',
  title_ar='مكياج روسي احترافي',
  title_ru='Профессиональный российский макияж',
  title='Professional Russian Makeup',
  subtitle_ar='Vivienne Sabo و Faberlic — للمحترفات',
  subtitle_ru='Vivienne Sabo и Faberlic — для профессионалов',
  subtitle='Vivienne Sabo & Faberlic — for professionals'
WHERE id='ba7a8020-d0ac-4d2f-8dff-3d1602aa2bf5';

-- Seed 18 Russian products tailored for the Saudi market (heat-resistant, hydrating, halal-friendly)
INSERT INTO public.products (name, name_ar, name_ru, description, description_ar, description_ru, price, original_price, category, brand, brand_id, image_url, in_stock, is_featured, is_bestseller, is_new, rating, reviews_count, stock_quantity, discount_percent)
VALUES
-- Beauty (التجميل)
('Faberlic SecretStory Lipstick', 'أحمر شفاه فابرليك سيكرت ستوري', 'Помада Faberlic SecretStory', 'Long-lasting matte lipstick, 8 hours', 'أحمر شفاه مات يدوم 8 ساعات يقاوم حرارة الصيف', 'Стойкая матовая помада на 8 часов', 89, 119, 'lipstick', 'Faberlic', 'f7614896-1097-4693-a8f8-92a9b9cf7a87', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop', true, true, true, true, 4.8, 142, 50, 25),
('Vivienne Sabo Cabaret Mascara', 'ماسكارا فيفيان سابو كاباريه', 'Тушь Vivienne Sabo Cabaret', 'Volume mascara, waterproof', 'ماسكارا تكثيف مقاومة للماء والحرارة', 'Объёмная водостойкая тушь', 75, 95, 'mascara', 'Vivienne Sabo', '2551a215-8d73-423b-ade2-ea61c89a090c', 'https://images.unsplash.com/photo-1631214540242-7b54a7c61eb5?w=600&h=600&fit=crop', true, true, true, false, 4.9, 287, 80, 21),
('Luxvisage Eyeliner', 'كحل لاكسفيزاج الأسود', 'Подводка Luxvisage', 'Smudge-proof black liquid liner', 'كحل سائل أسود لا يلطخ يدوم 12 ساعة', 'Стойкая чёрная подводка', 49, NULL, 'eyeliner', 'Luxvisage', 'c13d4c79-63b3-45ab-9298-fe9c6461460f', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop', true, false, true, false, 4.7, 95, 60, NULL),
('Belita Velvet Eyeshadow Palette', 'باليت ظلال بيليتا فيلفت', 'Палитра теней Belita Velvet', '12-color matte & shimmer palette', 'باليت 12 لون مات ولامع للسهرات', 'Палитра 12 оттенков матовых и шиммерных', 159, 199, 'eyeshadow', 'Belita-Vitex', '894582ed-4e64-4afe-92b0-d9c36259a6e3', 'https://images.unsplash.com/photo-1583241475880-083f84372725?w=600&h=600&fit=crop', true, true, false, true, 4.8, 64, 30, 20),
('Divage Stay Foundation SPF20', 'كريم أساس ديفاج SPF20', 'Тональный крем Divage SPF20', 'Lightweight foundation with sun protection', 'كريم أساس خفيف بحماية شمسية مناسب لجو السعودية', 'Лёгкий тональный с SPF', 109, NULL, 'foundation', 'Divage', 'bbb33d2f-93cd-43b5-858e-ecc43fa3f026', 'https://images.unsplash.com/photo-1631730486784-1bf3a35b21d0?w=600&h=600&fit=crop', true, false, false, true, 4.6, 38, 45, NULL),
('Art-Visage Blush', 'أحمر خدود آرت فيزاج', 'Румяна Art-Visage', 'Silky powder blush, peach tone', 'أحمر خدود حريري بدرجة الخوخ', 'Шёлковые румяна персикового тона', 65, 85, 'blush', 'Art-Visage', '8e69fe31-c89c-437b-b4a2-ba861230f1d5', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop', true, false, true, false, 4.7, 52, 40, 23),

-- Skin (البشرة) - Saudi-climate optimized
('Natura Siberica Hydrating Cream', 'كريم ترطيب ناتورا سيبيريكا', 'Увлажняющий крем Natura Siberica', 'Deep hydration for dry skin in hot climates', 'ترطيب عميق للبشرة الجافة في المناخ الحار — مثالي للسعودية', 'Глубокое увлажнение для сухой кожи', 145, 189, 'moisturizers', 'Natura Siberica', '0f47bfa7-74df-403b-a73b-73049b67290b', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop', true, true, true, false, 4.9, 312, 70, 23),
('Librederm Vitamin C Serum', 'سيروم فيتامين C ليبريديرم', 'Сыворотка с витамином C Librederm', 'Brightening serum, anti-pigmentation', 'سيروم تفتيح يقاوم البقع والاسمرار من الشمس', 'Осветляющая сыворотка против пигментации', 199, 259, 'serums', 'Holy Land', '3d9f8b59-389f-487a-904b-4f960ffcc965', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop', true, true, true, true, 4.9, 198, 55, 23),
('Planeta Organica White Clay Mask', 'ماسك الطين الأبيض بلانيتا', 'Маска с белой глиной Planeta Organica', 'Detox mask for oily skin', 'ماسك تنقية وتحكم بالدهون للبشرة المختلطة', 'Очищающая маска для жирной кожи', 79, NULL, 'masks', 'Planeta Organica', '191c2ddd-30f2-48be-823f-d154f83f6c09', 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=600&h=600&fit=crop', true, false, true, false, 4.7, 89, 60, NULL),
('Natura Siberica Sunscreen SPF50', 'واقي شمس SPF50 ناتورا سيبيريكا', 'Солнцезащитный крем SPF50', 'Mineral sunscreen, broad spectrum', 'واقي شمس معدني SPF50 ضروري لجو السعودية', 'Минеральный санскрин SPF50', 175, 220, 'moisturizers', 'Natura Siberica', '0f47bfa7-74df-403b-a73b-73049b67290b', 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=600&fit=crop', true, true, false, true, 4.8, 156, 80, 20),
('Green Mama Rose Toner', 'تونر الورد جرين ماما', 'Тоник с розой Green Mama', 'Calming rose water toner', 'تونر ماء الورد المهدئ يستعمل بعد الغسول', 'Успокаивающий тоник с розовой водой', 69, 89, 'cleansers', 'Green Mama', 'e1a91d40-94c8-4841-95a0-4773aa2fd6f6', 'https://images.unsplash.com/photo-1615397587950-3cbb55f95b77?w=600&h=600&fit=crop', true, false, false, true, 4.6, 47, 50, 22),

-- Hair (الشعر) - Heat-damaged hair friendly
('Natura Siberica Argan Hair Oil', 'زيت الأرغان للشعر ناتورا سيبيريكا', 'Аргановое масло Natura Siberica', 'Repair oil for heat-damaged hair', 'زيت إصلاح للشعر التالف من الحرارة والصبغات', 'Восстанавливающее масло для повреждённых волос', 119, 149, 'hair-oils', 'Natura Siberica', '0f47bfa7-74df-403b-a73b-73049b67290b', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop', true, true, true, false, 4.9, 234, 65, 20),
('Belita Caviar Shampoo', 'شامبو الكافيار بيليتا', 'Шампунь с икрой Belita', 'Luxury caviar protein shampoo', 'شامبو فاخر ببروتين الكافيار لتغذية الشعر', 'Питательный шампунь с икрой', 89, NULL, 'shampoos', 'Belita-Vitex', '894582ed-4e64-4afe-92b0-d9c36259a6e3', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&h=600&fit=crop', true, false, true, false, 4.7, 78, 55, NULL),
('Planeta Organica Argan Mask', 'ماسك الأرغان بلانيتا للشعر', 'Маска с арганой Planeta', 'Deep conditioning hair mask', 'ماسك ترطيب عميق للشعر الجاف', 'Глубоко питающая маска для волос', 95, 125, 'hair-masks', 'Planeta Organica', '191c2ddd-30f2-48be-823f-d154f83f6c09', 'https://images.unsplash.com/photo-1626015449634-dd44b3a08d5d?w=600&h=600&fit=crop', true, false, false, true, 4.6, 41, 40, 24),

-- Body (الجسم)
('Natura Siberica Body Butter', 'زبدة الجسم ناتورا سيبيريكا', 'Масло для тела Natura Siberica', 'Rich body butter with Siberian herbs', 'زبدة جسم غنية بالأعشاب السيبيرية للترطيب الفائق', 'Питательное масло с сибирскими травами', 99, 129, 'body-lotions', 'Natura Siberica', '0f47bfa7-74df-403b-a73b-73049b67290b', 'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=600&h=600&fit=crop', true, true, true, false, 4.8, 167, 60, 23),
('Planeta Organica Coffee Scrub', 'سكراب القهوة بلانيتا', 'Кофейный скраб Planeta', 'Exfoliating coffee body scrub', 'مقشر جسم بالقهوة ينعّم البشرة ويزيل الخلايا الميتة', 'Кофейный скраб для тела', 75, 99, 'body-scrubs', 'Planeta Organica', '191c2ddd-30f2-48be-823f-d154f83f6c09', 'https://images.unsplash.com/photo-1599733589046-9a4e26e5c1cd?w=600&h=600&fit=crop', true, true, false, true, 4.8, 92, 70, 24),
('Belita Natural Deodorant', 'مزيل عرق طبيعي بيليتا', 'Натуральный дезодорант Belita', 'Aluminum-free natural deodorant', 'مزيل عرق طبيعي خالي من الألمنيوم يدوم 24 ساعة', 'Натуральный дезодорант без алюминия', 55, NULL, 'body-care', 'Belita-Vitex', '894582ed-4e64-4afe-92b0-d9c36259a6e3', 'https://images.unsplash.com/photo-1626704693125-9d67cea54a72?w=600&h=600&fit=crop', true, false, true, false, 4.5, 63, 90, NULL),

-- Perfumes (العطور)
('Brocard Mon Etoile', 'عطر بروكارد مون إتوال', 'Brocard Mon Etoile', 'Floral oriental fragrance, 50ml', 'عطر شرقي زهري فاخر — مزيج العود والياسمين', 'Цветочно-восточный аромат', 245, 320, 'perfumes', 'Mixit', '7e0b7c9b-fbf7-4d77-b205-b1f0530adf7f', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop', true, true, true, false, 4.9, 178, 35, 23);
