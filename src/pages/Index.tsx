import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturesSection from "@/components/home/FeaturesSection";

const Index = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />
      <CartDrawer />
      <main>
        <HeroSection />
        <FeaturesSection />
        <FeaturedProducts />
        <CategoriesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
