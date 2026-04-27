import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Supplier } from '@/hooks/useSupplier';
import ImageUploader from '@/components/upload/ImageUploader';

interface Props {
  supplier: Supplier & { company_name_ru?: string | null; bank_account?: string | null };
  onUpdate: (updates: Partial<Supplier>) => Promise<any>;
}

const SupplierSettings = ({ supplier, onUpdate }: Props) => {
  const { language } = useLanguage();
  const t = (ar: string, en: string, ru: string) =>
    language === 'ar' ? ar : language === 'ru' ? ru : en;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: supplier.company_name || '',
    company_name_ar: supplier.company_name_ar || '',
    company_name_ru: (supplier as any).company_name_ru || '',
    contact_email: supplier.contact_email || '',
    contact_phone: supplier.contact_phone || '',
    address: supplier.address || '',
    address_ar: supplier.address_ar || '',
    description: supplier.description || '',
    description_ar: supplier.description_ar || '',
    bank_account: (supplier as any).bank_account || '',
    logo_url: supplier.logo_url || '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdate(form as any);
      toast.success(t('تم حفظ التغييرات', 'Settings saved', 'Настройки сохранены'));
    } catch (err: any) {
      toast.error(err.message || t('حدث خطأ', 'Error', 'Ошибка'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('معلومات المتجر', 'Store Info', 'Информация о магазине')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t('شعار المتجر', 'Store Logo', 'Логотип')}</Label>
            <ImageUploader
              bucket="supplier-logos"
              folder={supplier.id}
              onUpload={(urls) => setForm({ ...form, logo_url: urls[0] || form.logo_url })}
              existingImages={form.logo_url ? [form.logo_url] : []}
              onRemove={() => setForm({ ...form, logo_url: '' })}
              maxFiles={1}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>{t('اسم المتجر (English) *', 'Store Name (EN) *', 'Название (EN) *')}</Label>
              <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required maxLength={100} />
            </div>
            <div>
              <Label>{t('اسم المتجر (العربية)', 'Store Name (AR)', 'Название (AR)')}</Label>
              <Input value={form.company_name_ar} onChange={(e) => setForm({ ...form, company_name_ar: e.target.value })} maxLength={100} />
            </div>
            <div>
              <Label>{t('اسم المتجر (Русский)', 'Store Name (RU)', 'Название (RU)')}</Label>
              <Input value={form.company_name_ru} onChange={(e) => setForm({ ...form, company_name_ru: e.target.value })} maxLength={100} placeholder="Магазин" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t('البريد الإلكتروني', 'Email', 'Эл. почта')}</Label>
              <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} maxLength={255} />
            </div>
            <div>
              <Label>{t('الهاتف', 'Phone', 'Телефон')}</Label>
              <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} maxLength={30} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t('وصف المتجر (العربية)', 'Description (AR)', 'Описание (AR)')}</Label>
              <Textarea rows={3} maxLength={1000} value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} />
            </div>
            <div>
              <Label>{t('وصف المتجر (English)', 'Description (EN)', 'Описание (EN)')}</Label>
              <Textarea rows={3} maxLength={1000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('بيانات الدفع', 'Payment Details', 'Платежные данные')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Label>{t('رقم الحساب البنكي / IBAN', 'Bank Account / IBAN', 'IBAN / счёт')}</Label>
          <Input
            value={form.bank_account}
            onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
            placeholder="SA00 0000 0000 0000 0000 0000"
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {t('يستخدم لتحويل أرباحك بعد الموافقة على طلبات السحب',
               'Used to transfer your earnings after payout approval',
               'Используется для перевода доходов')}
          </p>
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving} className="gap-2 bg-crimson hover:bg-crimson/90">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {t('حفظ التغييرات', 'Save Changes', 'Сохранить')}
      </Button>
    </form>
  );
};

export default SupplierSettings;
