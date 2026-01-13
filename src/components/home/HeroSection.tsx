import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-gradient-hero">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-accent/10 blur-3xl" />
      </div>
      
      <div className="container relative mx-auto px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="order-2 text-center lg:order-1 lg:text-right">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
              <Sparkles className="h-4 w-4" />
              <span>منتجات تجميل روسية أصلية 100%</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              اكتشفي{" "}
              <span className="text-gradient-gold">جمالك الطبيعي</span>
              <br />
              مع نوره للتجميل
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              مجموعة حصرية من أفخم مستحضرات التجميل الروسية، 
              مصممة خصيصاً لتعزيز جمالك الطبيعي وإبراز أنوثتك الساحرة.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link to="/products">
                <Button size="lg" className="gap-2 text-lg shadow-lg">
                  تسوقي الآن
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button variant="outline" size="lg" className="text-lg">
                  استكشفي المجموعات
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="mt-12 flex justify-center gap-8 lg:justify-start">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">+500</p>
                <p className="text-sm text-muted-foreground">منتج</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">+10K</p>
                <p className="text-sm text-muted-foreground">عميلة سعيدة</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground">أصلي</p>
              </div>
            </div>
          </div>
          
          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl" />
              <img
                src={heroBanner}
                alt="Noura Beauty Products"
                className="relative rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
