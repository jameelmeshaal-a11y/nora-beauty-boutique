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
import { Search, SlidersHorizontal, ChevronDown, Filter, X, Star, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

// Default images by category for fallback
const categoryDefaultImages: Record<string, string> = {
  "lip-gloss": pinkShimmerLipGloss,
  "lipstick": berryPlumLipstick,
  "lip-oil": honeyLipOil,
  "body-care": lipstick1,
  "skincare": lipOilHoney,
  "hair": lipGloss1,
  "fragrance": kylieLipOilRose,
  "eyeshadow": highGlossLip,
  "foundation": velvetMatteLipstick,
  "blush": lipGlossDamnGina,
  "concealer": matteLipKitDolce,
  "highlighter": lipGlossRoseBloom,
  "bronzer": plumpingLipGloss,
  "eyeliner": kylieMatteRed,
  "mascara": lipstick3,
  "brow-products": kylieGlossBerry,
  "default": pinkShimmerLipGloss,
};

// Helper to get the correct image URL
const getImageUrl = (imageUrl: string | null, category?: string): string => {
  if (!imageUrl) {
    return categoryDefaultImages[category || "default"] || categoryDefaultImages["default"];
  }
  
  // Check if it's a local asset path
  if (localAssets[imageUrl]) {
    return localAssets[imageUrl];
  }
  
  // Check if it's a broken Pexels URL or any external URL that might fail
  if (imageUrl.includes('pexels') || imageUrl.includes('unsplash')) {
    return categoryDefaultImages[category || "default"] || categoryDefaultImages["default"];
  }
  
  // Return the URL as-is for other external URLs
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
  
  // Advanced filters state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showBestsellersOnly, setShowBestsellersOnly] = useState(false);
  const [showOnSaleOnly, setShowOnSaleOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (priceRange[0] > 0 || priceRange[1] < 500) count++;
    if (minRating > 0) count++;
    if (showInStockOnly) count++;
    if (showNewOnly) count++;
    if (showBestsellersOnly) count++;
    if (showOnSaleOnly) count++;
    setActiveFiltersCount(count);
  }, [priceRange, minRating, showInStockOnly, showNewOnly, showBestsellersOnly, showOnSaleOnly]);

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

        // Apply price range filter
        query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);

        // Apply rating filter
        if (minRating > 0) {
          query = query.gte('rating', minRating);
        }

        // Apply in stock filter
        if (showInStockOnly) {
          query = query.eq('in_stock', true);
        }

        // Apply new products filter
        if (showNewOnly) {
          query = query.eq('is_new', true);
        }

        // Apply bestsellers filter
        if (showBestsellersOnly) {
          query = query.eq('is_bestseller', true);
        }

        // Apply on sale filter
        if (showOnSaleOnly) {
          query = query.not('original_price', 'is', null);
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
          case "newest":
            query = query.order('created_at', { ascending: false });
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
  }, [searchQuery, selectedCategory, sortBy, priceRange, minRating, showInStockOnly, showNewOnly, showBestsellersOnly, showOnSaleOnly]);

  // Categories for filter buttons
  const filterCategories = [
    { id: "all", name: "جميع المنتجات", nameEn: "All Products" },
    { id: "lipstick", name: "أحمر الشفاه", nameEn: "Lipstick" },
    { id: "lip-gloss", name: "ملمع الشفاه", nameEn: "Lip Gloss" },
    { id: "lip-oil", name: "زيت الشفاه", nameEn: "Lip Oil" },
    { id: "body-care", name: "العناية بالجسم", nameEn: "Body Care" },
    { id: "skincare", name: "العناية بالبشرة", nameEn: "Skincare" },
    { id: "hair", name: "الشعر", nameEn: "Hair" },
    { id: "fragrance", name: "العطور", nameEn: "Fragrance" },
  ];

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + PRODUCTS_PER_PAGE, products.length));
  };

  const clearAllFilters = () => {
    setPriceRange([0, 500]);
    setMinRating(0);
    setShowInStockOnly(false);
    setShowNewOnly(false);
    setShowBestsellersOnly(false);
    setShowOnSaleOnly(false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">
          {language === 'ar' ? 'نطاق السعر' : 'Price Range'}
        </h3>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          max={500}
          min={0}
          step={10}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{priceRange[0]} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
          <span>{priceRange[1]} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
        </div>
      </div>

      <Separator />

      {/* Rating Filter */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">
          {language === 'ar' ? 'التقييم' : 'Rating'}
        </h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(minRating === rating ? 0 : rating)}
              className={`flex w-full items-center gap-2 rounded-lg p-2 transition-colors ${
                minRating === rating ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
              }`}
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="text-sm">{language === 'ar' ? 'وأعلى' : '& Up'}</span>
              {minRating === rating && <Check className="mr-auto h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Quick Filters */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">
          {language === 'ar' ? 'تصفية سريعة' : 'Quick Filters'}
        </h3>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={showInStockOnly}
              onCheckedChange={(checked) => setShowInStockOnly(checked as boolean)}
            />
            <span className="text-sm">{language === 'ar' ? 'متوفر فقط' : 'In Stock Only'}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={showNewOnly}
              onCheckedChange={(checked) => setShowNewOnly(checked as boolean)}
            />
            <span className="text-sm">{language === 'ar' ? 'المنتجات الجديدة' : 'New Arrivals'}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={showBestsellersOnly}
              onCheckedChange={(checked) => setShowBestsellersOnly(checked as boolean)}
            />
            <span className="text-sm">{language === 'ar' ? 'الأكثر مبيعاً' : 'Bestsellers'}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={showOnSaleOnly}
              onCheckedChange={(checked) => setShowOnSaleOnly(checked as boolean)}
            />
            <span className="text-sm">{language === 'ar' ? 'العروض والخصومات' : 'On Sale'}</span>
          </label>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <>
          <Separator />
          <Button variant="outline" onClick={clearAllFilters} className="w-full gap-2">
            <X className="h-4 w-4" />
            {language === 'ar' ? 'مسح جميع الفلاتر' : 'Clear All Filters'}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <CartDrawer />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-4 text-sm text-muted-foreground">
            <span>{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
            <span className="mx-2">{'<'}</span>
            <span className="text-foreground">{language === 'ar' ? 'المنتجات' : 'Products'}</span>
          </nav>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
              {language === 'ar' ? 'جميع المنتجات' : 'All Products'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? `عرض ${visibleProducts.length} من ${products.length} منتج`
                : `Showing ${visibleProducts.length} of ${products.length} products`}
            </p>
          </div>
          
          {/* Filters Bar */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left side - Sort and Filter Button */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SlidersHorizontal className="ml-2 h-4 w-4" />
                  <SelectValue placeholder={language === 'ar' ? 'الأحدث' : 'Newest'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">{language === 'ar' ? 'الأكثر شهرة' : 'Featured'}</SelectItem>
                  <SelectItem value="newest">{language === 'ar' ? 'الأحدث' : 'Newest'}</SelectItem>
                  <SelectItem value="price-low">{language === 'ar' ? 'السعر: الأقل' : 'Price: Low'}</SelectItem>
                  <SelectItem value="price-high">{language === 'ar' ? 'السعر: الأعلى' : 'Price: High'}</SelectItem>
                  <SelectItem value="rating">{language === 'ar' ? 'التقييم' : 'Rating'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Right side - Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {language === 'ar' ? 'فلترة' : 'Filter'}
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="mr-1 h-5 w-5 rounded-full p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] overflow-y-auto sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle>{language === 'ar' ? 'تصفية المنتجات' : 'Filter Products'}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters Tags */}
          {activeFiltersCount > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {language === 'ar' ? 'الفلاتر النشطة:' : 'Active filters:'}
              </span>
              {(priceRange[0] > 0 || priceRange[1] < 500) && (
                <Badge variant="secondary" className="gap-1">
                  {priceRange[0]}-{priceRange[1]} {language === 'ar' ? 'ر.س' : 'SAR'}
                  <button onClick={() => setPriceRange([0, 500])}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {minRating > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {minRating}+ {language === 'ar' ? 'نجوم' : 'Stars'}
                  <button onClick={() => setMinRating(0)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {showInStockOnly && (
                <Badge variant="secondary" className="gap-1">
                  {language === 'ar' ? 'متوفر' : 'In Stock'}
                  <button onClick={() => setShowInStockOnly(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {showNewOnly && (
                <Badge variant="secondary" className="gap-1">
                  {language === 'ar' ? 'جديد' : 'New'}
                  <button onClick={() => setShowNewOnly(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {showBestsellersOnly && (
                <Badge variant="secondary" className="gap-1">
                  {language === 'ar' ? 'الأكثر مبيعاً' : 'Bestseller'}
                  <button onClick={() => setShowBestsellersOnly(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {showOnSaleOnly && (
                <Badge variant="secondary" className="gap-1">
                  {language === 'ar' ? 'خصم' : 'On Sale'}
                  <button onClick={() => setShowOnSaleOnly(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Category Pills */}
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            {filterCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full"
              >
                {language === 'ar' ? category.name : category.nameEn}
              </Button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="mb-8 mx-auto max-w-md">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'ابحثي عن منتج...' : 'Search for a product...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 rounded-full"
              />
            </div>
          </div>
          
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
                      image: getImageUrl(product.image_url, product.category),
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
              {activeFiltersCount > 0 && (
                <Button variant="link" onClick={clearAllFilters} className="mt-2">
                  {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductsPage;