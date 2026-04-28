import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

const BrandsListPage = () => {
  const { language, isRTL } = useLanguage();
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("brands").select("*").eq("is_active", true).order("sort_order").then(({ data }) => setBrands(data || []));
  }, []);

  const getName = (b: any) => language === "ar" ? b.name_ar || b.name : language === "ru" ? b.name_ru || b.name : b.name;
  const heading = language === "ar" ? "جميع البراندات الروسية" : language === "ru" ? "Все российские бренды" : "All Russian Brands";

  return (
    <div className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />
      <CartDrawer />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-10 text-gradient-russian">{heading}</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((b) => (
            <Link key={b.id} to={`/brand/${b.slug}`} className="bg-gradient-to-br from-[hsl(var(--crimson-light))] to-[hsl(var(--russian-gold-light))] rounded-2xl p-6 shadow-card hover:shadow-russian transition-all hover:scale-105 text-center group">
              <div className="aspect-square bg-white/60 rounded-full flex items-center justify-center mb-3 mx-auto w-24 h-24">
                {b.logo_url ? <img src={b.logo_url} alt="" className="w-3/4 h-3/4 object-contain" /> : <span className="text-2xl font-black text-crimson">{b.name.slice(0, 2)}</span>}
              </div>
              <h3 className="font-bold">{getName(b)}</h3>
              <p className="text-xs text-muted-foreground mt-1">{b.country === "Russia" ? "🇷🇺" : "🇧🇾"} {b.country}</p>
              {!!b.discount_percent && <p className="text-sm text-crimson font-black mt-2">-{b.discount_percent}%</p>}
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrandsListPage;
