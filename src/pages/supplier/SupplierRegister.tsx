import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, FileText, Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSupplier } from '@/hooks/useSupplier';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';

const SupplierRegister = () => {
  const { user } = useAuth();
  const { registerAsSupplier, isSupplier, supplier } = useSupplier();
  const { settings } = useStoreSettings();
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    company_name_ar: '',
    company_name_ru: '',
    description: '',
    description_ar: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    address_ar: '',
    bank_account: '',
  });

  // Redirect if already a supplier
  if (supplier) {
    navigate('/supplier');
    return null;
  }

  // Check if registration is allowed
  if (settings && !settings.allow_supplier_registration) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <Navbar />
        <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">
                {language === 'ar' ? 'تسجيل الموردين مغلق حالياً' : 'Supplier Registration Closed'}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {language === 'ar' 
                  ? 'عذراً، تسجيل الموردين الجدد غير متاح حالياً'
                  : 'Sorry, new supplier registration is not available at this time'}
              </p>
              <Link to="/">
                <Button className="mt-6">
                  {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Require authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <Navbar />
        <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold">
                {language === 'ar' ? 'سجل دخولك أولاً' : 'Please Sign In First'}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {language === 'ar' 
                  ? 'يجب تسجيل الدخول للتقدم كمورد'
                  : 'You need to sign in to register as a supplier'}
              </p>
              <Link to="/auth">
                <Button className="mt-6">
                  {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.company_name) {
      toast.error(language === 'ar' ? 'اسم الشركة مطلوب' : 'Company name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerAsSupplier(form);
      toast.success(
        language === 'ar' 
          ? 'تم تقديم طلبك بنجاح! سنراجعه قريباً'
          : 'Application submitted! We will review it soon'
      );
      navigate('/supplier');
    } catch (error: any) {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className={isRTL ? 'rotate-180' : ''} />
          {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>

        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 rounded-full bg-primary/10 p-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {language === 'ar' ? 'انضم كمورد' : 'Become a Supplier'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'قم بتسجيل شركتك لبيع منتجاتك على منصة نوره'
                  : 'Register your company to sell products on Noura platform'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Names */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {language === 'ar' ? 'اسم الشركة (English) *' : 'Company Name (English) *'}
                    </Label>
                    <Input
                      id="company_name"
                      value={form.company_name}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      placeholder="Company Name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name_ar">
                      {language === 'ar' ? 'اسم الشركة (العربية)' : 'Company Name (Arabic)'}
                    </Label>
                    <Input
                      id="company_name_ar"
                      value={form.company_name_ar}
                      onChange={(e) => setForm({ ...form, company_name_ar: e.target.value })}
                      placeholder="اسم الشركة"
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Contact Email'}
                    </Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={form.contact_email}
                      onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                      placeholder="email@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    </Label>
                    <Input
                      id="contact_phone"
                      value={form.contact_phone}
                      onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                      placeholder="+966"
                    />
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {language === 'ar' ? 'العنوان (English)' : 'Address (English)'}
                    </Label>
                    <Input
                      id="address"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Company address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_ar">
                      {language === 'ar' ? 'العنوان (العربية)' : 'Address (Arabic)'}
                    </Label>
                    <Input
                      id="address_ar"
                      value={form.address_ar}
                      onChange={(e) => setForm({ ...form, address_ar: e.target.value })}
                      placeholder="عنوان الشركة"
                    />
                  </div>
                </div>

                {/* Descriptions */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {language === 'ar' ? 'وصف الشركة (English)' : 'Company Description (English)'}
                    </Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Tell us about your company and products..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description_ar">
                      {language === 'ar' ? 'وصف الشركة (العربية)' : 'Company Description (Arabic)'}
                    </Label>
                    <Textarea
                      id="description_ar"
                      value={form.description_ar}
                      onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                      placeholder="أخبرنا عن شركتك ومنتجاتك..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="rounded-lg bg-secondary/50 p-4">
                  <h3 className="font-medium">
                    {language === 'ar' ? 'ملاحظة مهمة' : 'Important Note'}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {language === 'ar' 
                      ? 'سيتم مراجعة طلبك من قبل فريقنا. بعد الموافقة، ستتمكن من إضافة منتجاتك للمنصة.'
                      : 'Your application will be reviewed by our team. Once approved, you can start adding products.'}
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {language === 'ar' ? 'جاري التقديم...' : 'Submitting...'}
                    </>
                  ) : (
                    language === 'ar' ? 'تقديم الطلب' : 'Submit Application'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SupplierRegister;
