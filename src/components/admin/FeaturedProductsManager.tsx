import { useState } from "react";
import { Star, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  price: number;
  image_url: string | null;
  is_featured: boolean | null;
  is_bestseller: boolean | null;
  is_new: boolean | null;
  category: string;
}

interface FeaturedProductsManagerProps {
  products: Product[];
  onUpdate: () => void;
}

const FeaturedProductsManager = ({ products, onUpdate }: FeaturedProductsManagerProps) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { language, t } = useLanguage();

  const handleToggle = async (
    productId: string,
    field: 'is_featured' | 'is_bestseller' | 'is_new',
    currentValue: boolean
  ) => {
    setUpdatingId(productId);
    try {
      const updateData: Record<string, boolean> = {};
      updateData[field] = !currentValue;
      const { error } = await (supabase
        .from('products') as any)
        .update(updateData)
        .eq('id', productId);

      if (error) throw error;
      toast({ 
        title: language === 'ar' ? 'تم التحديث' : language === 'ru' ? 'Обновлено' : 'Updated',
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({ 
        title: language === 'ar' ? 'حدث خطأ' : language === 'ru' ? 'Ошибка' : 'Error',
        variant: "destructive" 
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const featuredProducts = products.filter(p => p.is_featured);
  const bestsellers = products.filter(p => p.is_bestseller);
  const newProducts = products.filter(p => p.is_new);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'المميزة' : language === 'ru' ? 'Избранные' : 'Featured'}
              </p>
              <p className="text-2xl font-bold">{featuredProducts.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-orange-500/10 p-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'الأكثر مبيعاً' : language === 'ru' ? 'Бестселлеры' : 'Bestsellers'}
              </p>
              <p className="text-2xl font-bold">{bestsellers.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-green-500/10 p-2">
              <Sparkles className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'جديد' : language === 'ru' ? 'Новинки' : 'New'}
              </p>
              <p className="text-2xl font-bold">{newProducts.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative aspect-square bg-muted">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  {language === 'ar' ? 'لا توجد صورة' : language === 'ru' ? 'Нет изображения' : 'No image'}
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.is_featured && (
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    {language === 'ar' ? 'مميز' : language === 'ru' ? 'Избранное' : 'Featured'}
                  </Badge>
                )}
                {product.is_bestseller && (
                  <Badge className="bg-orange-500 text-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {language === 'ar' ? 'الأكثر مبيعاً' : language === 'ru' ? 'Бестселлер' : 'Bestseller'}
                  </Badge>
                )}
                {product.is_new && (
                  <Badge className="bg-green-500 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {language === 'ar' ? 'جديد' : language === 'ru' ? 'Новинка' : 'New'}
                  </Badge>
                )}
              </div>
            </div>
            
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold line-clamp-1">
                  {language === 'ar' ? (product.name_ar || product.name) : product.name}
                </h3>
                <p className="text-sm text-muted-foreground">{product.price} {t('product.sar')}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`featured-${product.id}`} className="text-sm flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    {language === 'ar' ? 'مميز' : language === 'ru' ? 'Избранное' : 'Featured'}
                  </Label>
                  {updatingId === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Switch
                      id={`featured-${product.id}`}
                      checked={product.is_featured ?? false}
                      onCheckedChange={() => handleToggle(product.id, 'is_featured', product.is_featured ?? false)}
                    />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor={`bestseller-${product.id}`} className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    {language === 'ar' ? 'الأكثر مبيعاً' : language === 'ru' ? 'Бестселлер' : 'Bestseller'}
                  </Label>
                  {updatingId === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Switch
                      id={`bestseller-${product.id}`}
                      checked={product.is_bestseller ?? false}
                      onCheckedChange={() => handleToggle(product.id, 'is_bestseller', product.is_bestseller ?? false)}
                    />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor={`new-${product.id}`} className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    {language === 'ar' ? 'جديد' : language === 'ru' ? 'Новинка' : 'New'}
                  </Label>
                  {updatingId === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Switch
                      id={`new-${product.id}`}
                      checked={product.is_new ?? false}
                      onCheckedChange={() => handleToggle(product.id, 'is_new', product.is_new ?? false)}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProductsManager;
