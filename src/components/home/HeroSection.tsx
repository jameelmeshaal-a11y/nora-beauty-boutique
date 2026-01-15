import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import heroBannerCarousel from "@/assets/hero-banner-carousel.jpg";
import heroLipsCarousel from "@/assets/hero-lips-carousel.jpg";

const HeroSection = () => {
  const { language, isRTL } = useLanguage();
  
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  const heroImages = [
    {
      src: heroBannerCarousel,
      alt: "Noura Beauty - Lipsticks & Glosses Collection"
    },
    {
      src: heroLipsCarousel,
      alt: "Noura Beauty - Glossy Lips"
    }
  ];
  
  const content = {
    ar: {
      badge: "منتجات تجميل روسية أصلية 100%",
      title1: "اكتشفي",
      titleHighlight: "جمالك الطبيعي",
      title2: "مع نوره للتجميل",
      subtitle: "مجموعة حصرية من أفخم مستحضرات التجميل الروسية، مصممة خصيصاً لتعزيز جمالك الطبيعي وإبراز أنوثتك الساحرة.",
      cta: "تسوقي الآن",
      explore: "استكشفي المجموعات",
      stats: [
        { value: "+500", label: "منتج" },
        { value: "+10K", label: "عميلة سعيدة" },
        { value: "100%", label: "أصلي" },
      ]
    },
    en: {
      badge: "100% Authentic Russian Beauty Products",
      title1: "Discover",
      titleHighlight: "Your Natural Beauty",
      title2: "with Noura Beauty",
      subtitle: "An exclusive collection of the finest Russian cosmetics, specially designed to enhance your natural beauty and highlight your captivating femininity.",
      cta: "Shop Now",
      explore: "Explore Collections",
      stats: [
        { value: "+500", label: "Products" },
        { value: "+10K", label: "Happy Customers" },
        { value: "100%", label: "Authentic" },
      ]
    },
    ru: {
      badge: "100% Подлинная русская косметика",
      title1: "Откройте",
      titleHighlight: "Свою естественную красоту",
      title2: "с Noura Beauty",
      subtitle: "Эксклюзивная коллекция лучшей русской косметики, специально созданная для подчёркивания вашей естественной красоты и очарования.",
      cta: "Купить сейчас",
      explore: "Смотреть коллекции",
      stats: [
        { value: "+500", label: "Товаров" },
        { value: "+10К", label: "Довольных клиентов" },
        { value: "100%", label: "Подлинность" },
      ]
    }
  };

  const c = content[language] || content.en;

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
          <div className={`order-2 text-center ${isRTL ? 'lg:order-1 lg:text-right' : 'lg:order-1 lg:text-left'}`}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
              <Sparkles className="h-4 w-4" />
              <span>{c.badge}</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              {c.title1}{" "}
              <span className="text-gradient-gold">{c.titleHighlight}</span>
              <br />
              {c.title2}
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              {c.subtitle}
            </p>
            
            <div className={`flex flex-col gap-4 sm:flex-row sm:justify-center ${isRTL ? 'lg:justify-start' : 'lg:justify-start'}`}>
              <Link to="/products">
                <Button size="lg" className="gap-2 text-lg shadow-lg">
                  {c.cta}
                  {isRTL ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" size="lg" className="text-lg">
                  {c.explore}
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className={`mt-12 flex justify-center gap-8 ${isRTL ? 'lg:justify-start' : 'lg:justify-start'}`}>
              {c.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Image Carousel */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl" />
              <Carousel
                plugins={[plugin.current]}
                className="w-full"
                opts={{
                  align: "start",
                  loop: true,
                  direction: isRTL ? "rtl" : "ltr",
                }}
              >
                <CarouselContent>
                  {heroImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-[400px] md:h-[500px] object-cover transition-transform duration-700 hover:scale-105"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              {/* Carousel indicators */}
              <div className="flex justify-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
