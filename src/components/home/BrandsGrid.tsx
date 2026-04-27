import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  name_ar: string | null;
  name_ru: string | null;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  discount_percent: number | null;
  country: string | null;
}

const BrandsGrid = () => {
  const { language, t } = useLanguage();
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    supabase
      .from("brands")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order")
      .limit(6)
      .then(({ data }) => data && setBrands(data as Brand[]));
  }, []);

  const getName = (b: Brand) =>
    language === "ar" ? b.name_ar || b.name : language === "ru" ? b.name_ru || b.name : b.name;

  if (!brands.length) return null;

  const heading =
    language === "ar"
      ? "أفضل الماركات الروسية"
      : language === "ru"
      ? "Лучшие российские бренды"
      : "Top Russian Brands";

  return (
    <section className="py-10 bg-gradient-russian-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-russian-gold" />
            <span className="text-gradient-russian">{heading}</span>
          </h2>
          <Link to="/products" className="text-sm text-crimson hover:underline font-medium">
            {t("general.viewAll")}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/brand/${brand.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--crimson-light))] to-[hsl(var(--russian-gold-light))] p-6 md:p-8 shadow-card hover:shadow-russian transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between gap-4 min-h-[140px]">
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-widest text-crimson font-bold mb-2">
                    {brand.country === "Russia" ? "🇷🇺 Russia" : "🇧🇾 Belarus"}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
                    {getName(brand)}
                  </h3>
                  {brand.discount_percent ? (
                    <div className="inline-flex items-baseline gap-2">
                      <span className="text-sm text-foreground/70">
                        {language === "ar"
                          ? "خصومات تصل إلى"
                          : language === "ru"
                          ? "Скидки до"
                          : "Up to"}
                      </span>
                      <span className="text-3xl md:text-4xl font-black text-crimson">
                        {brand.discount_percent}%
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/60 backdrop-blur flex items-center justify-center shadow-soft">
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={getName(brand) || ""}
                      className="w-3/4 h-3/4 object-contain"
                    />
                  ) : (
                    <span className="text-2xl font-black text-crimson">
                      {brand.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className="absolute inset-0 slavic-pattern opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsGrid;
