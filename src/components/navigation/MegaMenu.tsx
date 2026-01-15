import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories, Category } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

const MegaMenu = () => {
  const { language, isRTL } = useLanguage();
  const { categoriesTree, isLoading } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (isLoading || categoriesTree.length === 0) return null;

  const renderSubcategories = (category: Category) => {
    if (!category.children || category.children.length === 0) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {category.children.map((subCategory) => (
          <div key={subCategory.id} className="space-y-3">
            <Link
              to={`/products?category=${subCategory.slug}`}
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              {language === 'ar' ? subCategory.name_ar || subCategory.name : subCategory.name}
            </Link>
            
            {subCategory.children && subCategory.children.length > 0 && (
              <ul className="space-y-2">
                {subCategory.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      to={`/products?category=${child.slug}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {language === 'ar' ? child.name_ar || child.name : child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <nav className="hidden lg:block border-b border-border bg-background">
      <div className="container mx-auto">
        <ul className="flex items-center justify-center gap-1">
          {categoriesTree.map((category) => (
            <li
              key={category.id}
              className="relative group"
              onMouseEnter={() => setActiveCategory(category.id)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <Link
                to={`/products?category=${category.slug}`}
                className={cn(
                  "flex items-center gap-1 px-4 py-3 text-sm font-medium transition-colors",
                  "hover:text-primary",
                  activeCategory === category.id ? "text-primary" : "text-foreground"
                )}
              >
                {language === 'ar' ? category.name_ar || category.name : category.name}
                {category.children && category.children.length > 0 && (
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    activeCategory === category.id && "rotate-180"
                  )} />
                )}
              </Link>

              {/* Dropdown */}
              {category.children && category.children.length > 0 && (
                <div
                  className={cn(
                    "absolute top-full bg-background border border-border rounded-b-lg shadow-lg",
                    "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                    "transition-all duration-200 ease-in-out",
                    "min-w-[600px] max-w-[900px]",
                    isRTL ? "right-0" : "left-0"
                  )}
                >
                  {renderSubcategories(category)}

                  {/* Featured section */}
                  <div className="border-t border-border p-4 bg-secondary/30">
                    <Link
                      to={`/products?category=${category.slug}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {language === 'ar' 
                        ? `عرض جميع ${category.name_ar || category.name}` 
                        : `View All ${category.name}`}
                    </Link>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default MegaMenu;
