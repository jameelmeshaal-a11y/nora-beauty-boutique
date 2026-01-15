import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  in_stock: boolean | null;
}

const FavoritesPage = () => {
  const { favorites, isLoading: favoritesLoading, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { addItem } = useCartStore();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      if (favorites.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, name_ar, price, original_price, image_url, in_stock')
          .in('id', favorites);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching favorite products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!favoritesLoading) {
      fetchFavoriteProducts();
    }
  }, [favorites, favoritesLoading]);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: language === 'ar' ? (product.name_ar || product.name) : product.name,
      nameEn: product.name,
      category: '',
      price: product.price,
      image: product.image_url || '',
      shades: 0,
      description: '',
      rating: 0,
      reviews: 0,
      inStock: product.in_stock ?? true
    });
    toast({
      title: t('general.success'),
      description: language === 'ar' ? 'تمت إضافة المنتج للسلة' : 'Product added to cart'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Navbar />
        <CartDrawer />
        <main className="container mx-auto px-4 py-16 text-center">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">
            {language === 'ar' ? 'يرجى تسجيل الدخول' : 'Please Login'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'ar' 
              ? 'سجل دخولك لعرض منتجاتك المفضلة' 
              : 'Login to view your favorite products'}
          </p>
          <Link to="/auth">
            <Button>{t('nav.login')}</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <CartDrawer />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('nav.favorites')}</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {language === 'ar' ? 'لا توجد منتجات في المفضلة' : 'No favorites yet'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'ar' 
                ? 'ابدأي بإضافة المنتجات التي تعجبك' 
                : 'Start adding products you like'}
            </p>
            <Link to="/products">
              <Button>{t('nav.products')}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div key={product.id} className="group relative overflow-hidden rounded-xl bg-card shadow-soft">
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square overflow-hidden bg-secondary/20">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={language === 'ar' ? (product.name_ar || product.name) : product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </Link>
                
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-3 right-3 rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background"
                >
                  <Heart className="h-5 w-5 fill-primary text-primary" />
                </button>
                
                <div className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                      {language === 'ar' ? (product.name_ar || product.name) : product.name}
                    </h3>
                  </Link>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        {product.price} {t('product.sar')}
                      </span>
                      {product.original_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {product.original_price} {t('product.sar')}
                        </span>
                      )}
                    </div>
                    
                    <Button
                      size="icon"
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.in_stock}
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default FavoritesPage;
