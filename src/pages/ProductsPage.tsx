import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import ProductCard from "@/components/product/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";

// Local assets mapping for fallback images
import berryPlumLipstickRoses from "@/assets/products/berry-plum-lipstick-roses.jpg";
import berryPlumLipstick from "@/assets/products/berry-plum-lipstick.jpg";
import honeyLipOil from "@/assets/products/honey-lip-oil.jpg";
import kylieGlossBerry from "@/assets/products/kylie-gloss-berry.jpg";
import kylieGlossNude from "@/assets/products/kylie-gloss-nude.jpg";
import kylieLipOilRose from "@/assets/products/kylie-lip-oil-rose.jpg";
import kylieMatteRed from "@/assets/products/kylie-matte-red.jpg";
import lipGloss1 from "@/assets/products/lip-gloss-1.jpg";
import lipGloss2 from "@/assets/products/lip-gloss-2.jpg";
import lipGloss3 from "@/assets/products/lip-gloss-3.jpg";
import lipOil1 from "@/assets/products/lip-oil-1.jpg";
import lipstick1 from "@/assets/products/lipstick-1.jpg";
import lipstick2 from "@/assets/products/lipstick-2.jpg";
import lipstick3 from "@/assets/products/lipstick-3.jpg";
import pinkShimmerLipGloss from "@/assets/products/pink-shimmer-lip-gloss.jpg";
import roseGoldShimmerGloss from "@/assets/products/rose-gold-shimmer-gloss.jpg";
import highGlossLip from "@/assets/generated/high-gloss-lip.jpg";
import lipGlossDaddyGirl from "@/assets/generated/lip-gloss-daddy-girl.jpg";
import lipGlossDamnGina from "@/assets/generated/lip-gloss-damn-gina.jpg";
import lipGlossRoseBloom from "@/assets/generated/lip-gloss-rose-bloom.jpg";
import lipOilHoney from "@/assets/generated/lip-oil-honey.jpg";
import matteLipKitDolce from "@/assets/generated/matte-lip-kit-dolce.jpg";
import plumpingLipGloss from "@/assets/generated/plumping-lip-gloss.jpg";
import velvetMatteLipstick from "@/assets/generated/velvet-matte-lipstick.jpg";

// Map of local asset paths to imported modules
const localAssets: Record<string, string> = {
  "/src/assets/products/berry-plum-lipstick-roses.jpg": berryPlumLipstickRoses,
  "/src/assets/products/berry-plum-lipstick.jpg": berryPlumLipstick,
  "/src/assets/products/honey-lip-oil.jpg": honeyLipOil,
  "/src/assets/products/kylie-gloss-berry.jpg": kylieGlossBerry,
  "/src/assets/products/kylie-gloss-nude.jpg": kylieGlossNude,
  "/src/assets/products/kylie-lip-oil-rose.jpg": kylieLipOilRose,
  "/src/assets/products/kylie-matte-red.jpg": kylieMatteRed,
  "/src/assets/products/lip-gloss-1.jpg": lipGloss1,
  "/src/assets/products/lip-gloss-2.jpg": lipGloss2,
  "/src/assets/products/lip-gloss-3.jpg": lipGloss3,
  "/src/assets/products/lip-oil-1.jpg": lipOil1,
  "/src/assets/products/lipstick-1.jpg": lipstick1,
  "/src/assets/products/lipstick-2.jpg": lipstick2,
  "/src/assets/products/lipstick-3.jpg": lipstick3,
  "/src/assets/products/pink-shimmer-lip-gloss.jpg": pinkShimmerLipGloss,
  "/src/assets/products/rose-gold-shimmer-gloss.jpg": roseGoldShimmerGloss,
  "/src/assets/generated/high-gloss-lip.jpg": highGlossLip,
  "/src/assets/generated/lip-gloss-daddy-girl.jpg": lipGlossDaddyGirl,
  "/src/assets/generated/lip-gloss-damn-gina.jpg": lipGlossDamnGina,
  "/src/assets/generated/lip-gloss-rose-bloom.jpg": lipGlossRoseBloom,
  "/src/assets/generated/lip-oil-honey.jpg": lipOilHoney,
  "/src/assets/generated/matte-lip-kit-dolce.jpg": matteLipKitDolce,
  "/src/assets/generated/plumping-lip-gloss.jpg": plumpingLipGloss,
  "/src/assets/generated/velvet-matte-lipstick.jpg": velvetMatteLipstick,
};

