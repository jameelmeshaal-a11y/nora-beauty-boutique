import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { Instagram, Music2, Copy, Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const InfluencersPage = () => {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("influencers").select("*").eq("is_active", true).then(({ data }) => setItems(data || []));
  }, []);

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast({ title: language === "ar" ? "تم النسخ ✓" : "Copied ✓", description: code });
    setTimeout(() => setCopied(null), 2000);
  };

  const heading = language === "ar" ? "خبيرات الجمال" : language === "ru" ? "Бьюти-эксперты" : "Beauty Experts";

  return (
    <div className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />
      <CartDrawer />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Sparkles className="h-10 w-10 text-russian-gold mx-auto mb-3" />
          <h1 className="text-4xl font-bold text-gradient-russian mb-2">{heading}</h1>
          <p className="text-muted-foreground">{language === "ar" ? "تسوقي مع أكواد خصم حصرية من نجمات الجمال" : language === "ru" ? "Эксклюзивные промокоды" : "Exclusive promo codes"}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.id} className="bg-card rounded-2xl overflow-hidden shadow-card border border-russian-gold/20">
              {i.photo_url && <img src={i.photo_url} alt={i.name} className="w-full h-64 object-cover" />}
              <div className="p-5">
                <h3 className="text-xl font-bold">{language === "ar" ? i.name_ar || i.name : i.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{(i.followers_count / 1000).toFixed(0)}K {language === "ar" ? "متابع" : "followers"}</p>
                {(language === "ar" ? i.bio_ar : i.bio) && <p className="text-sm mt-3">{language === "ar" ? i.bio_ar : i.bio}</p>}
                <div className="flex gap-3 mt-3">
                  {i.instagram && <a href={`https://instagram.com/${i.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-crimson"><Instagram className="h-5 w-5" /></a>}
                  {i.tiktok && <a href={`https://tiktok.com/${i.tiktok}`} target="_blank" rel="noopener noreferrer" className="text-crimson"><Music2 className="h-5 w-5" /></a>}
                </div>
                {i.affiliate_code && (
                  <button onClick={() => copy(i.affiliate_code)} className="w-full mt-4 flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-russian-soft border-2 border-dashed border-russian-gold">
                    <span className="text-xs">{language === "ar" ? "كود الخصم" : "Promo"}</span>
                    <span className="font-mono font-bold text-crimson">{i.affiliate_code}</span>
                    {copied === i.affiliate_code ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InfluencersPage;
