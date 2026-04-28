import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import ProductCard from "@/components/product/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Tag, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DealsPage = () => {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("*").eq("in_stock", true).gt("discount_percent", 0).order("discount_percent", { ascending: false }).limit(24),
      supabase.from("coupons").select("*").eq("is_active", true),
    ]).then(([p, c]) => { setProducts(p.data || []); setCoupons(c.data || []); });
  }, []);

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast({ title: language === "ar" ? "تم النسخ" : "Copied", description: code });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />
      <CartDrawer />
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-center mb-8 text-gradient-russian">{language === "ar" ? "🔥 العروض والتخفيضات" : language === "ru" ? "🔥 Акции и скидки" : "🔥 Deals & Offers"}</h1>

        {coupons.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">{language === "ar" ? "كوبونات نشطة" : "Active Coupons"}</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {coupons.map((c) => (
                <Card key={c.id} className="border-2 border-dashed border-russian-gold">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <Tag className="h-5 w-5 text-crimson mb-1" />
                      <p className="font-mono font-bold text-lg text-crimson">{c.code}</p>
                      <p className="text-xs text-muted-foreground">{c.discount_type === "percent" ? `${c.discount_value}% خصم` : `${c.discount_value} ر.س خصم`}{c.min_order_amount ? ` · حد أدنى ${c.min_order_amount} ر.س` : ""}</p>
                    </div>
                    <button onClick={() => copy(c.code)} className="p-2 hover:bg-muted rounded">{copied === c.code ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}</button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-bold mb-4">{language === "ar" ? "منتجات مخفضة" : "Discounted Products"}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={{ ...p, image: p.image_url, originalPrice: p.original_price }} />)}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DealsPage;
