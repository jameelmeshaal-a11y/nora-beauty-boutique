import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, ShoppingBag, Star, Eye } from 'lucide-react';

interface Props {
  supplierId: string;
  products: any[];
  orderItems: any[];
}

const COLORS = ['#CC2936', '#D4AF37', '#8B0000', '#E8455A', '#946846', '#5C2018'];

const SupplierAnalytics = ({ supplierId, products, orderItems }: Props) => {
  const { language } = useLanguage();
  const t = (ar: string, en: string, ru: string) =>
    language === 'ar' ? ar : language === 'ru' ? ru : en;

  // Sales over last 30 days
  const salesByDay = useMemo(() => {
    const map: Record<string, { date: string; sales: number; orders: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      map[key] = { date: key.substring(5), sales: 0, orders: 0 };
    }
    orderItems.forEach((it: any) => {
      const dt = it.orders?.created_at?.split('T')[0];
      if (dt && map[dt]) {
        map[dt].sales += Number(it.price) * Number(it.quantity);
        map[dt].orders += 1;
      }
    });
    return Object.values(map);
  }, [orderItems]);

  // Top products
  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; sales: number; qty: number }> = {};
    orderItems.forEach((it: any) => {
      const id = it.product_id || it.products?.id;
      if (!id) return;
      const prod = products.find((p: any) => p.id === id);
      const name = prod ? (language === 'ar' ? prod.name_ar || prod.name : prod.name) : it.product_name;
      if (!counts[id]) counts[id] = { name, sales: 0, qty: 0 };
      counts[id].sales += Number(it.price) * Number(it.quantity);
      counts[id].qty += Number(it.quantity);
    });
    return Object.values(counts).sort((a, b) => b.sales - a.sales).slice(0, 5);
  }, [orderItems, products, language]);

  // Category distribution
  const byCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p: any) => {
      const cat = p.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [products]);

  // Reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['supplier-reviews', supplierId],
    queryFn: async () => {
      const productIds = products.map((p: any) => p.id);
      if (!productIds.length) return [];
      const { data } = await supabase
        .from('product_reviews')
        .select('rating, comment, created_at, product_id')
        .in('product_id', productIds)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: products.length > 0,
  });

  const totalSales = orderItems.reduce((s: number, i: any) => s + Number(i.price) * Number(i.quantity), 0);
  const avgRating = reviews.length
    ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
    : 0;

  const kpis = [
    { icon: TrendingUp, color: 'text-emerald-600', label: t('إجمالي الإيرادات', 'Total Revenue', 'Общая выручка'), value: `${totalSales.toFixed(0)} SAR` },
    { icon: ShoppingBag, color: 'text-blue-600', label: t('عدد الطلبات', 'Orders', 'Заказы'), value: orderItems.length },
    { icon: Eye, color: 'text-purple-600', label: t('المنتجات النشطة', 'Active Products', 'Активные товары'), value: products.filter((p: any) => p.in_stock).length },
    { icon: Star, color: 'text-amber-500', label: t('متوسط التقييم', 'Avg Rating', 'Средний рейтинг'), value: avgRating.toFixed(1) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center gap-3">
              <div className={`p-3 rounded-lg bg-muted ${k.color}`}>
                <k.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="text-xl font-bold">{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t('المبيعات (آخر 30 يوماً)', 'Sales (Last 30 days)', 'Продажи (30 дней)')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#CC2936" strokeWidth={2} dot={false} name={t('المبيعات', 'Sales', 'Продажи')} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('أفضل المنتجات', 'Top Products', 'Лучшие товары')}</CardTitle></CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">{t('لا توجد بيانات بعد', 'No data yet', 'Нет данных')}</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#D4AF37" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('توزيع المنتجات حسب التصنيف', 'Products by Category', 'Товары по категориям')}</CardTitle></CardHeader>
          <CardContent>
            {byCategory.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">{t('لا توجد منتجات', 'No products', 'Нет товаров')}</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('أحدث التقييمات', 'Recent Reviews', 'Последние отзывы')}</CardTitle></CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">{t('لا توجد تقييمات', 'No reviews', 'Нет отзывов')}</p>
            ) : (
              <div className="space-y-3 max-h-[260px] overflow-auto">
                {reviews.slice(0, 6).map((r: any, i: number) => (
                  <div key={i} className="border-b border-border pb-2 last:border-0">
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={`h-3 w-3 ${idx < r.rating ? 'fill-amber-500 text-amber-500' : 'text-muted'}`} />
                      ))}
                      <span className="text-xs text-muted-foreground ms-2">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {r.comment && <p className="text-sm line-clamp-2">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierAnalytics;