// Helper to get the correct image URL
const getImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) return '/placeholder.svg';
  
  // Check if it's a local asset path
  if (localAssets[imageUrl]) {
    return localAssets[imageUrl];
  }
  
  // Return the URL as-is for external URLs
  return imageUrl;
};
interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  brand: string | null;
  category: string;
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

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const { language, t } = useLanguage();
  const { categories: dbCategories } = useCategories();
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Map<string, ProductVariant[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  // Fetch products and variants from database
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setVisibleCount(PRODUCTS_PER_PAGE);
      try {
        let query = supabase
          .from('products')
          .select('id, name, name_ar, brand, category, price, original_price, image_url, images, shades_count, rating, reviews_count, is_bestseller, is_new, is_featured, in_stock, has_free_sample')
          .eq('is_active', true);

        // Apply search filter
        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,name_ar.ilike.%${searchQuery}%`);
        }

        // Apply category filter
        if (selectedCategory !== "all") {
          query = query.eq('category', selectedCategory);
        }

        // Apply sorting
        switch (sortBy) {
          case "price-low":
            query = query.order('price', { ascending: true });
            break;
          case "price-high":
            query = query.order('price', { ascending: false });
            break;
          case "rating":
            query = query.order('rating', { ascending: false });
            break;
          default:
            query = query.order('is_bestseller', { ascending: false }).order('created_at', { ascending: false });
        }

        const { data, error } = await query.limit(200);
        
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
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, sortBy]);

  // Categories for filter buttons
  const filterCategories = [
    { id: "all", name: "جميع المنتجات", nameEn: "All Products" },
    { id: "lipstick", name: "أحمر الشفاه", nameEn: "Lipstick" },
    { id: "lip-gloss", name: "ملمع الشفاه", nameEn: "Lip Gloss" },
    { id: "lip-oil", name: "زيت الشفاه", nameEn: "Lip Oil" },
    { id: "skincare", name: "العناية بالبشرة", nameEn: "Skincare" },
    { id: "hair", name: "الشعر", nameEn: "Hair" },
  ];

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + PRODUCTS_PER_PAGE, products.length));
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <CartDrawer />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
              {language === 'ar' ? 'جميع المنتجات' : 'All Products'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'اكتشفي مجموعتنا الكاملة من منتجات التجميل الروسية'
                : 'Discover our complete collection of Russian beauty products'}
            </p>
          </div>
          
          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4 rounded-xl bg-secondary/30 p-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'ابحثي عن منتج...' : 'Search for a product...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {filterCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {language === 'ar' ? category.name : category.nameEn}
                  </Button>
                ))}
              </div>
              
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SlidersHorizontal className="ml-2 h-4 w-4" />
                  <SelectValue placeholder={language === 'ar' ? 'ترتيب حسب' : 'Sort by'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">{language === 'ar' ? 'الأكثر شهرة' : 'Featured'}</SelectItem>
                  <SelectItem value="price-low">{language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</SelectItem>
                  <SelectItem value="price-high">{language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</SelectItem>
                  <SelectItem value="rating">{language === 'ar' ? 'التقييم' : 'Rating'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Products count */}
          <p className="mb-6 text-sm text-muted-foreground">
            {language === 'ar' 
              ? `عرض ${visibleProducts.length} من ${products.length} منتج`
              : `Showing ${visibleProducts.length} of ${products.length} products`}
          </p>
          
          {/* Products grid */}
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : visibleProducts.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((product) => (
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
              
              {/* Show More Button */}
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShowMore}
                    className="gap-2 px-8"
                  >
                    <ChevronDown className="h-5 w-5" />
                    {language === 'ar' ? 'إظهار المزيد' : 'Show More'}
                    <span className="text-muted-foreground">
                      ({products.length - visibleCount} {language === 'ar' ? 'متبقي' : 'remaining'})
                    </span>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">
                {language === 'ar' ? 'لم يتم العثور على منتجات' : 'No products found'}
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductsPage;
