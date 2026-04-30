import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/product/ProductCard";
import InlineBanner from "./InlineBanner";
import inlineBanner1 from "@/assets/banners/inline-banner-1.jpg";
import inlineBanner2 from "@/assets/banners/inline-banner-2.jpg";
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

const ProductFlowGrid = () => {
  const { language, isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Map<string, ProductVariant[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("products")
        .select(
          "id, name, name_ar, brand, price, original_price, image_url, shades_count, rating, reviews_count, is_bestseller, is_new, in_stock"
        )
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(24);
      if (data) {
        setProducts(data as Product[]);
        const ids = data.map((p) => p.id);
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
      setLoading(false);
    })();
  }, []);

  // Banner config (Nice One style: full-width banner between rows of 4)
  const banners = [
    {
      image: inlineBanner1,
      titleAr: "خصومات تصل إلى 50%",
      titleRu: "Скидки до 50%",
      titleEn: "Up to 50% Off",
      subtitleAr: "أقوى عروض الأسبوع",
      subtitleRu: "Лучшие предложения недели",
      subtitleEn: "Top weekly deals",
      link: "/deals",
      align: "right" as const,
      overlay: "crimson" as const,
    },
    {
      image: inlineBanner2,
      titleAr: "روتين البشرة الزجاجية",
      titleRu: "Уход для сияющей кожи",
      titleEn: "Glass Skin Routine",
      subtitleAr: "منتجات روسية طبيعية",
      subtitleRu: "Натуральные русские продукты",
      subtitleEn: "Natural Russian skincare",
      link: "/products?category=skincare",
      align: "left" as const,
      overlay: "soft" as const,
    },
  ];

  const t = (ar: string, en: string, ru?: string) =>
    language === "ar" ? ar : language === "ru" ? ru || en : en;

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  // Build rows of 4 with banners between every 2 rows (i.e. every 8 products)
  const rows: Array<Product[]> = [];
  for (let i = 0; i < products.length; i += 4) {
    rows.push(products.slice(i, i + 4));
  }

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-12 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-foreground">
              {t("متجر الجمال الروسي", "Russian Beauty Store", "Магазин красоты")}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              {t(
                "تصفحي أحدث المنتجات الأصلية بأسعار مميزة",
                "Browse the latest authentic products at exclusive prices",
                "Просмотрите новейшие оригинальные продукты"
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

        <div className="space-y-6">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx}>
              <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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

              {/* Insert banner after every 2 rows */}
              {rowIdx > 0 && (rowIdx + 1) % 2 === 0 && banners[Math.floor(rowIdx / 2) % banners.length] && (
                <div className="mt-6">
                  <InlineBanner {...banners[Math.floor(rowIdx / 2) % banners.length]} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3 bg-crimson text-white rounded-full font-bold hover:bg-crimson/90 transition-colors shadow-russian"
          >
            {t("شاهدي كل المنتجات", "See All Products", "Все продукты")}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductFlowGrid;
