import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en' | 'ru';

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
    ru: string;
  };
}

// Core translations
export const translations: Translations = {
  // Navigation
  'nav.home': { ar: 'الرئيسية', en: 'Home', ru: 'Главная' },
  'nav.products': { ar: 'المنتجات', en: 'Products', ru: 'Товары' },
  'nav.categories': { ar: 'التصنيفات', en: 'Categories', ru: 'Категории' },
  'nav.about': { ar: 'من نحن', en: 'About Us', ru: 'О нас' },
  'nav.contact': { ar: 'اتصل بنا', en: 'Contact', ru: 'Контакты' },
  'nav.cart': { ar: 'السلة', en: 'Cart', ru: 'Корзина' },
  'nav.favorites': { ar: 'المفضلة', en: 'Favorites', ru: 'Избранное' },
  'nav.login': { ar: 'تسجيل الدخول', en: 'Login', ru: 'Войти' },
  'nav.logout': { ar: 'تسجيل الخروج', en: 'Logout', ru: 'Выход' },
  'nav.orders': { ar: 'طلباتي', en: 'My Orders', ru: 'Мои заказы' },
  
  // Product
  'product.addToCart': { ar: 'أضف للسلة', en: 'Add to Cart', ru: 'В корзину' },
  'product.outOfStock': { ar: 'نفذت الكمية', en: 'Out of Stock', ru: 'Нет в наличии' },
  'product.inStock': { ar: 'متوفر', en: 'In Stock', ru: 'В наличии' },
  'product.shades': { ar: 'درجات', en: 'Shades', ru: 'Оттенки' },
  'product.reviews': { ar: 'تقييم', en: 'Reviews', ru: 'Отзывы' },
  'product.bestseller': { ar: 'الأكثر مبيعاً', en: 'Bestseller', ru: 'Бестселлер' },
  'product.new': { ar: 'جديد', en: 'New', ru: 'Новинка' },
  'product.sale': { ar: 'تخفيض', en: 'Sale', ru: 'Скидка' },
  'product.description': { ar: 'الوصف', en: 'Description', ru: 'Описание' },
  'product.shipping': { ar: 'الشحن', en: 'Shipping', ru: 'Доставка' },
  'product.sar': { ar: 'ر.س', en: 'SAR', ru: 'SAR' },
  
  // Categories
  'category.all': { ar: 'جميع المنتجات', en: 'All Products', ru: 'Все товары' },
  'category.lipGloss': { ar: 'ملمع الشفاه', en: 'Lip Gloss', ru: 'Блеск для губ' },
  'category.lipstick': { ar: 'أحمر الشفاه', en: 'Lipstick', ru: 'Помада' },
  'category.lipOil': { ar: 'زيت الشفاه', en: 'Lip Oil', ru: 'Масло для губ' },
  
  // Cart
  'cart.title': { ar: 'سلة التسوق', en: 'Shopping Cart', ru: 'Корзина' },
  'cart.empty': { ar: 'السلة فارغة', en: 'Cart is empty', ru: 'Корзина пуста' },
  'cart.total': { ar: 'المجموع', en: 'Total', ru: 'Итого' },
  'cart.checkout': { ar: 'إتمام الشراء', en: 'Checkout', ru: 'Оформить заказ' },
  'cart.continueShopping': { ar: 'متابعة التسوق', en: 'Continue Shopping', ru: 'Продолжить покупки' },
  
  // Auth
  'auth.login': { ar: 'تسجيل الدخول', en: 'Login', ru: 'Войти' },
  'auth.signup': { ar: 'إنشاء حساب', en: 'Sign Up', ru: 'Регистрация' },
  'auth.email': { ar: 'البريد الإلكتروني', en: 'Email', ru: 'Эл. почта' },
  'auth.password': { ar: 'كلمة المرور', en: 'Password', ru: 'Пароль' },
  'auth.fullName': { ar: 'الاسم الكامل', en: 'Full Name', ru: 'Полное имя' },
  'auth.forgotPassword': { ar: 'نسيت كلمة المرور؟', en: 'Forgot Password?', ru: 'Забыли пароль?' },
  
  // General
  'general.loading': { ar: 'جاري التحميل...', en: 'Loading...', ru: 'Загрузка...' },
  'general.error': { ar: 'حدث خطأ', en: 'An error occurred', ru: 'Произошла ошибка' },
  'general.success': { ar: 'تم بنجاح', en: 'Success', ru: 'Успешно' },
  'general.save': { ar: 'حفظ', en: 'Save', ru: 'Сохранить' },
  'general.cancel': { ar: 'إلغاء', en: 'Cancel', ru: 'Отмена' },
  'general.delete': { ar: 'حذف', en: 'Delete', ru: 'Удалить' },
  'general.edit': { ar: 'تعديل', en: 'Edit', ru: 'Редактировать' },
  'general.search': { ar: 'بحث', en: 'Search', ru: 'Поиск' },
  'general.filter': { ar: 'تصفية', en: 'Filter', ru: 'Фильтр' },
  'general.sort': { ar: 'ترتيب', en: 'Sort', ru: 'Сортировка' },
  'general.viewAll': { ar: 'عرض الكل', en: 'View All', ru: 'Смотреть все' },
  'general.readMore': { ar: 'قراءة المزيد', en: 'Read More', ru: 'Подробнее' },
  
  // Hero
  'hero.title': { ar: 'جمال روسي أصيل', en: 'Authentic Russian Beauty', ru: 'Подлинная русская красота' },
  'hero.subtitle': { ar: 'اكتشفي مجموعتنا الفاخرة من منتجات التجميل الروسية الأصلية', en: 'Discover our luxury collection of authentic Russian beauty products', ru: 'Откройте нашу роскошную коллекцию подлинных русских косметических продуктов' },
  'hero.cta': { ar: 'تسوقي الآن', en: 'Shop Now', ru: 'Купить сейчас' },
  
  // Footer
  'footer.rights': { ar: 'جميع الحقوق محفوظة', en: 'All Rights Reserved', ru: 'Все права защищены' },
  'footer.shipping': { ar: 'شحن مجاني للطلبات فوق 200 ر.س', en: 'Free shipping on orders over 200 SAR', ru: 'Бесплатная доставка при заказе от 200 SAR' },
  
  // Admin
  'admin.dashboard': { ar: 'لوحة التحكم', en: 'Dashboard', ru: 'Панель управления' },
  'admin.products': { ar: 'المنتجات', en: 'Products', ru: 'Товары' },
  'admin.orders': { ar: 'الطلبات', en: 'Orders', ru: 'Заказы' },
  'admin.customers': { ar: 'العملاء', en: 'Customers', ru: 'Клиенты' },
  'admin.analytics': { ar: 'التحليلات', en: 'Analytics', ru: 'Аналитика' },
  'admin.settings': { ar: 'الإعدادات', en: 'Settings', ru: 'Настройки' },
  'admin.addProduct': { ar: 'إضافة منتج', en: 'Add Product', ru: 'Добавить товар' },
  'admin.totalSales': { ar: 'إجمالي المبيعات', en: 'Total Sales', ru: 'Общие продажи' },
  'admin.returnToStore': { ar: 'العودة للمتجر', en: 'Return to Store', ru: 'Вернуться в магазин' },
  'admin.featured': { ar: 'المنتجات المميزة', en: 'Featured Products', ru: 'Избранные товары' },
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
    document.documentElement.lang = language === 'ru' ? 'ru' : language;
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
