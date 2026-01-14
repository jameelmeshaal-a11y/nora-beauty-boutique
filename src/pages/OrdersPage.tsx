import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

interface Order {
  id: string;
  status: string;
  total: number;
  shipping_address: string | null;
  created_at: string;
}

const OrdersPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    if (user) {
      fetchOrders();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">مكتمل</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">قيد التجهيز</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">بانتظار الدفع</Badge>;
      case "shipped":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">تم الشحن</Badge>;
      case "cancelled":
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
          <Package className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">يرجى تسجيل الدخول</h1>
          <p className="text-muted-foreground">سجل الدخول لعرض طلباتك</p>
          <Link to="/auth">
            <Button>تسجيل الدخول</Button>
          </Link>
        </div>
        <Footer />
        <CartDrawer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span className="text-foreground">طلباتي</span>
        </nav>
        
        <h1 className="mb-8 text-3xl font-bold text-foreground">طلباتي</h1>
        
        {orders.length === 0 ? (
          <Card className="text-center">
            <CardContent className="py-12">
              <Package className="mx-auto h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">لا توجد طلبات</h2>
              <p className="mt-2 text-muted-foreground">لم تقم بأي طلبات بعد</p>
              <Link to="/products">
                <Button className="mt-4">تسوق الآن</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-medium">
                        طلب #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {getStatusBadge(order.status)}
                      <span className="font-bold text-primary">
                        {order.total.toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>
                  
                  {order.shipping_address && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      العنوان: {order.shipping_address}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default OrdersPage;
