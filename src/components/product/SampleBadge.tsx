import { Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface SampleBadgeProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const SampleBadge = ({ size = "md", showText = true }: SampleBadgeProps) => {
  const { language } = useLanguage();

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <Badge 
      className={`bg-accent text-accent-foreground uppercase tracking-wider flex items-center gap-1 ${sizeClasses[size]}`}
    >
      <Gift className={iconSizes[size]} />
      {showText && (
        <span>{language === 'ar' ? 'عينة مجانية' : 'Free Sample'}</span>
      )}
    </Badge>
  );
};

export default SampleBadge;
