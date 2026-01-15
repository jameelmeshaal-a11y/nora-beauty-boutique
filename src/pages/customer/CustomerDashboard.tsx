import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Package, Heart, MapPin, Star, Settings, LogOut,
  ChevronLeft, ShoppingBag, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const CustomerDashboard = () => {
  const { user, signOut } = useAuth();
  const { favorites } = useFavorites();
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    address: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch user profile
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setProfileForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
        });
      }
      return data;
    },
    enabled: !!user,
  });

  // Fetch user orders
  const { data: orders = [] } = useQuery({
    queryKey: ['customer-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileForm)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success(language === 'ar' ? 'تم تحديث الملف الشخصي' : 'Profile updated');
      refetchProfile();
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error updating profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { 
        label: language === 'ar' ? 'قيد الانتظار' : 'Pending', 
        className: 'bg-yellow-100 text-yellow-800' 
      },
      processing: { 
        label: language === 'ar' ? 'قيد التجهيز' : 'Processing', 
        className: 'bg-blue-100 text-blue-800' 
      },
      shipped: { 
        label: language === 'ar' ? 'تم الشحن' : 'Shipped', 
        className: 'bg-purple-100 text-purple-800' 
      },
      completed: { 
        label: language === 'ar' ? 'مكتمل' : 'Completed', 
        className: 'bg-green-100 text-green-800' 
      },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-secondary' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'ar' ? 'حسابي' : 'My Account'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? `مرحباً، ${profile?.full_name || user.email}` : `Welcome, ${profile?.full_name || user.email}`}
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ChevronLeft className={isRTL ? 'rotate-180' : ''} />
              {language === 'ar' ? 'العودة للمتجر' : 'Back to Store'}
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
                </p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-accent/10 p-3">
                <Heart className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'المفضلة' : 'Favorites'}
                </p>
                <p className="text-2xl font-bold">{favorites.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-green-100 p-3">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'طلبات نشطة' : 'Active Orders'}
                </p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-purple-100 p-3">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'تقييماتي' : 'My Reviews'}
                </p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none">
            <TabsTrigger value="overview" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'ar' ? 'طلباتي' : 'Orders'}</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'ar' ? 'المفضلة' : 'Favorites'}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'ar' ? 'الإعدادات' : 'Settings'}</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'معلومات الملف الشخصي' : 'Profile Information'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</Label>
                    <Input
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                    <Input value={user.email || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</Label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'العنوان' : 'Address'}</Label>
                    <Input
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleUpdateProfile} disabled={isUpdating}>
                  {isUpdating 
                    ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                    : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'طلباتي' : 'My Orders'}</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      {language === 'ar' ? 'لا توجد طلبات حتى الآن' : 'No orders yet'}
                    </p>
                    <Link to="/products">
                      <Button className="mt-4">
                        {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div
                        key={order.id}
                        className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">
                            {language === 'ar' ? 'رقم الطلب' : 'Order'} #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </p>
                          <p className="text-sm">
                            {order.order_items?.length || 0} {language === 'ar' ? 'منتجات' : 'items'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(order.status)}
                          <p className="font-semibold text-primary">
                            {order.total} {language === 'ar' ? 'ر.س' : 'SAR'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'المفضلة' : 'Favorites'}</CardTitle>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="py-12 text-center">
                    <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      {language === 'ar' ? 'لا توجد منتجات مفضلة' : 'No favorites yet'}
                    </p>
                    <Link to="/products">
                      <Button className="mt-4">
                        {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {favorites.map((productId) => (
                      <Link
                        key={productId}
                        to={`/product/${productId}`}
                        className="rounded-lg border border-border p-4 transition-colors hover:border-primary"
                      >
                        <p className="font-medium">Product {productId.slice(0, 8)}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'الإعدادات' : 'Settings'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="destructive"
                  onClick={() => {
                    signOut();
                    navigate('/');
                  }}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default CustomerDashboard;
