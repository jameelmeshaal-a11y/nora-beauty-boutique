import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import MegaMenu from "@/components/navigation/MegaMenu";
import ProductCard from "@/components/product/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";

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

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const { language, t } = useLanguage();
  const { categories: dbCategories } = useCategories();
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
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

        const { data, error } = await query.limit(50);
        
        if (error) throw error;
        setProducts(data || []);
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
    { id: "hair-oils", name: "زيوت الشعر", nameEn: "Hair Oils" },
    { id: "shampoos", name: "شامبوهات", nameEn: "Shampoos" },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <MegaMenu />
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
            {products.length} {language === 'ar' ? 'منتج' : 'products'}
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
          ) : products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
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
