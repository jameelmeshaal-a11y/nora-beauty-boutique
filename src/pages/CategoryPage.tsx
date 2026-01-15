import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, Filter, SlidersHorizontal } from 'lucide-react';
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
import MegaMenu from '@/components/navigation/MegaMenu';
import { Skeleton } from '@/components/ui/skeleton';

const CategoryPage = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const { language, isRTL } = useLanguage();
  const { categories, getCategoryBySlug, getChildCategories, getCategoryPath } = useCategories();
  
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [currentCategory, setCurrentCategory] = useState<Category | undefined>();

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

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setProducts(data || []);
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

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <MegaMenu />

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
                to={`/products?category=${crumb.slug}`}
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
            {products.length} {language === 'ar' ? 'منتج' : 'products'}
          </p>
        </div>

        {/* Subcategories */}
        {subCategories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {subCategories.map((subCat) => (
              <Link key={subCat.id} to={`/products?category=${subCat.slug}`}>
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
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name_ar || product.name,
                  nameEn: product.name,
                  category: product.category,
                  price: product.price,
                  originalPrice: product.original_price,
                  image: product.image_url || 'https://via.placeholder.com/400',
                  shades: product.shades_count || 1,
                  badge: product.is_bestseller ? 'bestseller' : product.is_new ? 'new' : product.original_price ? 'sale' : undefined,
                  description: product.description_ar || product.description || '',
                  rating: product.rating || 4.5,
                  reviews: product.reviews_count || 0,
                  inStock: product.in_stock ?? true,
                  stockQuantity: product.stock_quantity,
                  lowStockThreshold: product.low_stock_threshold,
                }}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default CategoryPage;
