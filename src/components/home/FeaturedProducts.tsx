import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

// Import featured product images
import honeyLipOil from "@/assets/products/honey-lip-oil.jpg";
import roseGoldShimmerGloss from "@/assets/products/rose-gold-shimmer-gloss.jpg";
import berryPlumLipstick from "@/assets/products/berry-plum-lipstick.jpg";
import pinkShimmerLipGloss from "@/assets/products/pink-shimmer-lip-gloss.jpg";
import lipstick1 from "@/assets/products/lipstick-1.jpg";
import lipstick2 from "@/assets/products/lipstick-2.jpg";
import lipstick3 from "@/assets/products/lipstick-3.jpg";
import lipGloss1 from "@/assets/products/lip-gloss-1.jpg";
import lipGloss2 from "@/assets/products/lip-gloss-2.jpg";
import lipOil1 from "@/assets/products/lip-oil-1.jpg";

// Map for local assets
const localAssets: Record<string, string> = {
  '/src/assets/products/honey-lip-oil.jpg': honeyLipOil,
  '/src/assets/products/rose-gold-shimmer-gloss.jpg': roseGoldShimmerGloss,
  '/src/assets/products/berry-plum-lipstick.jpg': berryPlumLipstick,
  '/src/assets/products/pink-shimmer-lip-gloss.jpg': pinkShimmerLipGloss,
  '/src/assets/products/lipstick-1.jpg': lipstick1,
  '/src/assets/products/lipstick-2.jpg': lipstick2,
  '/src/assets/products/lipstick-3.jpg': lipstick3,
  '/src/assets/products/lip-gloss-1.jpg': lipGloss1,
  '/src/assets/products/lip-gloss-2.jpg': lipGloss2,
  '/src/assets/products/lip-oil-1.jpg': lipOil1,
};

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

interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  name_ar: string | null;
  color_code: string;
  lip_image_url: string | null;
  in_stock: boolean | null;
}

const getImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) return '/placeholder.svg';
  // Check if it's a local asset path
  if (localAssets[imageUrl]) {
    return localAssets[imageUrl];
  }
  // For Supabase storage URLs, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  // For relative paths that might be local assets
  const cleanPath = imageUrl.replace(/^\//, '');
  for (const [key, value] of Object.entries(localAssets)) {
    if (key.includes(cleanPath) || cleanPath.includes(key.replace('/src/assets/', ''))) {
      return value;
    }
  }
  return imageUrl;
};

const FeaturedProducts = () => {
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Map<string, ProductVariant[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, name_ar, brand, price, original_price, image_url, images, shades_count, rating, reviews_count, is_bestseller, is_new, is_featured, in_stock, has_free_sample')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;
        setProducts(data || []);

        // Fetch variants for all products
        if (data && data.length > 0) {
          const productIds = data.map(p => p.id);
          const { data: variantsData, error: variantsError } = await supabase
            .from('product_variants')
            .select('id, product_id, name, name_ar, color_code, lip_image_url, in_stock')
            .in('product_id', productIds);

          if (!variantsError && variantsData) {
            const variantsMap = new Map<string, ProductVariant[]>();
            variantsData.forEach(v => {
              const existing = variantsMap.get(v.product_id) || [];
              existing.push(v);
              variantsMap.set(v.product_id, existing);
            });
            setVariants(variantsMap);
          }
        }
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
            {products.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name_ar || product.name,
                  nameEn: product.name,
                  brand: product.brand || '',
                  price: product.price,
                  originalPrice: product.original_price || undefined,
                  image: getImageUrl(product.image_url),
                  rating: product.rating || 4.5,
                  reviews: product.reviews_count || 0,
                  shades: product.shades_count || 1,
                  badge: product.is_bestseller ? 'bestseller' : product.is_new ? 'new' : undefined,
                  inStock: product.in_stock ?? true,
                }}
                variants={variants.get(product.id) || []}
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
