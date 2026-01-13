import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  TrendingUp,
  DollarSign,
  ShoppingBag,
  UserCheck,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";

// Mock data for orders
const orders = [
  { id: "ORD001", customer: "سارة أحمد", total: 289, status: "completed", date: "2024-01-10" },
  { id: "ORD002", customer: "نور محمد", total: 450, status: "processing", date: "2024-01-10" },
  { id: "ORD003", customer: "ريم خالد", total: 175, status: "pending", date: "2024-01-09" },
  { id: "ORD004", customer: "لمى عبدالله", total: 320, status: "completed", date: "2024-01-09" },
  { id: "ORD005", customer: "هند سعود", total: 195, status: "shipped", date: "2024-01-08" },
];

const stats = [
  { title: "إجمالي المبيعات", value: "45,230 ر.س", change: "+12%", icon: DollarSign, color: "text-green-600" },
  { title: "الطلبات", value: "156", change: "+8%", icon: ShoppingBag, color: "text-blue-600" },
  { title: "العملاء", value: "1,234", change: "+18%", icon: UserCheck, color: "text-purple-600" },
  { title: "المنتجات", value: products.length.toString(), change: "0%", icon: Package, color: "text-orange-600" },
];

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const sidebarLinks = [
    { id: "overview", icon: LayoutDashboard, label: "نظرة عامة" },
    { id: "products", icon: Package, label: "المنتجات" },
    { id: "orders", icon: ShoppingCart, label: "الطلبات" },
    { id: "customers", icon: Users, label: "العملاء" },
    { id: "analytics", icon: BarChart3, label: "التحليلات" },
    { id: "settings", icon: Settings, label: "الإعدادات" },
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
              العودة للمتجر
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
                  <Button variant="outline" size="sm">عرض الكل</Button>
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
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>{order.total} ر.س</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{order.date}</TableCell>
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
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة منتج
                </Button>
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
                                src={product.image}
                                alt={product.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.nameEn}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.price} ر.س</TableCell>
                          <TableCell>{product.rating} ⭐</TableCell>
                          <TableCell>
                            {product.inStock ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">متوفر</Badge>
                            ) : (
                              <Badge variant="destructive">نفذ</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive">
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
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>{order.total} ر.س</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
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
