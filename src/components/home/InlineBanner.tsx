import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

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

  // Premium gradient overlays — much richer than plain colors
  const overlayClass =
    overlay === "crimson"
      ? "bg-gradient-to-r from-[hsl(var(--crimson))]/95 via-[hsl(var(--crimson))]/55 to-transparent"
      : overlay === "dark"
      ? "bg-gradient-to-r from-black/85 via-black/45 to-black/10"
      : "bg-gradient-to-r from-white/95 via-white/60 to-white/10";

  const textColor = overlay === "soft" ? "text-foreground" : "text-white";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  // Apply RTL flip for proper alignment
  const flipOverlay = (align === "left" && !isRTL) || (align === "right" && isRTL);

  return (
    <Link
      to={link}
      className="block group relative overflow-hidden rounded-3xl shadow-card hover:shadow-russian transition-all duration-500"
    >
      <div className="relative h-56 md:h-72 lg:h-80">
        <img
          src={image}
          alt={titleEn}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms]"
        />
        <div
          className={`absolute inset-0 ${overlayClass} ${flipOverlay ? "scale-x-[-1]" : ""}`}
        />

        {/* Decorative gold corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-russian-gold/40 rounded-tl-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-russian-gold/40 rounded-br-3xl pointer-events-none" />

        <div
          className={`relative z-10 h-full flex items-center px-6 md:px-14 ${
            align === "right" ? "justify-start" : "justify-end"
          }`}
        >
          <div
            className={`max-w-md ${textColor} ${align === "left" ? "text-right" : "text-left"}`}
          >
            {subtitle && (
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className={`h-4 w-4 ${overlay === "soft" ? "text-crimson" : "text-russian-gold"}`} />
                <p className="text-xs md:text-sm uppercase tracking-[0.2em] opacity-95 font-bold">
                  {subtitle}
                </p>
              </div>
            )}
            <h3 className="text-3xl md:text-5xl font-black leading-[1.05] drop-shadow-lg mb-4">
              {title}
            </h3>
            <span className="inline-flex items-center gap-2 px-7 py-3 bg-russian-gold text-foreground rounded-full text-sm md:text-base font-extrabold group-hover:gap-4 group-hover:bg-white transition-all shadow-lg">
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
