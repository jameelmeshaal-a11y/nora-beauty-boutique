import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface StockBadgeProps {
  stockQuantity: number;
  lowStockThreshold?: number;
  showQuantity?: boolean;
  className?: string;
}

const StockBadge = ({ 
  stockQuantity, 
  lowStockThreshold = 5, 
  showQuantity = true,
  className 
}: StockBadgeProps) => {
  const { language } = useLanguage();

  if (stockQuantity <= 0) {
    return (
      <Badge variant="destructive" className={className}>
        {language === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}
      </Badge>
    );
  }

  if (stockQuantity <= lowStockThreshold) {
    return (
      <Badge 
        className={`bg-amber-100 text-amber-800 hover:bg-amber-100 ${className}`}
      >
        {language === 'ar' 
          ? `فقط ${stockQuantity} قطع متبقية!`
          : `Only ${stockQuantity} left!`
        }
      </Badge>
    );
  }

  if (showQuantity && stockQuantity > 0) {
    return (
      <Badge variant="secondary" className={className}>
        {language === 'ar' 
          ? `متوفر: ${stockQuantity}` 
          : `In Stock: ${stockQuantity}`}
      </Badge>
    );
  }

  return null;
};

export default StockBadge;
