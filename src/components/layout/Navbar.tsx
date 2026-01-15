import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Heart, Search, Menu, X, User, LogOut, Store, UserCircle } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSupplier } from "@/hooks/useSupplier";
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
  const { toggleCart, itemCount } = useCartStore();
  const { user, isAdmin, signOut } = useAuth();
  const { favoritesCount } = useFavorites();
  const { isSupplier, supplier } = useSupplier();
  const { t, language, isRTL } = useLanguage();
  const location = useLocation();
  
  const navLinks = [
    { href: "/", label: t('nav.home') },
    { href: "/products", label: t('nav.products') },
    { href: "/about", label: t('nav.about') },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

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
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
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
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    to="/orders"
                    className="text-sm font-medium text-foreground hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.orders')}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-sm font-medium text-foreground hover:text-primary"
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
                    className="text-sm font-medium text-destructive hover:text-destructive/80 text-start"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="text-sm font-medium text-foreground hover:text-primary"
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
