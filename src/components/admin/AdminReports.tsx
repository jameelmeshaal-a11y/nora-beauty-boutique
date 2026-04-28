import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, Package, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--crimson))", "hsl(var(--russian-gold))", "#8b5cf6", "#10b981", "#f59e0b"];

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, products: 0 });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from("orders").select("total, user_id"),
        supabase.from("products").select("name_ar, name, category, reviews_count, rating").order("reviews_count", { ascending: false }).limit(10),
      ]);
      const orders = ordersRes.data || [];
      const products = productsRes.data || [];
      const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
      const customers = new Set(orders.map((o) => o.user_id)).size;
      setStats({ revenue, orders: orders.length, customers, products: products.length });
      setTopProducts(products.slice(0, 5).map((p) => ({ name: (p.name_ar || p.name).slice(0, 15), reviews: p.reviews_count || 0 })));
      const catMap: Record<string, number> = {};
      products.forEach((p) => { catMap[p.category] = (catMap[p.category] || 0) + 1; });
      setCategoryData(Object.entries(catMap).slice(0, 5).map(([name, value]) => ({ name, value })));
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  const cards = [
    { title: "إجمالي الإيرادات", value: `${stats.revenue.toLocaleString()} ر.س`, icon: DollarSign, color: "text-green-600" },
    { title: "الطلبات", value: stats.orders, icon: TrendingUp, color: "text-blue-600" },
    { title: "العملاء", value: stats.customers, icon: Users, color: "text-purple-600" },
    { title: "المنتجات", value: stats.products, icon: Package, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">التقارير والإحصائيات</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((c, i) => (
          <Card key={i}><CardContent className="p-4 flex justify-between items-center">
            <div><p className="text-xs text-muted-foreground">{c.title}</p><p className="text-2xl font-bold">{c.value}</p></div>
            <c.icon className={`h-8 w-8 ${c.color}`} />
          </CardContent></Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle>أفضل 5 منتجات</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="reviews" fill="hsl(var(--crimson))" /></BarChart>
          </ResponsiveContainer>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>توزيع الفئات</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </div>
    </div>
  );
};

export default AdminReports;
