import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FavoritesProvider } from "@/hooks/useFavorites";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AuthPage from "./pages/AuthPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import AboutPage from "./pages/AboutPage";
import FavoritesPage from "./pages/FavoritesPage";
import NotFound from "./pages/NotFound";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import SupplierRegister from "./pages/supplier/SupplierRegister";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import SupplierProductForm from "./pages/supplier/SupplierProductForm";
import CategoryPage from "./pages/CategoryPage";
import BrandPage from "./pages/BrandPage";
import BrandsListPage from "./pages/BrandsListPage";
import InfluencersPage from "./pages/InfluencersPage";
import DealsPage from "./pages/DealsPage";
import CommunityPage from "./pages/CommunityPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <FavoritesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<CategoryPage />} />
                <Route path="/category" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/brand/:slug" element={<BrandPage />} />
                <Route path="/brands" element={<BrandsListPage />} />
                <Route path="/influencers" element={<InfluencersPage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                {/* Customer Dashboard */}
                <Route path="/account" element={<CustomerDashboard />} />
                <Route path="/account/*" element={<CustomerDashboard />} />
                {/* Supplier Routes */}
                <Route path="/supplier/register" element={<SupplierRegister />} />
                <Route path="/supplier" element={<SupplierDashboard />} />
                <Route path="/supplier/products/new" element={<SupplierProductForm />} />
                <Route path="/supplier/products/:id/edit" element={<SupplierProductForm />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </FavoritesProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
