import { Product } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t, language } = useLanguage();

  const getBadgeVariant = (badge?: string) => {
    switch (badge) {
      case "bestseller":
        return "default";
      case "new":
        return "secondary";
      case "sale":
        return "destructive";
      default:
        return "default";
    }
  };

  const getBadgeText = (badge?: string) => {
    switch (badge) {
      case "bestseller":
        return t('product.bestseller');
      case "new":
        return t('product.new');
      case "sale":
        return t('product.sale');
      default:
        return "";
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const isFav = isFavorite(product.id);

  return (
    <div className="group relative overflow-hidden rounded-xl bg-card shadow-soft transition-all duration-300 hover:shadow-hover">
      {/* Image container */}
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-secondary/20">
          <img
            src={product.image}
            alt={language === 'ar' ? product.name : product.nameEn}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Badges */}
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            {product.badge && (
              <Badge variant={getBadgeVariant(product.badge)} className="shadow-sm">
                {getBadgeText(product.badge)}
              </Badge>
            )}
            {!product.inStock && (
              <Badge variant="outline" className="bg-background/80">
                {t('product.outOfStock')}
              </Badge>
            )}
          </div>
          
          {/* Shades count */}
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-background/80 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
              +{product.shades} {t('product.shades')}
            </span>
          </div>
          
          {/* Quick actions overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-foreground/20 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-10 w-10 rounded-full shadow-lg",
                isFav && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              onClick={handleFavoriteClick}
            >
              <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
            </Button>
            <Button
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Link>
      
      {/* Favorite button (always visible on mobile) */}
      <button
        onClick={handleFavoriteClick}
        className={cn(
          "absolute right-3 top-16 z-10 rounded-full p-2 backdrop-blur-sm transition-colors lg:hidden",
          isFav 
            ? "bg-primary text-primary-foreground" 
            : "bg-background/80 text-foreground hover:bg-background"
        )}
      >
        <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
      </button>
      
      {/* Content */}
      <div className="p-4">
        {/* Rating */}
        <div className="mb-2 flex items-center gap-1">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span className="text-sm font-medium text-foreground">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>
        
        {/* Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="mb-1 font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
            {language === 'ar' ? product.name : product.nameEn}
          </h3>
        </Link>
        <p className="mb-3 text-xs text-muted-foreground line-clamp-1">
          {language === 'ar' ? product.nameEn : product.name}
        </p>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            {product.price} {t('product.sar')}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.originalPrice} {t('product.sar')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
