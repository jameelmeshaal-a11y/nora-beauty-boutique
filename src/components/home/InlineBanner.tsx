import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface InlineBannerProps {
  image: string;
  titleAr: string;
  titleRu?: string;
  titleEn: string;
  subtitleAr?: string;
  subtitleRu?: string;
  subtitleEn?: string;
  ctaAr?: string;
  ctaEn?: string;
  link?: string;
  align?: "left" | "right";
  overlay?: "crimson" | "dark" | "soft";
}

const InlineBanner = ({
  image,
  titleAr,
  titleRu,
  titleEn,
  subtitleAr,
  subtitleRu,
  subtitleEn,
  ctaAr = "تسوقي الآن",
  ctaEn = "Shop Now",
  link = "/products",
  align = "right",
  overlay = "crimson",
}: InlineBannerProps) => {
  const { language, isRTL } = useLanguage();

  const title = language === "ar" ? titleAr : language === "ru" ? titleRu || titleEn : titleEn;
  const subtitle =
    language === "ar" ? subtitleAr : language === "ru" ? subtitleRu || subtitleEn : subtitleEn;
  const cta = language === "ar" ? ctaAr : ctaEn;

  const overlayClass =
    overlay === "crimson"
      ? "bg-gradient-to-r from-[hsl(var(--crimson))]/85 via-[hsl(var(--crimson))]/30 to-transparent"
      : overlay === "dark"
      ? "bg-gradient-to-r from-black/70 via-black/30 to-transparent"
      : "bg-gradient-to-r from-white/90 via-white/40 to-transparent";

  const textColor = overlay === "soft" ? "text-foreground" : "text-white";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <Link
      to={link}
      className="block group relative overflow-hidden rounded-2xl shadow-card hover:shadow-russian transition-shadow"
    >
      <div className="relative h-44 md:h-56 lg:h-64">
        <img
          src={image}
          alt={titleEn}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className={`absolute inset-0 ${overlayClass} ${align === "left" ? "scale-x-[-1]" : ""}`} />
        <div
          className={`relative z-10 h-full flex items-center px-6 md:px-12 ${
            align === "right" ? "justify-start" : "justify-end"
          }`}
        >
          <div className={`max-w-md ${textColor} ${align === "left" ? "text-right" : "text-left"}`}>
            {subtitle && (
              <p className="text-xs md:text-sm uppercase tracking-widest opacity-90 mb-1 font-semibold">
                {subtitle}
              </p>
            )}
            <h3 className="text-2xl md:text-4xl font-extrabold leading-tight drop-shadow mb-3">
              {title}
            </h3>
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-russian-gold text-foreground rounded-full text-sm font-bold group-hover:gap-3 transition-all">
              {cta}
              <Arrow className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default InlineBanner;
