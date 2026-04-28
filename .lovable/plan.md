## خطة التنفيذ - المراحل 5، 6، 7 + تحسينات الواجهة

### المرحلة 5: لوحة الأدمن الكاملة
- **AdminDashboard.tsx**: إضافة تبويبات جديدة:
  - **الموردون**: موافقة/رفض، تفعيل، عرض المبيعات
  - **البراندات**: CRUD كامل للـ14 براند روسي (إضافة، تعديل، رفع لوقو، خصومات)
  - **البنرات**: إدارة بنرات الهيرو (3 لغات، تواريخ انتهاء)
  - **الكوبونات**: إنشاء/تعطيل، حد أدنى للطلب، عدد استخدامات
  - **طلبات السحب**: موافقة/رفض دفعات الموردين
  - **المؤثرات**: CRUD مع أكواد الإحالة
  - **التقارير**: إجمالي المبيعات، أفضل المنتجات، عمولات

### المرحلة 6: نظام الكوبونات + الإحالة في Checkout
- إضافة حقل كود الخصم في `CheckoutPage.tsx`
- التحقق من صلاحية الكوبون (تاريخ، حد أدنى، عدد استخدامات)
- تطبيق الخصم (نسبة أو مبلغ ثابت)
- تتبع كود المؤثرة عبر URL (`?ref=NORA15`) وحفظه في localStorage
- تسجيل العمولة في `vendor_payouts` عند إتمام الطلب

### المرحلة 7: صفحات إضافية
- **صفحة المؤثرات الكاملة** `/influencers`: عرض كل المؤثرات مع منتجاتهن المفضلة
- **صفحة كل البراندات** `/brands`: شبكة لجميع الـ14 براند
- **صفحة العروض** `/deals`: المنتجات المخفضة + الكوبونات النشطة
- ربطها بالـ Navbar وMegaMenu

### تحسينات الواجهة الرئيسية
1. **استبدال صور البنرات الحالية**:
   - حذف الصور القديمة (شانيل) وتحديث الـ3 بنرات في DB بصور احترافية:
     - بنر 1: فتاة روسية مع مكياج فاخر
     - بنر 2: منتجات العناية بالبشرة الروسية
     - بنر 3: مجموعة العناية بالجسم
   - استخدام صور من Unsplash/Pexels عبر URL مباشر، أو توليد صور AI

2. **إعادة تسمية الفئات** (في DB - جدول categories):
   - "مستحضرات التجميل" → **"التجميل"**
   - "العناية بالبشرة" → **"البشرة"**
   - "العناية بالجسم" → **"الجسم"**
   - تحديث `name_ar` لكل فئة

3. **إعادة ترتيب Navbar/MegaMenu**:
   - نقل "من نحن" من القائمة العلوية إلى **Footer فقط**
   - الترتيب الجديد: الرئيسية | المنتجات | التجميل | البشرة | الشعر | الجسم | العطور | البراندات | المؤثرات | العروض

4. **إضافة منتجات روسية احترافية** (15+ منتج جديد):
   - **التجميل**: أحمر شفاه Faberlic، ماسكارا Pure Love، كحل Vivienne Sabo، باليت ظلال Belita
   - **البشرة**: كريم Natura Siberica للبشرة الجافة (مناسب لجو السعودية)، سيروم Librederm فيتامين C، ماسك Planeta Organica بالطين الأبيض، واقي شمس SPF50 Natura Siberica
   - **الشعر**: زيت Natura Siberica للشعر التالف (مناسب للحرارة)، شامبو Belita بالكافيار، ماسك Planeta Organica
   - **الجسم**: لوشن Natura Siberica، سكراب Planeta Organica بالقهوة، ديودرانت طبيعي Belita
   - **العطور**: Brocard، Dilis، Christine Lavoisier
   - كل منتج: اسم بـ3 لغات، وصف، صورة، سعر بالريال، ربط بالبراند والفئة

### الملفات المتأثرة
**جديدة**:
- `src/components/admin/BrandsManager.tsx`
- `src/components/admin/BannersManager.tsx`
- `src/components/admin/CouponsManager.tsx`
- `src/components/admin/PayoutsManager.tsx`
- `src/components/admin/InfluencersManager.tsx`
- `src/components/admin/SuppliersManager.tsx`
- `src/components/admin/AdminReports.tsx`
- `src/pages/InfluencersPage.tsx`
- `src/pages/BrandsListPage.tsx`
- `src/pages/DealsPage.tsx`
- `src/hooks/useCoupon.tsx`

**معدّلة**:
- `src/pages/AdminDashboard.tsx` - تبويبات جديدة
- `src/pages/CheckoutPage.tsx` - كوبون + ref
- `src/components/layout/Navbar.tsx` - حذف "من نحن"، ترتيب جديد
- `src/components/navigation/MegaMenu.tsx` - أسماء فئات جديدة
- `src/components/layout/Footer.tsx` - إضافة "من نحن"
- `src/App.tsx` - راوتات جديدة

**Migrations**:
- تحديث `categories.name_ar` (التجميل/البشرة/الشعر/الجسم/العطور)
- تحديث `banners.image_url` بصور جديدة
- إضافة 15+ منتج روسي مرتبط بالبراندات والفئات

### التنفيذ المتوازي
سيتم إنشاء كل المكونات + الـmigration الواحدة دفعة واحدة لتوفير النقاط، ثم ربطها في AdminDashboard وApp.tsx في نفس الرسالة.
