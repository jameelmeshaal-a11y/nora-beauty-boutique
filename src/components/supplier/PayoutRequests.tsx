import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Wallet, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Payout {
  id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  notes: string | null;
  requested_at: string;
  processed_at: string | null;
}

interface Props {
  supplierId: string;
  totalSales?: number;
  commissionRate?: number;
}

const MIN_AMOUNT = 500;

const PayoutRequests = ({ supplierId, totalSales = 0, commissionRate = 10 }: Props) => {
  const { language } = useLanguage();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [notes, setNotes] = useState('');

  const t = (ar: string, en: string, ru: string) =>
    language === 'ar' ? ar : language === 'ru' ? ru : en;

  const { data: payouts = [], isLoading } = useQuery({
    queryKey: ['vendor-payouts', supplierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_payouts')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('requested_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Payout[];
    },
  });

  // Calculate available balance: net sales - sum of approved/paid payouts
  const claimed = payouts
    .filter((p) => ['approved', 'paid', 'pending'].includes(p.status))
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const netRevenue = totalSales * (1 - commissionRate / 100);
  const available = Math.max(0, netRevenue - claimed);

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < MIN_AMOUNT) {
      toast.error(t(`الحد الأدنى ${MIN_AMOUNT} ر.س`, `Minimum ${MIN_AMOUNT} SAR`, `Минимум ${MIN_AMOUNT} SAR`));
      return;
    }
    if (amt > available) {
      toast.error(t('المبلغ يتجاوز رصيدك المتاح', 'Exceeds available balance', 'Превышает доступный баланс'));
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('vendor_payouts').insert({
        supplier_id: supplierId,
        amount: amt,
        payment_method: method,
        notes: notes || null,
        status: 'pending',
      });
      if (error) throw error;
      toast.success(t('تم تقديم طلب السحب', 'Payout requested', 'Запрос на выплату отправлен'));
      setOpen(false);
      setAmount('');
      setNotes('');
      qc.invalidateQueries({ queryKey: ['vendor-payouts', supplierId] });
    } catch (e: any) {
      toast.error(e.message || t('حدث خطأ', 'Error', 'Ошибка'));
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: t('قيد المراجعة', 'Pending', 'В ожидании') },
      approved: { variant: 'default', label: t('موافق عليه', 'Approved', 'Одобрено') },
      paid: { variant: 'default', label: t('مدفوع', 'Paid', 'Выплачено') },
      rejected: { variant: 'destructive', label: t('مرفوض', 'Rejected', 'Отклонено') },
    };
    const cfg = map[s] || { variant: 'outline', label: s };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{t('إجمالي المبيعات', 'Total Sales', 'Общие продажи')}</p>
            <p className="mt-1 text-2xl font-bold">{totalSales.toFixed(2)} <span className="text-sm">SAR</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{t('بعد العمولة', 'Net (after commission)', 'Чистый доход')}</p>
            <p className="mt-1 text-2xl font-bold text-primary">{netRevenue.toFixed(2)} <span className="text-sm">SAR</span></p>
            <p className="text-xs text-muted-foreground mt-1">{t('عمولة', 'Commission', 'Комиссия')}: {commissionRate}%</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-russian-soft border-russian-gold/30">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{t('متاح للسحب', 'Available', 'Доступно к выводу')}</p>
            <p className="mt-1 text-2xl font-bold text-crimson">{available.toFixed(2)} <span className="text-sm">SAR</span></p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="mt-3 gap-2 bg-crimson hover:bg-crimson/90" disabled={available < MIN_AMOUNT}>
                  <Plus className="h-4 w-4" />
                  {t('طلب سحب', 'Request Payout', 'Запросить выплату')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('طلب سحب أرباح', 'Request Payout', 'Запрос на выплату')}</DialogTitle>
                  <DialogDescription>
                    {t(`الحد الأدنى ${MIN_AMOUNT} ر.س. سيتم تحويل المبلغ خلال 3-5 أيام عمل.`,
                      `Minimum ${MIN_AMOUNT} SAR. Funds transferred within 3-5 business days.`,
                      `Минимум ${MIN_AMOUNT} SAR. Перевод за 3-5 рабочих дней.`)}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{t('المبلغ (SAR)', 'Amount (SAR)', 'Сумма (SAR)')}</Label>
                    <Input
                      type="number"
                      min={MIN_AMOUNT}
                      max={available}
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={String(MIN_AMOUNT)}
                    />
                  </div>
                  <div>
                    <Label>{t('طريقة الدفع', 'Payment Method', 'Способ оплаты')}</Label>
                    <select
                      className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                    >
                      <option value="bank_transfer">{t('تحويل بنكي', 'Bank Transfer', 'Банковский перевод')}</option>
                      <option value="paypal">PayPal</option>
                      <option value="wise">Wise</option>
                    </select>
                  </div>
                  <div>
                    <Label>{t('ملاحظات', 'Notes', 'Примечания')}</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={500} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>{t('إلغاء', 'Cancel', 'Отмена')}</Button>
                  <Button onClick={handleSubmit} disabled={submitting} className="bg-crimson hover:bg-crimson/90">
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {t('إرسال', 'Submit', 'Отправить')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Payouts history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-crimson" />
            {t('سجل طلبات السحب', 'Payout History', 'История выплат')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : payouts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t('لا توجد طلبات سحب بعد', 'No payout requests yet', 'Пока нет запросов')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('التاريخ', 'Date', 'Дата')}</TableHead>
                  <TableHead>{t('المبلغ', 'Amount', 'Сумма')}</TableHead>
                  <TableHead>{t('الطريقة', 'Method', 'Способ')}</TableHead>
                  <TableHead>{t('الحالة', 'Status', 'Статус')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{new Date(p.requested_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-bold">{Number(p.amount).toFixed(2)} SAR</TableCell>
                    <TableCell className="capitalize">{p.payment_method || '-'}</TableCell>
                    <TableCell>{statusBadge(p.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayoutRequests;
