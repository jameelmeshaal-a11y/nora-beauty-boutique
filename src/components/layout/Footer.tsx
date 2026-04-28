import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t, language } = useLanguage();
  
  return (
    <footer className="border-t border-russian-gold/30 bg-gradient-russian-soft">
      {/* About section — prominent */}
      <div className="bg-gradient-russian text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">
            {language === "ar" ? "من نحن" : language === "ru" ? "О нас" : "About Us"}
          </h2>
          <p className="max-w-3xl mx-auto text-white/90 leading-relaxed">
            {language === "ar"
              ? "متجر نوره — وجهتك الأولى للجمال الروسي الأصيل في السعودية. نوصلك أفخر منتجات التجميل والعناية بالبشرة والشعر مباشرة من 14+ براند روسي معتمد، بأسعار حصرية وجودة عالمية."
              : language === "ru"
              ? "Магазин Нора — ваше окно в подлинную русскую красоту в Саудовской Аравии. Доставляем лучшие косметические средства напрямую от 14+ сертифицированных российских брендов."
              : "Noura Store — your gateway to authentic Russian beauty in Saudi Arabia. We deliver premium cosmetics, skincare, and haircare directly from 14+ certified Russian brands."}
          </p>
          <Link to="/about" className="inline-block mt-5 px-6 py-2 bg-russian-gold text-foreground font-bold rounded-full hover:bg-russian-gold/90 transition">
            {language === "ar" ? "اعرفي أكثر" : language === "ru" ? "Узнать больше" : "Learn More"}
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-bold text-crimson">{language === "ar" ? "نوره" : "NOURA"}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {language === "ar" ? "Русская Красота · РК — الجمال الروسي الأصيل في السعودية" : "Русская Красота — Russian beauty in KSA"}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-crimson"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-crimson"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-crimson"><Facebook className="h-5 w-5" /></a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{language === "ar" ? "تسوقي" : "Shop"}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-muted-foreground hover:text-crimson">{language === "ar" ? "جميع المنتجات" : "All Products"}</Link></li>
              <li><Link to="/brands" className="text-muted-foreground hover:text-crimson">{language === "ar" ? "البراندات" : "Brands"}</Link></li>
              <li><Link to="/influencers" className="text-muted-foreground hover:text-crimson">{language === "ar" ? "المؤثرات" : "Influencers"}</Link></li>
              <li><Link to="/deals" className="text-muted-foreground hover:text-crimson">{language === "ar" ? "العروض" : "Deals"}</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{language === "ar" ? "خدمة العملاء" : "Customer Service"}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-crimson">{language === "ar" ? "من نحن" : "About Us"}</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-crimson">{language === "ar" ? "الأسئلة الشائعة" : "FAQ"}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-crimson">{language === "ar" ? "سياسة الشحن" : "Shipping"}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-crimson">{language === "ar" ? "سياسة الإرجاع" : "Returns"}</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{language === "ar" ? "تواصلي معنا" : "Contact"}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /><span dir="ltr">0559500173</span></li>
              <li className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /><span>hello@salasah.sa</span></li>
              <li className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /><span>{language === "ar" ? "الرياض، المملكة العربية السعودية" : "Riyadh, KSA"}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-russian-gold/30 pt-6 text-center text-sm text-muted-foreground">
          <p>© 2026 {language === "ar" ? "نوره · Русская Красота. جميع الحقوق محفوظة." : "Noura · Русская Красота. All rights reserved."}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
