import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { ChevronRight, CreditCard, Truck, MapPin, Phone, User, Loader2, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { useCoupon } from "@/hooks/useCoupon";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import { z } from "zod";

interface CreateOrderResponse {
  success?: boolean;
  order_id?: string;
  total?: number;
  message?: string;
  error?: string;
}

const checkoutSchema = z.object({
  fullName: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().min(9, "رقم الجوال مطلوب"),
  address: z.string().min(10, "العنوان مطلوب"),
  city: z.string().min(2, "المدينة مطلوبة"),
  notes: z.string().optional()
});

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponInput, setCouponInput] = useState("");
  const { applied, error: couponError, loading: couponLoading, applyCoupon, clearCoupon } = useCoupon();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    notes: ""
  });

  // Capture influencer referral code (?ref=NORA15)
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) localStorage.setItem("noura_ref", ref);
  }, [searchParams]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput.trim(), total());
    if (res) toast.success(`تم تطبيق الكوبون: خصم ${res.discountAmount.toFixed(2)} ر.س`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      navigate("/auth");
      return;
    }

    if (items.length === 0) {
      toast.error("السلة فارغة");
      return;
    }

    setIsSubmitting(true);
    
    try {
      checkoutSchema.parse(formData);
      
      const shippingAddress = `${formData.address}, ${formData.city}`;
      
      // Prepare cart items for server-side validation (only IDs and quantities)
      const cartItems = items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }));

      // Call secure Edge Function for order creation
      // Server will validate prices and calculate total - never trust client prices
      const { data, error } = await supabase.functions.invoke<CreateOrderResponse>('create-order', {
        body: {
          items: cartItems,
          shipping_address: shippingAddress,
          phone: formData.phone,
          notes: formData.notes || null
        }
      });

      if (error) {
        console.error('Order creation error:', error);
        throw new Error(error.message || 'Failed to create order');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create order');
      }
      
      clearCart();
      toast.success("تم إرسال طلبك بنجاح! سنتواصل معك قريباً");
      navigate("/orders");
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error('Checkout error:', error);
        toast.error("حدث خطأ أثناء إتمام الطلب");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const shippingCost = total() >= 200 ? 0 : 25;
  const discount = applied?.discountAmount || 0;
  const grandTotal = Math.max(0, total() + shippingCost - discount);

  if (!user) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
          <h1 className="text-2xl font-bold text-foreground">يرجى تسجيل الدخول للمتابعة</h1>
          <Link to="/auth">
            <Button>تسجيل الدخول</Button>
          </Link>
        </div>
        <Footer />
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
          <span className="text-foreground">إتمام الطلب</span>
        </nav>
        
        <h1 className="mb-8 text-3xl font-bold text-foreground">إتمام الطلب</h1>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    معلومات الشحن
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">الاسم الكامل</Label>
                      <div className="relative">
                        <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="pr-10"
                          placeholder="الاسم الكامل"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الجوال</Label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="pr-10"
                          placeholder="05XXXXXXXX"
                          dir="ltr"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">المدينة</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="المدينة"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان الكامل</Label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="min-h-[100px] pr-10"
                        placeholder="الحي، الشارع، رقم المبنى..."
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="ملاحظات إضافية للتوصيل..."
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    طريقة الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 space-x-reverse rounded-lg border border-border p-4">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <span className="font-medium">الدفع عند الاستلام</span>
                        <p className="text-sm text-muted-foreground">ادفع نقداً عند استلام طلبك</p>
                      </Label>
                    </div>
                    <div className="mt-2 flex items-center space-x-2 space-x-reverse rounded-lg border border-border p-4 opacity-50">
                      <RadioGroupItem value="card" id="card" disabled />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <span className="font-medium">بطاقة ائتمان</span>
                        <p className="text-sm text-muted-foreground">قريباً</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
              
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || items.length === 0}>
                {isSubmitting ? "جاري إرسال الطلب..." : `إتمام الطلب - ${grandTotal.toFixed(2)} ر.س`}
              </Button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground">السلة فارغة</p>
                ) : (
                  <>
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {item.product.price} ر.س
                          </p>
                        </div>
                        <p className="font-medium">{(item.quantity * item.product.price).toFixed(2)} ر.س</p>
                      </div>
                    ))}
                    
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between text-sm">
                        <span>المجموع الفرعي</span>
                        <span>{total().toFixed(2)} ر.س</span>
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span>الشحن</span>
                        <span>{shippingCost === 0 ? 'مجاني' : `${shippingCost} ر.س`}</span>
                      </div>
                      {total() < 200 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          أضف {(200 - total()).toFixed(2)} ر.س للحصول على شحن مجاني
                        </p>
                      )}
                      <div className="mt-4 flex justify-between border-t border-border pt-4 text-lg font-bold">
                        <span>الإجمالي</span>
                        <span className="text-primary">{grandTotal.toFixed(2)} ر.س</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;
