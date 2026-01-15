import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  ShoppingBag,
  UserCheck,
  ChevronLeft,
  Save,
  Loader2,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FeaturedProductsManager from "@/components/admin/FeaturedProductsManager";

interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price: number;
  original_price: number | null;
  category: string;
  image_url: string | null;
  in_stock: boolean | null;
  is_featured: boolean | null;
  is_bestseller: boolean | null;
  is_new: boolean | null;
  rating: number | null;
  reviews_count: number | null;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  shipping_address: string | null;
  phone: string | null;
  profiles?: {
    full_name: string | null;
  };
}

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    name_ar: "",
    description: "",
    description_ar: "",
    price: "",
    original_price: "",
    category: "lip-gloss",
    image_url: "",
    in_stock: true,
    is_featured: false,
    is_bestseller: false,
    is_new: false,
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setOrders((data as any) || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSaveProduct = async () => {
    setIsSaving(true);
    try {
      const productData = {
        name: productForm.name,
        name_ar: productForm.name_ar || null,
        description: productForm.description || null,
        description_ar: productForm.description_ar || null,
        price: parseFloat(productForm.price),
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
        category: productForm.category,
        image_url: productForm.image_url || null,
        in_stock: productForm.in_stock,
        is_featured: productForm.is_featured,
        is_bestseller: productForm.is_bestseller,
        is_new: productForm.is_new,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: "تم تحديث المنتج بنجاح" });
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast({ title: "تم إضافة المنتج بنجاح" });
      }

      setIsProductDialogOpen(false);
      resetProductForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ title: "حدث خطأ", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast({ title: "تم حذف المنتج" });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      name_ar: product.name_ar || "",
      description: product.description || "",
      description_ar: product.description_ar || "",
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      category: product.category,
      image_url: product.image_url || "",
      in_stock: product.in_stock ?? true,
      is_featured: product.is_featured ?? false,
      is_bestseller: product.is_bestseller ?? false,
      is_new: product.is_new ?? false,
    });
    setIsProductDialogOpen(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      name_ar: "",
      description: "",
      description_ar: "",
      price: "",
      original_price: "",
      category: "lip-gloss",
      image_url: "",
      in_stock: true,
      is_featured: false,
      is_bestseller: false,
      is_new: false,
    });
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast({ title: "تم تحديث حالة الطلب" });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };

  const sidebarLinks = [
    { id: "overview", icon: LayoutDashboard, label: t('admin.dashboard') },
    { id: "products", icon: Package, label: t('admin.products') },
    { id: "featured", icon: Star, label: t('admin.featured') },
    { id: "orders", icon: ShoppingCart, label: t('admin.orders') },
    { id: "customers", icon: Users, label: t('admin.customers') },
    { id: "analytics", icon: BarChart3, label: t('admin.analytics') },
    { id: "settings", icon: Settings, label: t('admin.settings') },
  ];

  const stats = [
    { 
      title: t('admin.totalSales'), 
      value: `${orders.reduce((sum, o) => sum + Number(o.total), 0).toLocaleString()} ${t('product.sar')}`, 
      change: "+12%", 
      icon: DollarSign, 
      color: "text-green-600" 
    },
    { title: t('admin.orders'), value: orders.length.toString(), change: "+8%", icon: ShoppingBag, color: "text-blue-600" },
    { title: t('admin.customers'), value: "1,234", change: "+18%", icon: UserCheck, color: "text-purple-600" },
    { title: t('admin.products'), value: products.length.toString(), change: "0%", icon: Package, color: "text-orange-600" },
  ];

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
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-40 h-full w-64 border-l border-border bg-background transition-transform duration-300",
          !isSidebarOpen && "translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">نوره</span>
            <span className="text-xs text-muted-foreground">لوحة التحكم</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => setActiveTab(link.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === link.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Link to="/">
            <Button variant="outline" className="w-full gap-2">
              <ChevronLeft className="h-4 w-4" />
              {t('admin.returnToStore')}
            </Button>
          </Link>
        </div>
      </aside>
      
      {/* Main content */}
      <main className={cn("min-h-screen transition-all duration-300", isSidebarOpen ? "mr-64" : "mr-0")}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">
              {sidebarLinks.find((l) => l.id === activeTab)?.label}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Input placeholder="بحث..." className="w-64" />
          </div>
        </header>
        
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                          <p className={cn("mt-1 text-sm", stat.color)}>{stat.change}</p>
                        </div>
                        <div className={cn("rounded-full bg-secondary p-3", stat.color)}>
                          <stat.icon className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>أحدث الطلبات</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("orders")}>
                    عرض الكل
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الطلب</TableHead>
                        <TableHead>العميل</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                          <TableCell>{order.profiles?.full_name || 'غير معروف'}</TableCell>
                          <TableCell>{order.total} ر.س</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleDateString('ar-SA')}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">إدارة المنتجات</h2>
                <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
                  setIsProductDialogOpen(open);
                  if (!open) resetProductForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      {t('admin.addProduct')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>اسم المنتج (English)</Label>
                          <Input
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            placeholder="Product name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>اسم المنتج (العربية)</Label>
                          <Input
                            value={productForm.name_ar}
                            onChange={(e) => setProductForm({ ...productForm, name_ar: e.target.value })}
                            placeholder="اسم المنتج"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>الوصف (English)</Label>
                          <Textarea
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            placeholder="Description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>الوصف (العربية)</Label>
                          <Textarea
                            value={productForm.description_ar}
                            onChange={(e) => setProductForm({ ...productForm, description_ar: e.target.value })}
                            placeholder="وصف المنتج"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>السعر</Label>
                          <Input
                            type="number"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>السعر الأصلي</Label>
                          <Input
                            type="number"
                            value={productForm.original_price}
                            onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>الفئة</Label>
                          <Select
                            value={productForm.category}
                            onValueChange={(v) => setProductForm({ ...productForm, category: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lip-gloss">ملمع الشفاه</SelectItem>
                              <SelectItem value="lipstick">أحمر الشفاه</SelectItem>
                              <SelectItem value="lip-oil">زيت الشفاه</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>رابط الصورة</Label>
                        <Input
                          value={productForm.image_url}
                          onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="in_stock"
                            checked={productForm.in_stock}
                            onCheckedChange={(c) => setProductForm({ ...productForm, in_stock: c })}
                          />
                          <Label htmlFor="in_stock">متوفر في المخزون</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            id="is_featured"
                            checked={productForm.is_featured}
                            onCheckedChange={(c) => setProductForm({ ...productForm, is_featured: c })}
                          />
                          <Label htmlFor="is_featured">منتج مميز</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            id="is_bestseller"
                            checked={productForm.is_bestseller}
                            onCheckedChange={(c) => setProductForm({ ...productForm, is_bestseller: c })}
                          />
                          <Label htmlFor="is_bestseller">الأكثر مبيعاً</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            id="is_new"
                            checked={productForm.is_new}
                            onCheckedChange={(c) => setProductForm({ ...productForm, is_new: c })}
                          />
                          <Label htmlFor="is_new">منتج جديد</Label>
                        </div>
                      </div>
                      
                      <Button onClick={handleSaveProduct} disabled={isSaving} className="w-full gap-2">
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead>الفئة</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>التقييم</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image_url || '/placeholder.svg'}
                                alt={product.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-medium">{product.name_ar || product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.price} ر.س</TableCell>
                          <TableCell>{product.rating} ⭐</TableCell>
                          <TableCell>
                            {product.in_stock ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">متوفر</Badge>
                            ) : (
                              <Badge variant="destructive">نفذ</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === "orders" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>جميع الطلبات</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الطلب</TableHead>
                        <TableHead>العميل</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                          <TableCell>{order.profiles?.full_name || 'غير معروف'}</TableCell>
                          <TableCell>{order.total} ر.س</TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(v) => handleUpdateOrderStatus(order.id, v)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">بانتظار الدفع</SelectItem>
                                <SelectItem value="processing">قيد التجهيز</SelectItem>
                                <SelectItem value="shipped">تم الشحن</SelectItem>
                                <SelectItem value="completed">مكتمل</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleDateString('ar-SA')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === "featured" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {language === 'ar' ? 'إدارة المنتجات المميزة' : language === 'ru' ? 'Управление избранными товарами' : 'Featured Products Management'}
                </h2>
              </div>
              <FeaturedProductsManager products={products} onUpdate={fetchProducts} />
            </div>
          )}
          
          {activeTab === "customers" && (
            <Card>
              <CardHeader>
                <CardTitle>إدارة العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">قريباً - إدارة بيانات العملاء</p>
              </CardContent>
            </Card>
          )}
          
          {activeTab === "analytics" && (
            <Card>
              <CardHeader>
                <CardTitle>التحليلات والإحصائيات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">قريباً - تحليلات متقدمة للمبيعات</p>
              </CardContent>
            </Card>
          )}
          
          {activeTab === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle>إعدادات المتجر</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">قريباً - إعدادات المتجر والحساب</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
