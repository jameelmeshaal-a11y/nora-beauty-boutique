import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

// Core translations
export const translations: Translations = {
  // Navigation
  'nav.home': { ar: 'الرئيسية', en: 'Home' },
  'nav.products': { ar: 'المنتجات', en: 'Products' },
  'nav.categories': { ar: 'التصنيفات', en: 'Categories' },
  'nav.about': { ar: 'من نحن', en: 'About Us' },
  'nav.contact': { ar: 'اتصل بنا', en: 'Contact' },
  'nav.cart': { ar: 'السلة', en: 'Cart' },
  'nav.favorites': { ar: 'المفضلة', en: 'Favorites' },
  'nav.login': { ar: 'تسجيل الدخول', en: 'Login' },
  'nav.logout': { ar: 'تسجيل الخروج', en: 'Logout' },
  'nav.orders': { ar: 'طلباتي', en: 'My Orders' },
  
  // Product
  'product.addToCart': { ar: 'أضف للسلة', en: 'Add to Cart' },
  'product.outOfStock': { ar: 'نفذت الكمية', en: 'Out of Stock' },
  'product.inStock': { ar: 'متوفر', en: 'In Stock' },
  'product.shades': { ar: 'درجات', en: 'Shades' },
  'product.reviews': { ar: 'تقييم', en: 'Reviews' },
  'product.bestseller': { ar: 'الأكثر مبيعاً', en: 'Bestseller' },
  'product.new': { ar: 'جديد', en: 'New' },
  'product.sale': { ar: 'تخفيض', en: 'Sale' },
  'product.description': { ar: 'الوصف', en: 'Description' },
  'product.shipping': { ar: 'الشحن', en: 'Shipping' },
  'product.sar': { ar: 'ر.س', en: 'SAR' },
  
  // Categories
  'category.all': { ar: 'جميع المنتجات', en: 'All Products' },
  'category.lipGloss': { ar: 'ملمع الشفاه', en: 'Lip Gloss' },
  'category.lipstick': { ar: 'أحمر الشفاه', en: 'Lipstick' },
  'category.lipOil': { ar: 'زيت الشفاه', en: 'Lip Oil' },
  
  // Cart
  'cart.title': { ar: 'سلة التسوق', en: 'Shopping Cart' },
  'cart.empty': { ar: 'السلة فارغة', en: 'Cart is empty' },
  'cart.total': { ar: 'المجموع', en: 'Total' },
  'cart.checkout': { ar: 'إتمام الشراء', en: 'Checkout' },
  'cart.continueShopping': { ar: 'متابعة التسوق', en: 'Continue Shopping' },
  
  // Auth
  'auth.login': { ar: 'تسجيل الدخول', en: 'Login' },
  'auth.signup': { ar: 'إنشاء حساب', en: 'Sign Up' },
  'auth.email': { ar: 'البريد الإلكتروني', en: 'Email' },
  'auth.password': { ar: 'كلمة المرور', en: 'Password' },
  'auth.fullName': { ar: 'الاسم الكامل', en: 'Full Name' },
  'auth.forgotPassword': { ar: 'نسيت كلمة المرور؟', en: 'Forgot Password?' },
  
  // General
  'general.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'general.error': { ar: 'حدث خطأ', en: 'An error occurred' },
  'general.success': { ar: 'تم بنجاح', en: 'Success' },
  'general.save': { ar: 'حفظ', en: 'Save' },
  'general.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'general.delete': { ar: 'حذف', en: 'Delete' },
  'general.edit': { ar: 'تعديل', en: 'Edit' },
  'general.search': { ar: 'بحث', en: 'Search' },
  'general.filter': { ar: 'تصفية', en: 'Filter' },
  'general.sort': { ar: 'ترتيب', en: 'Sort' },
  'general.viewAll': { ar: 'عرض الكل', en: 'View All' },
  'general.readMore': { ar: 'قراءة المزيد', en: 'Read More' },
  
  // Hero
  'hero.title': { ar: 'جمال روسي أصيل', en: 'Authentic Russian Beauty' },
  'hero.subtitle': { ar: 'اكتشفي مجموعتنا الفاخرة من منتجات التجميل الروسية الأصلية', en: 'Discover our luxury collection of authentic Russian beauty products' },
  'hero.cta': { ar: 'تسوقي الآن', en: 'Shop Now' },
  
  // Footer
  'footer.rights': { ar: 'جميع الحقوق محفوظة', en: 'All Rights Reserved' },
  'footer.shipping': { ar: 'شحن مجاني للطلبات فوق 200 ر.س', en: 'Free shipping on orders over 200 SAR' },
  
  // Admin
  'admin.dashboard': { ar: 'لوحة التحكم', en: 'Dashboard' },
  'admin.products': { ar: 'المنتجات', en: 'Products' },
  'admin.orders': { ar: 'الطلبات', en: 'Orders' },
  'admin.customers': { ar: 'العملاء', en: 'Customers' },
  'admin.analytics': { ar: 'التحليلات', en: 'Analytics' },
  'admin.settings': { ar: 'الإعدادات', en: 'Settings' },
  'admin.addProduct': { ar: 'إضافة منتج', en: 'Add Product' },
  'admin.totalSales': { ar: 'إجمالي المبيعات', en: 'Total Sales' },
  'admin.returnToStore': { ar: 'العودة للمتجر', en: 'Return to Store' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ar';
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
