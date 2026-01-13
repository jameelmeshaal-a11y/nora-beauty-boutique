import { categories } from "@/data/products";
import { Link } from "react-router-dom";
import lipGloss1 from "@/assets/products/lip-gloss-1.jpg";
import lipstick1 from "@/assets/products/lipstick-1.jpg";
import lipOil1 from "@/assets/products/lip-oil-1.jpg";

const categoryImages: Record<string, string> = {
  "lip-gloss": lipGloss1,
  "lipstick": lipstick1,
  "lip-oil": lipOil1
};

const CategoriesSection = () => {
  const displayCategories = categories.filter(c => c.id !== "all");

  return (
    <section className="bg-secondary/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">تصفحي حسب الفئة</h2>
          <p className="text-muted-foreground">اختاري الفئة التي تناسب احتياجاتك</p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group relative overflow-hidden rounded-2xl"
            >
              <div className="aspect-[4/3]">
                <img
                  src={categoryImages[category.id]}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <h3 className="text-2xl font-bold text-background">{category.name}</h3>
                <p className="mt-1 text-sm text-background/80">{category.nameEn}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
