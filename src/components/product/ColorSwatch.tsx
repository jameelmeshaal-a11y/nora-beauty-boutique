import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';

interface ColorOption {
  id: string;
  name: string;
  name_ar?: string | null;
  color_code: string;
  lip_image_url?: string | null;
  in_stock?: boolean;
}

interface ColorSwatchProps {
  colors: ColorOption[];
  selectedColor?: string;
  onColorSelect: (colorId: string) => void;
  size?: 'sm' | 'md' | 'lg';
  maxVisible?: number;
  showNames?: boolean;
}

const ColorSwatch = ({
  colors,
  selectedColor,
  onColorSelect,
  size = 'md',
  maxVisible = 6,
  showNames = false,
}: ColorSwatchProps) => {
  const { language } = useLanguage();

  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-9 w-9',
  };

  const visibleColors = colors.slice(0, maxVisible);
  const remainingCount = colors.length - maxVisible;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TooltipProvider delayDuration={200}>
        {visibleColors.map((color) => (
          <Tooltip key={color.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => color.in_stock !== false && onColorSelect(color.id)}
                disabled={color.in_stock === false}
                className={cn(
                  'rounded-full border-2 transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  sizeClasses[size],
                  selectedColor === color.id
                    ? 'border-primary ring-2 ring-primary ring-offset-1'
                    : 'border-border hover:border-primary/50',
                  color.in_stock === false && 'opacity-40 cursor-not-allowed'
                )}
                style={{ backgroundColor: color.color_code }}
                aria-label={language === 'ar' ? color.name_ar || color.name : color.name}
              >
                {selectedColor === color.id && (
                  <Check 
                    className={cn(
                      'h-full w-full p-0.5',
                      isLightColor(color.color_code) ? 'text-foreground' : 'text-white'
                    )} 
                  />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>{language === 'ar' ? color.name_ar || color.name : color.name}</p>
              {color.in_stock === false && (
                <p className="text-destructive">
                  {language === 'ar' ? 'غير متوفر' : 'Out of stock'}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <span className="text-xs text-muted-foreground">
            +{remainingCount}
          </span>
        )}
      </TooltipProvider>

      {showNames && selectedColor && (
        <span className="text-sm text-muted-foreground">
          {colors.find(c => c.id === selectedColor)?.name_ar || 
           colors.find(c => c.id === selectedColor)?.name}
        </span>
      )}
    </div>
  );
};

// Helper function to determine if a color is light
function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

export default ColorSwatch;
