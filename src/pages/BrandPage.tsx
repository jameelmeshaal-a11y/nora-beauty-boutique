import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import ProductCard from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  name_ar: string | null;
  name_ru: string | null;
  description_ar: string | null;
  description_ru: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  country: string | null;
  discount_percent: number | null;
}

const BrandPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, isRTL, t } = useLanguage();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: brandData } = await supabase
        .from("brands")
        .select("*")
        .eq("slug", slug || "")
        .maybeSingle();

      if (brandData) {
        setBrand(brandData as Brand);
        const { data: prods } = await supabase
          .from("products")
          .select("*")
          .eq("brand_id", (brandData as Brand).id)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        // also try by brand text match if no brand_id link yet
        if (!prods || prods.length === 0) {
          const { data: byName } = await supabase
            .from("products")
            .select("*")
            .ilike("brand", `%${(brandData as Brand).name}%`)
            .eq("is_active", true);
          setProducts((byName as any[]) || []);
        } else {
          setProducts(prods as any[]);
        }
      }
      setLoading(false);
    };
    if (slug) load();
  }, [slug]);

  const getName = (b: Brand) =>
    language === "ar" ? b.name_ar || b.name : language === "ru" ? b.name_ru || b.name : b.name;
  const getDesc = (b: Brand) =>
    language === "ar" ? b.description_ar : language === "ru" ? b.description_ru : b.description;

  if (loading) {
    return (
      <div className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
        <Navbar />
        <CartDrawer />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">
            {language === "ar"
              ? "الماركة غير موجودة"
              : language === "ru"
              ? "Бренд не найден"
              : "Brand not found"}
          </h1>
          <Link to="/" className="text-crimson hover:underline mt-4 inline-block">
            {language === "ar" ? "العودة للرئيسية" : "Home"}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />
      <CartDrawer />

      {/* Brand Hero */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        {brand.banner_url ? (
          <img src={brand.banner_url} alt={getName(brand) || ""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-russian" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-white/90 hover:text-white text-sm mb-3"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === "ar" ? "الرئيسية" : language === "ru" ? "Главная" : "Home"}
            </Link>
            <div className="flex items-end gap-4">
              {brand.logo_url && (
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-white shadow-russian flex items-center justify-center p-3">
                  <img src={brand.logo_url} alt="" className="w-full h-full object-contain" />
                </div>
              )}
              <div className="text-white">
                <div className="flex items-center gap-2 text-sm mb-1 opacity-90">
                  <MapPin className="h-4 w-4" />
                  {brand.country === "Russia" ? "🇷🇺 Россия" : `🇧🇾 ${brand.country}`}
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg">
                  {getName(brand)}
                </h1>
                {brand.discount_percent ? (
                  <span className="inline-block mt-2 px-3 py-1 bg-russian-gold text-foreground text-sm font-bold rounded-full">
                    {language === "ar" ? "خصم حتى" : language === "ru" ? "Скидка до" : "Up to"}{" "}
                    {brand.discount_percent}%
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {getDesc(brand) && (
        <div className="container mx-auto px-4 py-6">
          <p className="text-muted-foreground max-w-3xl">{getDesc(brand)}</p>
        </div>
      )}

      {/* Products */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">
          {language === "ar" ? "منتجات" : language === "ru" ? "Товары" : "Products"}{" "}
          <span className="text-crimson">{getName(brand)}</span>
          <span className="text-sm text-muted-foreground ms-2">({products.length})</span>
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-gradient-russian-soft rounded-xl">
            <p className="text-muted-foreground">
              {language === "ar"
                ? "لا توجد منتجات حالياً"
                : language === "ru"
                ? "Товары временно отсутствуют"
                : "No products available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name_ar || p.name,
                  nameEn: p.name,
                  price: Number(p.price),
                  originalPrice: p.original_price ? Number(p.original_price) : undefined,
                  image: p.image_url || "/placeholder.svg",
                  description: p.description_ar || p.description || "",
                  rating: Number(p.rating || 4.5),
                  reviews: p.reviews_count || 0,
                  inStock: p.in_stock ?? true,
                  shades: p.shades_count || 0,
                  hasSample: p.has_free_sample ?? false,
                  category: p.category,
                  stockQuantity: p.stock_quantity,
                  lowStockThreshold: p.low_stock_threshold,
                  badge: p.is_bestseller ? "bestseller" : p.is_new ? "new" : undefined,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default BrandPage;
