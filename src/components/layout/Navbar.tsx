import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Heart, Search, Menu, X, User, LogOut, Store, UserCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSupplier } from "@/hooks/useSupplier";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { toggleCart, itemCount } = useCartStore();
  const { user, isAdmin, signOut } = useAuth();
  const { favoritesCount } = useFavorites();
  const { isSupplier, supplier } = useSupplier();
  const { t, language, isRTL } = useLanguage();
  const location = useLocation();
  const { categoriesTree } = useCategories();

  const handleSignOut = async () => {
    await signOut();
  };

  // Static nav links
  const staticLinks = [
    { href: "/", label: t('nav.home') },
    { href: "/products", label: t('nav.products') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top announcement bar */}
      <div className="bg-primary py-2 text-center text-sm text-primary-foreground">
        <p>
          {language === 'ar' 
            ? '🎁 شحن مجاني للطلبات فوق 200 ر.س | منتجات تجميل روسية أصلية'
            : '🎁 Free shipping on orders over 200 SAR | Authentic Russian cosmetics'}
        </p>
      </div>
      
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl font-bold text-primary">
              {language === 'ar' ? 'نوره' : 'NOURA'}
            </span>
            <span className="hidden text-sm text-muted-foreground sm:block">
              {language === 'ar' ? 'NOURA BEAUTY' : 'BEAUTY'}
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {/* Static links */}
            {staticLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md",
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Category dropdowns */}
            {categoriesTree.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => setActiveCategory(category.id)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <Link
                  to={`/category?category=${category.slug}`}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md",
                    activeCategory === category.id ? "text-primary" : "text-foreground"
                  )}
                >
                  {language === 'ar' ? category.name_ar || category.name : category.name}
                  {category.children && category.children.length > 0 && (
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      activeCategory === category.id && "rotate-180"
                    )} />
                  )}
                </Link>

                {/* Mega Dropdown */}
                {category.children && category.children.length > 0 && activeCategory === category.id && (
                  <div
                    className={cn(
                      "absolute top-full bg-background border border-border rounded-lg shadow-lg z-50",
                      "min-w-[400px] max-w-[700px]",
                      isRTL ? "right-0" : "left-0"
                    )}
                  >
                    <div className="grid grid-cols-2 gap-4 p-5">
                      {category.children.map((subCategory) => (
                        <div key={subCategory.id} className="space-y-2">
                          <Link
                            to={`/category?category=${subCategory.slug}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors block"
                          >
                            {language === 'ar' ? subCategory.name_ar || subCategory.name : subCategory.name}
                          </Link>
                          
                          {subCategory.children && subCategory.children.length > 0 && (
                            <ul className="space-y-1">
                              {subCategory.children.slice(0, 5).map((child) => (
                                <li key={child.id}>
                                  <Link
                                    to={`/category?category=${child.slug}`}
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    {language === 'ar' ? child.name_ar || child.name : child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* View All link */}
                    <div className="border-t border-border p-3 bg-secondary/30 rounded-b-lg">
                      <Link
                        to={`/category?category=${category.slug}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {language === 'ar' 
                          ? `عرض جميع ${category.name_ar || category.name}` 
                          : `View All ${category.name}`}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Russian-marketplace pages */}
            <Link
              to="/brands"
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md",
                location.pathname === "/brands" ? "text-primary" : "text-foreground"
              )}
            >
              {language === "ar" ? "البراندات" : language === "ru" ? "Бренды" : "Brands"}
            </Link>
            <Link
              to="/influencers"
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md",
                location.pathname === "/influencers" ? "text-primary" : "text-foreground"
              )}
            >
              {language === "ar" ? "المؤثرات" : language === "ru" ? "Эксперты" : "Influencers"}
            </Link>
            <Link
              to="/deals"
              className={cn(
                "px-3 py-2 text-sm font-bold transition-colors rounded-md text-crimson",
                location.pathname === "/deals" && "underline"
              )}
            >
              {language === "ar" ? "🔥 العروض" : language === "ru" ? "🔥 Акции" : "🔥 Deals"}
            </Link>
          </div>
          
          {/* Right side icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-5 w-5" />
            </Button>
            
            <Link to="/favorites">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                    {favoritesCount}
                  </span>
                )}
              </Button>
            </Link>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"}>
                {user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="w-full flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        {language === 'ar' ? 'حسابي' : 'My Account'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="w-full">
                        {t('nav.orders')}
                      </Link>
                    </DropdownMenuItem>
                    {isSupplier && supplier?.is_active && (
                      <DropdownMenuItem asChild>
                        <Link to="/supplier" className="w-full flex items-center gap-2">
                          <Store className="h-4 w-4" />
                          {language === 'ar' ? 'لوحة المورد' : 'Supplier Panel'}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="w-full">
                          {t('admin.dashboard')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {!isSupplier && (
                      <DropdownMenuItem asChild>
                        <Link to="/supplier/register" className="w-full flex items-center gap-2 text-primary">
                          <Store className="h-4 w-4" />
                          {language === 'ar' ? 'انضم كمورد' : 'Become a Supplier'}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/auth" className="w-full">
                      {t('nav.login')}
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={toggleCart}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount() > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {itemCount()}
                </span>
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t border-border py-4 lg:hidden">
            <div className="flex flex-col gap-2">
              {staticLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary py-2",
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile categories */}
              {categoriesTree.map((category) => (
                <div key={category.id} className="py-2">
                  <Link
                    to={`/category?category=${category.slug}`}
                    className="text-sm font-medium text-foreground hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {language === 'ar' ? category.name_ar || category.name : category.name}
                  </Link>
                </div>
              ))}

              <Link to="/brands" className="text-sm font-medium text-foreground hover:text-primary py-2" onClick={() => setIsMenuOpen(false)}>{language === "ar" ? "البراندات" : "Brands"}</Link>
              <Link to="/influencers" className="text-sm font-medium text-foreground hover:text-primary py-2" onClick={() => setIsMenuOpen(false)}>{language === "ar" ? "المؤثرات" : "Influencers"}</Link>
              <Link to="/deals" className="text-sm font-bold text-crimson py-2" onClick={() => setIsMenuOpen(false)}>{language === "ar" ? "🔥 العروض" : "🔥 Deals"}</Link>

              {user ? (
                <>
                  <Link
                    to="/orders"
                    className="text-sm font-medium text-foreground hover:text-primary py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.orders')}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-sm font-medium text-foreground hover:text-primary py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('admin.dashboard')}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-sm font-medium text-destructive hover:text-destructive/80 text-start py-2"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="text-sm font-medium text-foreground hover:text-primary py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
