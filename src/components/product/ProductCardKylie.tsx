import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, Plus, Minus, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ProductVariant {
  id: string;
  name: string;
  name_ar: string | null;
  color_code: string;
  image_url: string | null;
  lip_image_url: string | null;
  in_stock: boolean | null;
}

interface ProductCardKylieProps {
  product: {
    id: string;
    name: string;
    name_ar?: string | null;
    price: number;
    original_price?: number | null;
    image_url?: string | null;
    images?: string[] | null;
    rating?: number | null;
    reviews_count?: number | null;
    shades_count?: number | null;
    is_bestseller?: boolean | null;
    is_new?: boolean | null;
    is_featured?: boolean | null;
    in_stock?: boolean | null;
    has_free_sample?: boolean | null;
    brand?: string | null;
  };
}

const ProductCardKylie = ({ product }: ProductCardKylieProps) => {
  const { addItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { language, t } = useLanguage();
  
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Fetch variants
  useEffect(() => {
    const fetchVariants = async () => {
      const { data } = await supabase
        .from('product_variants')
        .select('id, name, name_ar, color_code, image_url, lip_image_url, in_stock')
        .eq('product_id', product.id)
        .order('created_at', { ascending: true });
      
      if (data && data.length > 0) {
        setVariants(data);
        setSelectedVariant(data[0]);
      }
    };
    fetchVariants();
  }, [product.id]);

  const isFav = isFavorite(product.id);

  // Get current display image
  const getCurrentImage = () => {
    if (isHovered) {
      // Show product image on hover
      return product.image_url || product.images?.[0] || '/placeholder.svg';
    }
    // Show lip image if available
    if (selectedVariant?.lip_image_url) {
      return selectedVariant.lip_image_url;
    }
    if (selectedVariant?.image_url) {
      return selectedVariant.image_url;
    }
    return product.image_url || product.images?.[0] || '/placeholder.svg';
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartProduct = {
      id: product.id,
      name: product.name_ar || product.name,
      nameEn: product.name,
      price: product.price,
      originalPrice: product.original_price || undefined,
      image: selectedVariant?.image_url || product.image_url || '/placeholder.svg',
      description: "",
      rating: product.rating || 4.5,
      reviews: product.reviews_count || 0,
      inStock: product.in_stock ?? true,
      shades: product.shades_count || variants.length,
      hasSample: product.has_free_sample ?? false,
      category: "cosmetics",
    };
    
    for (let i = 0; i < quantity; i++) {
      addItem(cartProduct);
    }
    setQuantity(1);
  };

  const handleColorSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  const shadesCount = product.shades_count || variants.length;
  const displayedColors = variants.slice(0, 8);
  const remainingColors = variants.length > 8 ? variants.length - 8 : 0;

  return (
    <div className="group relative flex flex-col bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300">
      {/* Image Container */}
      <Link to={`/product/${product.id}`}>
        <div 
          className="relative aspect-square overflow-hidden bg-secondary/20"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={getCurrentImage()}
            alt={language === 'ar' ? product.name_ar || product.name : product.name}
            className="h-full w-full object-cover transition-all duration-500"
          />
          
          {/* Shades Count - Top Left */}
          {shadesCount > 0 && (
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                +{shadesCount} {language === 'ar' ? 'درجة' : 'shades'}
              </span>
            </div>
          )}
          
          {/* Badges - Top Right */}
          <div className="absolute right-3 top-3 flex flex-col gap-1.5">
            {product.is_bestseller && (
              <Badge className="bg-foreground text-background text-[10px] uppercase tracking-wider">
                {language === 'ar' ? 'الأكثر مبيعاً' : 'Best Seller'}
              </Badge>
            )}
            {product.is_new && (
              <Badge className="bg-primary text-primary-foreground text-[10px] uppercase tracking-wider">
                {language === 'ar' ? 'جديد' : 'New'}
              </Badge>
            )}
            {product.has_free_sample && (
              <Badge className="bg-accent text-accent-foreground text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Gift className="h-3 w-3" />
                {language === 'ar' ? 'عينة مجانية' : 'Free Sample'}
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={cn(
              "absolute left-3 bottom-3 z-10 rounded-full p-2 backdrop-blur-sm transition-all duration-200",
              isFav 
                ? "bg-primary text-primary-foreground" 
                : "bg-background/80 text-foreground hover:bg-background"
            )}
          >
            <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
          </button>
        </div>
      </Link>

      {/* Color Swatches */}
      {variants.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 px-3 py-2 border-b border-border">
          {displayedColors.map((variant) => (
            <button
              key={variant.id}
              onClick={() => handleColorSelect(variant)}
              className={cn(
                "relative h-5 w-5 rounded-full border-2 transition-all duration-200",
                selectedVariant?.id === variant.id 
                  ? "border-foreground scale-110" 
                  : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: variant.color_code }}
              title={language === 'ar' ? variant.name_ar || variant.name : variant.name}
            >
              {selectedVariant?.id === variant.id && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
                </span>
              )}
            </button>
          ))}
          {remainingColors > 0 && (
            <span className="text-xs text-muted-foreground ml-1">
              +{remainingColors}
            </span>
          )}
        </div>
      )}

      {/* Product Info */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="text-sm font-medium">{product.rating?.toFixed(1) || '4.5'}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviews_count || 0})
          </span>
        </div>

        {/* Brand & Name */}
        <Link to={`/product/${product.id}`} className="flex-1">
          {product.brand && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
              {product.brand}
            </p>
          )}
          <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors text-sm leading-tight">
            {language === 'ar' ? product.name_ar || product.name : product.name}
          </h3>
        </Link>

        {/* Selected Color Name */}
        {selectedVariant && (
          <p className="text-xs text-primary mt-1 font-medium">
            {language === 'ar' ? selectedVariant.name_ar || selectedVariant.name : selectedVariant.name}
          </p>
        )}

        {/* Price & Add to Cart */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">
              {product.price} {language === 'ar' ? 'ر.س' : 'SAR'}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {product.original_price} {language === 'ar' ? 'ر.س' : 'SAR'}
              </span>
            )}
          </div>

          {/* Quantity & Add Button */}
          <div className="flex items-center gap-1">
            <div className="flex items-center border border-border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={(e) => {
                  e.preventDefault();
                  setQuantity(Math.max(1, quantity - 1));
                }}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center text-sm font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={(e) => {
                  e.preventDefault();
                  setQuantity(quantity + 1);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Button
              size="sm"
              className="h-8 px-3"
              onClick={handleAddToCart}
              disabled={!product.in_stock}
            >
              {language === 'ar' ? 'أضف' : 'Add'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardKylie;
