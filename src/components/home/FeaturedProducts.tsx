import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  brand: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  images: string[] | null;
  shades_count: number | null;
  rating: number | null;
  reviews_count: number | null;
  is_bestseller: boolean | null;
  is_new: boolean | null;
  is_featured: boolean | null;
  in_stock: boolean | null;
  has_free_sample: boolean | null;
}

const FeaturedProducts = () => {
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, name_ar, brand, price, original_price, image_url, images, shades_count, rating, reviews_count, is_bestseller, is_new, is_featured, in_stock, has_free_sample')
          .eq('is_active', true)
          .or('is_bestseller.eq.true,is_new.eq.true,is_featured.eq.true')
          .order('is_bestseller', { ascending: false })
          .limit(8);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
              {language === 'ar' ? 'منتجات مميزة' : 'Featured Products'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'اكتشفي أكثر المنتجات مبيعاً وأحدث الإصدارات'
                : 'Discover our best sellers and newest releases'}
            </p>
          </div>
          <Link to="/products" className="hidden sm:block">
            <Button variant="outline" className="gap-2">
              {language === 'ar' ? 'عرض الكل' : 'View All'}
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name_ar || product.name,
                  nameEn: product.name,
                  brand: product.brand || '',
                  price: product.price,
                  originalPrice: product.original_price || undefined,
                  image: product.image_url || '/placeholder.svg',
                  rating: product.rating || 4.5,
                  reviews: product.reviews_count || 0,
                  shades: product.shades_count || 1,
                  badge: product.is_bestseller ? 'bestseller' : product.is_new ? 'new' : undefined,
                  inStock: product.in_stock ?? true,
                }}
              />
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center sm:hidden">
          <Link to="/products">
            <Button variant="outline" className="gap-2">
              {language === 'ar' ? 'عرض الكل' : 'View All'}
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
