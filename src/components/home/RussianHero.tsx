import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plane, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  title_ar: string | null;
  title_ru: string | null;
  title: string | null;
  subtitle_ar: string | null;
  subtitle_ru: string | null;
  subtitle: string | null;
  image_url: string;
  link: string | null;
}

const RussianHero = () => {
  const { language } = useLanguage();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase
      .from("banners")
      .select("*")
      .eq("type", "hero")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length) setBanners(data as Banner[]);
      });
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const getTitle = (b: Banner) =>
    language === "ar" ? b.title_ar : language === "ru" ? b.title_ru : b.title;
  const getSub = (b: Banner) =>
    language === "ar" ? b.subtitle_ar : language === "ru" ? b.subtitle_ru : b.subtitle;

  const ctaText =
    language === "ar" ? "تسوقي الآن" : language === "ru" ? "Купить сейчас" : "Shop Now";

  if (!banners.length) {
    return (
      <section className="relative h-[480px] bg-gradient-russian flex items-center justify-center text-white">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {language === "ar"
              ? "الجمال الروسي الأصيل"
              : language === "ru"
              ? "Подлинная русская красота"
              : "Authentic Russian Beauty"}
          </h1>
          <p className="text-lg opacity-90 mb-6">
            {language === "ar"
              ? "يصلك في السعودية مباشرة من روسيا"
              : language === "ru"
              ? "Прямо к вам из России"
              : "Delivered directly from Russia"}
          </p>
          <Button asChild size="lg" className="bg-russian-gold hover:bg-russian-gold/90 text-foreground">
            <Link to="/products">{ctaText}</Link>
          </Button>
        </div>
      </section>
    );
  }

  const b = banners[current];

  return (
    <section className="relative">
      <div className="relative h-[420px] md:h-[520px] overflow-hidden">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === current ? "opacity-100" : "opacity-0"
            )}
          >
            <img src={banner.image_url} alt={getTitle(banner) || ""} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--crimson))]/85 via-[hsl(var(--crimson))]/40 to-transparent" />
          </div>
        ))}

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-xl text-white animate-fade-in">
              <span className="inline-block px-3 py-1 bg-russian-gold text-foreground text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                Русская Красота · РК
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight drop-shadow-lg">
                {getTitle(b)}
              </h1>
              <p className="text-lg md:text-xl opacity-95 mb-6 drop-shadow">{getSub(b)}</p>
              <Button
                asChild
                size="lg"
                className="bg-russian-gold hover:bg-russian-gold/90 text-foreground font-bold shadow-russian"
              >
                <Link to={b.link || "/products"}>{ctaText}</Link>
              </Button>
            </div>
          </div>
        </div>

        {banners.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur p-2 rounded-full text-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur p-2 rounded-full text-white"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === current ? "w-8 bg-russian-gold" : "w-2 bg-white/60"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Trust badges */}
      <div className="bg-gradient-russian-soft border-y border-russian-gold/20">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-around gap-3 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <Plane className="h-4 w-4 text-crimson" />
            <span className="font-medium">
              {language === "ar"
                ? "شحن مباشر من روسيا"
                : language === "ru"
                ? "Прямая доставка из России"
                : "Direct Shipping from Russia"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-4 w-4 text-crimson" />
            <span className="font-medium">
              {language === "ar"
                ? "موردون روس معتمدون"
                : language === "ru"
                ? "Сертифицированные поставщики"
                : "Verified Russian Suppliers"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-4 w-4 text-russian-gold" />
            <span className="font-medium">
              {language === "ar"
                ? "أصلي 100% — مكونات طبيعية"
                : language === "ru"
                ? "100% оригинал — натуральные компоненты"
                : "100% Authentic — Natural Ingredients"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RussianHero;
