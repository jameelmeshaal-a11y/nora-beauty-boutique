import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Star, Heart, ShoppingBag, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/store/cartStore";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price: number;
  original_price: number | null;
  category: string;
  image_url: string | null;
  images: string[] | null;
  rating: number | null;
  reviews_count: number | null;
  in_stock: boolean | null;
  is_featured: boolean | null;
  is_new: boolean | null;
  is_bestseller: boolean | null;
  brand: string | null;
}

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching product:', error);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartProduct = {
      id: product.id,
      name: product.name_ar || product.name,
      nameEn: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.original_price || undefined,
      image: product.image_url || 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
      shades: 1,
      description: product.description_ar || product.description || '',
      rating: product.rating || 4.5,
      reviews: product.reviews_count || 0,
      inStock: product.in_stock ?? true
    };
    
    for (let i = 0; i < quantity; i++) {
      addItem(cartProduct);
    }
    toast.success(`تمت إضافة ${quantity} منتج إلى السلة`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
          <h1 className="text-2xl font-bold text-foreground">المنتج غير موجود</h1>
          <Link to="/products">
            <Button>العودة للمنتجات</Button>
          </Link>
        </div>
        <Footer />
        <CartDrawer />
      </div>
    );
  }

  const discount = product.original_price 
    ? Math.round((1 - product.price / product.original_price) * 100) 
    : 0;

  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image_url 
      ? [product.image_url] 
      : ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronRight className="h-4 w-4 rotate-180" />
          <Link to="/products" className="hover:text-primary">المنتجات</Link>
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span className="text-foreground">{product.name_ar || product.name}</span>
        </nav>
        
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
              <img
                src={images[selectedImage]}
                alt={product.name_ar || product.name}
                className="h-full w-full object-cover"
              />
              {discount > 0 && (
                <Badge className="absolute left-4 top-4 bg-destructive text-destructive-foreground">
                  خصم {discount}%
                </Badge>
              )}
              {product.is_new && (
                <Badge className="absolute right-4 top-4 bg-primary text-primary-foreground">
                  جديد
                </Badge>
              )}
              {product.is_bestseller && (
                <Badge className="absolute right-4 top-4 bg-accent text-accent-foreground">
                  الأكثر مبيعاً
                </Badge>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            {product.brand && (
              <span className="text-sm font-medium text-primary">{product.brand}</span>
            )}
            
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
              {product.name_ar || product.name}
            </h1>
            
            <p className="text-lg text-muted-foreground">{product.name}</p>
            
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviews_count || 0} تقييم)
              </span>
            </div>
            
            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {product.price} ر.س
              </span>
              {product.original_price && (
                <span className="text-lg text-muted-foreground line-through">
                  {product.original_price} ر.س
                </span>
              )}
            </div>
            
            {/* Description */}
            <p className="text-muted-foreground">
              {product.description_ar || product.description || 'منتج تجميل روسي فاخر بجودة عالية'}
            </p>
            
            {/* Quantity */}
            <div className="space-y-2">
              <span className="font-medium">الكمية</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {product.in_stock ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    متوفر في المخزون
                  </Badge>
                ) : (
                  <Badge variant="destructive">غير متوفر</Badge>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                disabled={!product.in_stock}
              >
                <ShoppingBag className="h-5 w-5" />
                أضف للسلة
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
            
            {/* Features */}
            <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">شحن سريع</p>
                  <p className="text-xs text-muted-foreground">خلال 2-5 أيام</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">منتج أصلي</p>
                  <p className="text-xs text-muted-foreground">100% مضمون</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <RotateCcw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">إرجاع مجاني</p>
                  <p className="text-xs text-muted-foreground">خلال 14 يوم</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b bg-transparent">
              <TabsTrigger value="description" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                الوصف
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                التقييمات
              </TabsTrigger>
              <TabsTrigger value="shipping" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                الشحن والتوصيل
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p>{product.description_ar || product.description || 'منتج تجميل روسي فاخر بجودة عالية. تركيبة فريدة غنية بالفيتامينات والمكونات الطبيعية.'}</p>
                <h3 className="text-foreground">مميزات المنتج:</h3>
                <ul>
                  <li>تركيبة روسية أصلية</li>
                  <li>غني بالفيتامينات</li>
                  <li>ثابت طوال اليوم</li>
                  <li>مناسب لجميع أنواع البشرة</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <div className="text-center text-muted-foreground">
                <p>لا توجد تقييمات حتى الآن</p>
                <Button variant="outline" className="mt-4">أضف تقييمك</Button>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="mt-6">
              <div className="space-y-4 text-muted-foreground">
                <p><strong>التوصيل داخل المملكة:</strong> 2-5 أيام عمل</p>
                <p><strong>شحن مجاني:</strong> للطلبات فوق 200 ر.س</p>
                <p><strong>سياسة الإرجاع:</strong> يمكنك إرجاع المنتج خلال 14 يوم من تاريخ الاستلام</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ProductDetailsPage;
