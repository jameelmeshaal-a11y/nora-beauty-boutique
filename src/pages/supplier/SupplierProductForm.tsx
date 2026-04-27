import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useSupplier } from '@/hooks/useSupplier';
import { useCategories } from '@/hooks/useCategories';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import ImageUploader from '@/components/upload/ImageUploader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';

const SupplierProductForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const { user } = useAuth();
  const { supplier, isLoading: supplierLoading } = useSupplier();
  const { categories } = useCategories();
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [brands, setBrands] = useState<{ id: string; name: string; name_ar: string | null; name_ru: string | null }[]>([]);
  const [form, setForm] = useState({
    name: '',
    name_ar: '',
    name_ru: '',
    description: '',
    description_ar: '',
    description_ru: '',
    price: '',
    original_price: '',
    category: '',
    category_id: '',
    brand_id: '',
    image_url: '',
    images: [] as string[],
    stock_quantity: '',
    low_stock_threshold: '5',
    in_stock: true,
    is_featured: false,
    is_bestseller: false,
    is_new: true,
  });

  // Load brands
  useEffect(() => {
    supabase.from('brands').select('id, name, name_ar, name_ru').eq('is_active', true).order('sort_order')
      .then(({ data }) => data && setBrands(data as any));
  }, []);

  // Fetch product if editing
  useEffect(() => {
    if (isEditing && supplier) {
      fetchProduct();
    }
  }, [isEditing, supplier]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('supplier_id', supplier?.id)
        .single();

      if (error) throw error;
      if (!data) {
        toast.error(language === 'ar' ? 'المنتج غير موجود' : 'Product not found');
        navigate('/supplier');
        return;
      }

      setForm({
        name: data.name || '',
        name_ar: data.name_ar || '',
        name_ru: (data as any).name_ru || '',
        description: data.description || '',
        description_ar: data.description_ar || '',
        description_ru: (data as any).description_ru || '',
        price: data.price?.toString() || '',
        original_price: data.original_price?.toString() || '',
        category: data.category || '',
        category_id: data.category_id || '',
        brand_id: (data as any).brand_id || '',
        image_url: data.image_url || '',
        images: data.images || [],
        stock_quantity: data.stock_quantity?.toString() || '0',
        low_stock_threshold: data.low_stock_threshold?.toString() || '5',
        in_stock: data.in_stock ?? true,
        is_featured: data.is_featured ?? false,
        is_bestseller: data.is_bestseller ?? false,
        is_new: data.is_new ?? false,
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error loading product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.price) {
      toast.error(language === 'ar' ? 'الاسم والسعر مطلوبان' : 'Name and price are required');
      return;
    }

    if (!supplier) {
      toast.error(language === 'ar' ? 'خطأ في الحساب' : 'Account error');
      return;
    }

    setIsSaving(true);

    try {
      const productData = {
        name: form.name,
        name_ar: form.name_ar || null,
        description: form.description || null,
        description_ar: form.description_ar || null,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        category: form.category || 'cosmetics',
        category_id: form.category_id || null,
        image_url: form.images[0] || form.image_url || null,
        images: form.images.length > 0 ? form.images : null,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
        in_stock: form.in_stock,
        is_featured: form.is_featured,
        is_bestseller: form.is_bestseller,
        is_new: form.is_new,
        supplier_id: supplier.id,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);

        if (error) throw error;
        toast.success(language === 'ar' ? 'تم تحديث المنتج' : 'Product updated');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success(language === 'ar' ? 'تم إضافة المنتج' : 'Product added');
      }

      navigate('/supplier');
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error saving product'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleImagesUpload = (urls: string[]) => {
    setForm({ ...form, images: [...form.images, ...urls] });
  };

  const handleImageRemove = (url: string) => {
    setForm({ ...form, images: form.images.filter(img => img !== url) });
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (supplierLoading || (isEditing && isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!supplier) {
    navigate('/supplier/register');
    return null;
  }

  // Get leaf categories for selection
  const leafCategories = categories.filter(c => 
    !categories.some(other => other.parent_id === c.id)
  );

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Link 
          to="/supplier" 
          className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className={isRTL ? 'rotate-180' : ''} />
          {language === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
        </Link>

        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>
              {isEditing 
                ? (language === 'ar' ? 'تعديل المنتج' : 'Edit Product')
                : (language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Images */}
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'صور المنتج' : 'Product Images'}</Label>
                <ImageUploader
                  bucket="product-images"
                  folder={supplier.id}
                  onUpload={handleImagesUpload}
                  existingImages={form.images}
                  onRemove={handleImageRemove}
                  maxFiles={5}
                />
              </div>

              {/* Names */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'اسم المنتج (English) *' : 'Product Name (English) *'}</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Product Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'اسم المنتج (العربية)' : 'Product Name (Arabic)'}</Label>
                  <Input
                    value={form.name_ar}
                    onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                    placeholder="اسم المنتج"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف (English)' : 'Description (English)'}</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف (العربية)' : 'Description (Arabic)'}</Label>
                  <Textarea
                    value={form.description_ar}
                    onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'السعر (SAR) *' : 'Price (SAR) *'}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'السعر الأصلي' : 'Original Price'}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                    placeholder="للتخفيضات"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'التصنيف' : 'Category'}</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) => setForm({ ...form, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'ar' ? 'اختر التصنيف' : 'Select category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {leafCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {language === 'ar' ? cat.name_ar || cat.name : cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stock */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الكمية المتوفرة' : 'Stock Quantity'}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.stock_quantity}
                    onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'حد التنبيه' : 'Low Stock Threshold'}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.low_stock_threshold}
                    onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Label>{language === 'ar' ? 'متوفر في المخزون' : 'In Stock'}</Label>
                  <Switch
                    checked={form.in_stock}
                    onCheckedChange={(checked) => setForm({ ...form, in_stock: checked })}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Label>{language === 'ar' ? 'منتج جديد' : 'New Product'}</Label>
                  <Switch
                    checked={form.is_new}
                    onCheckedChange={(checked) => setForm({ ...form, is_new: checked })}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isEditing 
                        ? (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
                        : (language === 'ar' ? 'إضافة المنتج' : 'Add Product')
                      }
                    </>
                  )}
                </Button>
                <Link to="/supplier">
                  <Button type="button" variant="outline">
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SupplierProductForm;
