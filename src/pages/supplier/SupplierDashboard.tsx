import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3, Settings,
  Plus, Edit, Trash2, ChevronLeft, Loader2, AlertCircle, Eye, Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useSupplier } from '@/hooks/useSupplier';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import SupplierAnalytics from '@/components/supplier/SupplierAnalytics';
import PayoutRequests from '@/components/supplier/PayoutRequests';
import SupplierSettings from '@/components/supplier/SupplierSettings';

const SupplierDashboard = () => {
  const { user } = useAuth();
  const { supplier, isLoading: supplierLoading, isSupplier } = useSupplier();
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not a supplier
  useEffect(() => {
    if (!supplierLoading && !supplier && user) {
      navigate('/supplier/register');
    }
  }, [supplierLoading, supplier, user, navigate]);

  // Fetch supplier products
  const { data: products = [], refetch: refetchProducts } = useQuery({
    queryKey: ['supplier-products', supplier?.id],
    queryFn: async () => {
      if (!supplier) return [];
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', supplier.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!supplier,
  });

  // Fetch supplier orders
  const { data: orders = [] } = useQuery({
    queryKey: ['supplier-orders', supplier?.id],
    queryFn: async () => {
      if (!supplier) return [];
      // Get orders that contain supplier's products
      const { data } = await supabase
        .from('order_items')
        .select(`
          *,
          orders (*),
          products!inner (supplier_id)
        `)
        .eq('products.supplier_id', supplier.id)
        .order('id', { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!supplier,
  });

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast.success(language === 'ar' ? 'تم حذف المنتج' : 'Product deleted');
      refetchProducts();
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error deleting product');
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (supplierLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show pending verification message
  if (supplier && !supplier.is_verified) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <Navbar />
        <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="py-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
              <h2 className="mt-4 text-xl font-semibold">
                {language === 'ar' ? 'طلبك قيد المراجعة' : 'Application Under Review'}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {language === 'ar' 
                  ? 'شكراً لتقديم طلبك! فريقنا يراجع بياناتك وسنتواصل معك قريباً.'
                  : 'Thank you for your application! Our team is reviewing your information.'}
              </p>
              <Link to="/">
                <Button className="mt-6">
                  {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Show inactive message
  if (supplier && !supplier.is_active) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <Navbar />
        <main className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="py-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
              <h2 className="mt-4 text-xl font-semibold">
                {language === 'ar' ? 'حسابك غير نشط' : 'Account Inactive'}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {language === 'ar' 
                  ? 'تم تعطيل حسابك. يرجى التواصل مع الدعم.'
                  : 'Your account has been deactivated. Please contact support.'}
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const stats = [
    { 
      title: language === 'ar' ? 'إجمالي المنتجات' : 'Total Products',
      value: products.length,
      color: 'text-blue-600'
    },
    { 
      title: language === 'ar' ? 'منتجات متوفرة' : 'In Stock',
      value: products.filter((p: any) => p.in_stock).length,
      color: 'text-green-600'
    },
    { 
      title: language === 'ar' ? 'الطلبات' : 'Orders',
      value: orders.length,
      color: 'text-purple-600'
    },
    { 
      title: language === 'ar' ? 'التقييم' : 'Rating',
      value: supplier?.rating?.toFixed(1) || '0.0',
      color: 'text-amber-600'
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === 'ar' ? 'لوحة تحكم المورد' : 'Supplier Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? supplier?.company_name_ar || supplier?.company_name : supplier?.company_name}
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ChevronLeft className={isRTL ? 'rotate-180' : ''} />
              {language === 'ar' ? 'العودة للمتجر' : 'Back to Store'}
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              {language === 'ar' ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              {language === 'ar' ? 'المنتجات' : 'Products'}
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              {language === 'ar' ? 'الطلبات' : 'Orders'}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              {language === 'ar' ? 'الإعدادات' : 'Settings'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'أحدث المنتجات' : 'Recent Products'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {products.length === 0 ? (
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لا توجد منتجات حتى الآن' : 'No products yet'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {products.slice(0, 5).map((product: any) => (
                        <div key={product.id} className="flex items-center gap-3">
                          <img
                            src={product.image_url || 'https://via.placeholder.com/50'}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium">
                              {language === 'ar' ? product.name_ar || product.name : product.name}
                            </p>
                            <p className="text-sm text-muted-foreground">{product.price} SAR</p>
                          </div>
                          <Badge variant={product.in_stock ? 'default' : 'secondary'}>
                            {product.in_stock 
                              ? (language === 'ar' ? 'متوفر' : 'In Stock')
                              : (language === 'ar' ? 'نفذ' : 'Out')
                            }
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'معلومات الحساب' : 'Account Info'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الشركة' : 'Company'}</p>
                    <p className="font-medium">{supplier?.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'ar' ? 'البريد' : 'Email'}</p>
                    <p className="font-medium">{supplier?.contact_email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الهاتف' : 'Phone'}</p>
                    <p className="font-medium">{supplier?.contact_phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'ar' ? 'نسبة العمولة' : 'Commission'}</p>
                    <p className="font-medium">{supplier?.commission_rate}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{language === 'ar' ? 'منتجاتي' : 'My Products'}</CardTitle>
                <Link to="/supplier/products/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    {language === 'ar' ? 'إضافة منتج' : 'Add Product'}
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      {language === 'ar' ? 'لا توجد منتجات حتى الآن' : 'No products yet'}
                    </p>
                    <Link to="/supplier/products/new">
                      <Button className="mt-4">
                        {language === 'ar' ? 'أضف أول منتج' : 'Add Your First Product'}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'ar' ? 'المنتج' : 'Product'}</TableHead>
                        <TableHead>{language === 'ar' ? 'السعر' : 'Price'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الكمية' : 'Stock'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead>{language === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product: any) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image_url || 'https://via.placeholder.com/40'}
                                alt={product.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                              <span>{language === 'ar' ? product.name_ar || product.name : product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{product.price} SAR</TableCell>
                          <TableCell>{product.stock_quantity || 0}</TableCell>
                          <TableCell>
                            <Badge variant={product.in_stock ? 'default' : 'secondary'}>
                              {product.in_stock 
                                ? (language === 'ar' ? 'متوفر' : 'Active')
                                : (language === 'ar' ? 'غير متوفر' : 'Inactive')
                              }
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link to={`/product/${product.id}`}>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link to={`/supplier/products/${product.id}/edit`}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'الطلبات الواردة' : 'Incoming Orders'}</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      {language === 'ar' ? 'لا توجد طلبات حتى الآن' : 'No orders yet'}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'ar' ? 'رقم الطلب' : 'Order ID'}</TableHead>
                        <TableHead>{language === 'ar' ? 'المنتج' : 'Product'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الكمية' : 'Qty'}</TableHead>
                        <TableHead>{language === 'ar' ? 'السعر' : 'Price'}</TableHead>
                        <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">
                            {item.order_id?.slice(0, 8)}...
                          </TableCell>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.price} SAR</TableCell>
                          <TableCell>
                            {item.orders?.created_at 
                              ? new Date(item.orders.created_at).toLocaleDateString()
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {language === 'ar' 
                      ? 'لتعديل بيانات الشركة، يرجى التواصل مع الدعم'
                      : 'To modify company details, please contact support'}
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'ar' ? 'اسم الشركة' : 'Company Name'}</p>
                    <p className="font-medium">{supplier?.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الحالة' : 'Status'}</p>
                    <Badge variant={supplier?.is_active ? 'default' : 'secondary'}>
                      {supplier?.is_active 
                        ? (language === 'ar' ? 'نشط' : 'Active')
                        : (language === 'ar' ? 'غير نشط' : 'Inactive')
                      }
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default SupplierDashboard;
