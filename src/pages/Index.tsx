import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import RussianHero from "@/components/home/RussianHero";
import BrandsGrid from "@/components/home/BrandsGrid";
import InfluencersStrip from "@/components/home/InfluencersStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />
      <CartDrawer />
      <main>
        <RussianHero />
        <BrandsGrid />
        <FeaturedProducts />
        <CategoriesSection />
        <InfluencersStrip />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
