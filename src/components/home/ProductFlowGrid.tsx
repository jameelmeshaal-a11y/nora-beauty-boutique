import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/product/ProductCard";
import InlineBanner from "./InlineBanner";
import inlineBanner1 from "@/assets/banners/inline-banner-1.jpg";
import inlineBanner2 from "@/assets/banners/inline-banner-2.jpg";
import inlineBanner3 from "@/assets/banners/inline-banner-3.jpg";
import inlineBanner4 from "@/assets/banners/inline-banner-4.jpg";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  brand: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  shades_count: number | null;
  rating: number | null;
  reviews_count: number | null;
  is_bestseller: boolean | null;
  is_new: boolean | null;
  in_stock: boolean | null;
}

interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  name_ar: string | null;
  color_code: string;
  lip_image_url: string | null;
  in_stock: boolean | null;
}

interface BannerRow {
  id: string;
  title: string | null;
  title_ar: string | null;
  title_ru: string | null;
  subtitle: string | null;
  subtitle_ar: string | null;
  subtitle_ru: string | null;
  image_url: string;
  link: string | null;
}

const FALLBACK_BANNERS = [
  { image: inlineBanner1, link: "/deals" },
  { image: inlineBanner2, link: "/category/skin" },
  { image: inlineBanner3, link: "/category/body-care" },
  { image: inlineBanner4, link: "/category/perfumes" },
];

const ProductFlowGrid = () => {
  const { language, isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Map<string, ProductVariant[]>>(new Map());
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data }, { data: bannerData }] = await Promise.all([
        supabase
          .from("products")
          .select(
            "id, name, name_ar, brand, price, original_price, image_url, shades_count, rating, reviews_count, is_bestseller, is_new, in_stock"
          )
          .eq("is_active", true)
          .order("is_featured", { ascending: false })
          .order("is_bestseller", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(120),
        supabase
          .from("banners")
          .select("id, title, title_ar, title_ru, subtitle, subtitle_ar, subtitle_ru, image_url, link")
          .eq("type", "inline")
          .eq("is_active", true)
          .order("sort_order"),
      ]);
      if (data) {
        setProducts(data as Product[]);
        const ids = data.map((p) => p.id);
        if (ids.length > 0) {
          const { data: vData } = await supabase
            .from("product_variants")
            .select("id, product_id, name, name_ar, color_code, lip_image_url, in_stock")
            .in("product_id", ids);
          if (vData) {
            const map = new Map<string, ProductVariant[]>();
            vData.forEach((v) => {
              const arr = map.get(v.product_id) || [];
              arr.push(v);
              map.set(v.product_id, arr);
            });
            setVariants(map);
          }
        }
      }
      if (bannerData) setBanners(bannerData as BannerRow[]);
      setLoading(false);
    })();
  }, []);

  const t = (ar: string, en: string, ru?: string) =>
    language === "ar" ? ar : language === "ru" ? ru || en : en;

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  // Build rows of 4
  const rows: Array<Product[]> = [];
  for (let i = 0; i < products.length; i += 4) {
    rows.push(products.slice(i, i + 4));
  }

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  let bannerIdx = 0;
  const overlays: Array<"crimson" | "soft" | "dark"> = ["crimson", "soft", "dark", "crimson", "soft"];
  const aligns: Array<"left" | "right"> = ["right", "left", "right", "left", "right"];

  return (
    <section className="py-10 md:py-14 bg-gradient-to-b from-secondary/10 via-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold tracking-widest text-crimson uppercase mb-2">
              {t("الجمال الروسي الأصلي", "Authentic Russian Beauty", "Подлинная русская красота")}
            </p>
            <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">
              {t("متجر الجمال الروسي", "Russian Beauty Store", "Магазин красоты")}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              {t(
                `تصفحي ${products.length}+ منتج أصلي بأسعار حصرية`,
                `Browse ${products.length}+ authentic products at exclusive prices`,
                `Просмотрите ${products.length}+ оригинальных продуктов`
              )}
            </p>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-crimson hover:text-russian-gold transition-colors"
          >
            {t("عرض الكل", "View All", "Смотреть все")}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-6 md:space-y-8">
          {rows.map((row, rowIdx) => {
            const showBanner = rowIdx > 0 && (rowIdx + 1) % 2 === 0;
            const dbBanner =
              showBanner && banners.length > 0 ? banners[bannerIdx % banners.length] : null;
            const fallback =
              showBanner && banners.length === 0
                ? FALLBACK_BANNERS[bannerIdx % FALLBACK_BANNERS.length]
                : null;
            const overlay = overlays[bannerIdx % overlays.length];
            const align = aligns[bannerIdx % aligns.length];
            if (showBanner) bannerIdx++;

            return (
              <div key={rowIdx}>
                <div className="grid gap-3 md:gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {row.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={{
                        id: p.id,
                        name: p.name_ar || p.name,
                        nameEn: p.name,
                        brand: p.brand || "",
                        price: p.price,
                        originalPrice: p.original_price || undefined,
                        image: p.image_url || "/placeholder.svg",
                        rating: p.rating || 4.5,
                        reviews: p.reviews_count || 0,
                        shades: p.shades_count || 1,
                        badge: p.is_bestseller ? "bestseller" : p.is_new ? "new" : undefined,
                        inStock: p.in_stock ?? true,
                      }}
                      variants={variants.get(p.id) || []}
                    />
                  ))}
                </div>

                {dbBanner && (
                  <div className="mt-6 md:mt-8">
                    <InlineBanner
                      image={dbBanner.image_url}
                      titleAr={dbBanner.title_ar || dbBanner.title || ""}
                      titleRu={dbBanner.title_ru || undefined}
                      titleEn={dbBanner.title || ""}
                      subtitleAr={dbBanner.subtitle_ar || undefined}
                      subtitleRu={dbBanner.subtitle_ru || undefined}
                      subtitleEn={dbBanner.subtitle || undefined}
                      link={dbBanner.link || "/products"}
                      align={align}
                      overlay={overlay}
                    />
                  </div>
                )}
                {fallback && (
                  <div className="mt-6 md:mt-8">
                    <InlineBanner
                      image={fallback.image}
                      titleAr="عروض الجمال الروسي"
                      titleRu="Русская красота"
                      titleEn="Russian Beauty Deals"
                      link={fallback.link}
                      align={align}
                      overlay={overlay}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-crimson to-[hsl(var(--crimson))] text-white rounded-full font-bold text-lg hover:shadow-russian transition-all hover:scale-105"
          >
            {t("شاهدي كل المنتجات", "See All Products", "Все продукты")}
            <Arrow className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductFlowGrid;
