import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Music2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Influencer {
  id: string;
  name: string;
  name_ar: string | null;
  name_ru: string | null;
  bio_ar: string | null;
  bio_ru: string | null;
  bio: string | null;
  photo_url: string | null;
  instagram: string | null;
  tiktok: string | null;
  affiliate_code: string | null;
  followers_count: number | null;
}

const InfluencersStrip = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("influencers")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .limit(3)
      .then(({ data }) => data && setInfluencers(data as Influencer[]));
  }, []);

  if (!influencers.length) return null;

  const getName = (i: Influencer) =>
    language === "ar" ? i.name_ar || i.name : language === "ru" ? i.name_ru || i.name : i.name;
  const getBio = (i: Influencer) =>
    language === "ar" ? i.bio_ar : language === "ru" ? i.bio_ru : i.bio;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: language === "ar" ? "تم النسخ ✓" : language === "ru" ? "Скопировано ✓" : "Copied ✓",
      description: language === "ar" ? `كود الخصم: ${code}` : `Code: ${code}`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const heading =
    language === "ar"
      ? "خبيرات الجمال الروسيات"
      : language === "ru"
      ? "Российские бьюти-эксперты"
      : "Russian Beauty Influencers";

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          <span className="text-gradient-russian">{heading}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {influencers.map((inf) => (
            <div
              key={inf.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-russian transition-all border border-russian-gold/20"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {inf.photo_url ? (
                  <img
                    src={inf.photo_url}
                    alt={getName(inf) || ""}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-russian-soft" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-lg drop-shadow">{getName(inf)}</h3>
                  {inf.followers_count ? (
                    <p className="text-xs opacity-90">
                      {(inf.followers_count / 1000).toFixed(0)}K{" "}
                      {language === "ar" ? "متابع" : language === "ru" ? "подписчиков" : "followers"}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="p-4">
                {getBio(inf) && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{getBio(inf)}</p>
                )}

                <div className="flex items-center gap-2 mb-3">
                  {inf.instagram && (
                    <a
                      href={`https://instagram.com/${inf.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-crimson hover:text-russian-gold"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {inf.tiktok && (
                    <a
                      href={`https://tiktok.com/${inf.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-crimson hover:text-russian-gold"
                    >
                      <Music2 className="h-5 w-5" />
                    </a>
                  )}
                </div>

                {inf.affiliate_code && (
                  <button
                    onClick={() => handleCopy(inf.affiliate_code!)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gradient-russian-soft border-2 border-dashed border-russian-gold hover:border-crimson transition-colors group/code"
                  >
                    <span className="text-xs text-muted-foreground">
                      {language === "ar" ? "كود الخصم" : language === "ru" ? "Промокод" : "Promo code"}
                    </span>
                    <span className="font-mono font-bold text-crimson tracking-wider">
                      {inf.affiliate_code}
                    </span>
                    {copiedCode === inf.affiliate_code ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground group-hover/code:text-crimson" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfluencersStrip;
