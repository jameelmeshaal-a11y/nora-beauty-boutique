import { Link } from "react-router-dom";
import { products } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const FeaturedProducts = () => {
  const featuredProducts = products.filter(p => p.badge === "bestseller" || p.badge === "new").slice(0, 4);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">منتجات مميزة</h2>
            <p className="text-muted-foreground">اكتشفي أكثر المنتجات مبيعاً وأحدث الإصدارات</p>
          </div>
          <Link to="/products" className="hidden sm:block">
            <Button variant="outline" className="gap-2">
              عرض الكل
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="mt-8 text-center sm:hidden">
          <Link to="/products">
            <Button variant="outline" className="gap-2">
              عرض الكل
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
