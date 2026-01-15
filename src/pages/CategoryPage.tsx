import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories, Category } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/product/ProductCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { Skeleton } from '@/components/ui/skeleton';

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

const CategoryPage = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const { language, isRTL } = useLanguage();
  const { categories, getCategoryBySlug, getChildCategories, getCategoryPath } = useCategories();
  
  const [products, setProducts] = useState<any[]>([]);
  const [variants, setVariants] = useState<Map<string, ProductVariant[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [currentCategory, setCurrentCategory] = useState<Category | undefined>();
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  useEffect(() => {
    if (categorySlug) {
      const cat = getCategoryBySlug(categorySlug);
      setCurrentCategory(cat);
    } else {
      setCurrentCategory(undefined);
    }
  }, [categorySlug, categories]);

  useEffect(() => {
    fetchProducts();
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [categorySlug, sortBy]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      // Filter by category if provided
      if (categorySlug) {
        // Get all child category slugs
        const cat = getCategoryBySlug(categorySlug);
        if (cat) {
          const childSlugs = getAllChildSlugs(cat);
          const allSlugs = [categorySlug, ...childSlugs];
          query = query.in('category', allSlugs);
        } else {
          query = query.eq('category', categorySlug);
        }
      }

      // Apply sorting
      switch (sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'bestseller':
          query = query.eq('is_bestseller', true).order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(200);

      if (error) throw error;
      setProducts(data || []);

      // Fetch variants for all products
      if (data && data.length > 0) {
        const productIds = data.map((p: any) => p.id);
        const { data: variantsData, error: variantsError } = await supabase
          .from('product_variants')
          .select('id, product_id, name, name_ar, color_code, lip_image_url, in_stock')
          .in('product_id', productIds);

        if (!variantsError && variantsData) {
          const variantsMap = new Map<string, ProductVariant[]>();
          variantsData.forEach((v: ProductVariant) => {
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

  const getAllChildSlugs = (category: Category): string[] => {
    const children = getChildCategories(category.id);
    let slugs: string[] = [];
    
    children.forEach(child => {
      slugs.push(child.slug);
      slugs = [...slugs, ...getAllChildSlugs(child)];
    });
    
    return slugs;
  };

  const breadcrumbs = currentCategory 
    ? getCategoryPath(currentCategory.id)
    : [];

  const subCategories = currentCategory 
    ? getChildCategories(currentCategory.id)
    : [];

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + PRODUCTS_PER_PAGE, products.length));
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            {language === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          <Link to="/products" className="hover:text-primary">
            {language === 'ar' ? 'المنتجات' : 'Products'}
          </Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.id} className="flex items-center gap-2">
              <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              <Link 
                to={`/category?category=${crumb.slug}`}
                className={crumb.id === currentCategory?.id ? 'text-foreground' : 'hover:text-primary'}
              >
                {language === 'ar' ? crumb.name_ar || crumb.name : crumb.name}
              </Link>
            </span>
          ))}
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {currentCategory 
              ? (language === 'ar' ? currentCategory.name_ar || currentCategory.name : currentCategory.name)
              : (language === 'ar' ? 'جميع المنتجات' : 'All Products')
            }
          </h1>
          <p className="mt-2 text-muted-foreground">
            {language === 'ar' 
              ? `عرض ${visibleProducts.length} من ${products.length} منتج`
              : `Showing ${visibleProducts.length} of ${products.length} products`}
          </p>
        </div>

        {/* Subcategories */}
        {subCategories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {subCategories.map((subCat) => (
              <Link key={subCat.id} to={`/category?category=${subCat.slug}`}>
                <Badge variant="outline" className="cursor-pointer px-4 py-2 hover:bg-secondary">
                  {language === 'ar' ? subCat.name_ar || subCat.name : subCat.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Filters & Sort */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            {language === 'ar' ? 'فلترة' : 'Filter'}
          </Button>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SlidersHorizontal className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">
                {language === 'ar' ? 'الأحدث' : 'Newest'}
              </SelectItem>
              <SelectItem value="price-asc">
                {language === 'ar' ? 'السعر: من الأقل' : 'Price: Low to High'}
              </SelectItem>
              <SelectItem value="price-desc">
                {language === 'ar' ? 'السعر: من الأعلى' : 'Price: High to Low'}
              </SelectItem>
              <SelectItem value="rating">
                {language === 'ar' ? 'التقييم' : 'Rating'}
              </SelectItem>
              <SelectItem value="bestseller">
                {language === 'ar' ? 'الأكثر مبيعاً' : 'Best Sellers'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              {language === 'ar' ? 'لا توجد منتجات في هذا التصنيف' : 'No products in this category'}
            </p>
            <Link to="/products">
              <Button className="mt-4">
                {language === 'ar' ? 'عرض جميع المنتجات' : 'View All Products'}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                    image: product.image_url || '/placeholder.svg',
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
        )}
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default CategoryPage;