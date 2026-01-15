import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t, language } = useLanguage();
  
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-bold text-primary">نوره</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              متجرك الأول لمنتجات التجميل الروسية الفاخرة. نقدم لك أفضل مستحضرات التجميل بجودة عالية وأسعار منافسة.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-muted-foreground hover:text-primary">جميع المنتجات</Link></li>
              <li><Link to="/categories" className="text-muted-foreground hover:text-primary">التصنيفات</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary">من نحن</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary">اتصل بنا</Link></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">خدمة العملاء</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary">الأسئلة الشائعة</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary">سياسة الشحن</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary">سياسة الإرجاع</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary">الشروط والأحكام</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">تواصل معنا</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span dir="ltr">0559500173</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>hello@salasah.sa</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>الرياض، المملكة العربية السعودية</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>© 2024 نوره للتجميل. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
