import { useCartStore } from "@/store/cartStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X, Plus, Minus, ShoppingBag, Gift, Truck, Trash2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total, clearCart, itemCount } = useCartStore();
  const { language, isRTL } = useLanguage();
  const { settings } = useStoreSettings();

  const freeShippingThreshold = settings?.free_shipping_threshold || 200;
  const currentTotal = total();
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - currentTotal);
  const shippingProgress = Math.min(100, (currentTotal / freeShippingThreshold) * 100);

  const regularItems = items.filter(item => !item.isSample);
  const sampleItems = items.filter(item => item.isSample);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={toggleCart}
      />
      
      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 z-50 h-full w-full max-w-md bg-background shadow-2xl transition-transform duration-300",
          isRTL ? "right-0" : "left-0",
          isOpen 
            ? "translate-x-0" 
            : isRTL ? "translate-x-full" : "-translate-x-full"
        )}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {language === "ar" ? "سلة التسوق" : "Shopping Cart"}
              </h2>
              {itemCount() > 0 && (
                <Badge variant="secondary" className="rounded-full">
                  {itemCount()}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={toggleCart}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Free Shipping Progress */}
          {currentTotal > 0 && (
            <div className="border-b border-border p-4">
              {remainingForFreeShipping > 0 ? (
                <>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>
                      {language === "ar" 
                        ? `أضف ${remainingForFreeShipping.toFixed(0)} ر.س للشحن المجاني`
                        : `Add ${remainingForFreeShipping.toFixed(0)} SAR for free shipping`}
                    </span>
                  </div>
                  <Progress value={shippingProgress} className="h-2" />
                </>
              ) : (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Truck className="h-4 w-4" />
                <span className="font-medium">
                  {language === "ar" ? "🎉 تهانينا! حصلت على شحن مجاني" : "🎉 Congratulations! You got free shipping"}
                </span>
              </div>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingCart className="mb-4 h-20 w-20 text-muted-foreground/20" />
                <p className="text-lg font-medium text-muted-foreground">
                  {language === "ar" ? "سلة التسوق فارغة" : "Your cart is empty"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {language === "ar" ? "ابدأ بإضافة منتجات إلى سلتك" : "Start adding products to your cart"}
                </p>
                <Button className="mt-6" onClick={toggleCart} asChild>
                  <Link to="/products">
                    {language === "ar" ? "تصفح المنتجات" : "Browse Products"}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Regular Items */}
                {regularItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="group flex gap-4 rounded-lg bg-secondary/30 p-3 transition-all hover:bg-secondary/50"
                  >
                    <Link to={`/product/${item.product.id.split('-')[0]}`} onClick={toggleCart}>
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-20 w-20 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <Link 
                        to={`/product/${item.product.id.split('-')[0]}`} 
                        onClick={toggleCart}
                        className="font-medium text-foreground line-clamp-1 hover:text-primary transition-colors"
                      >
                        {language === "ar" ? item.product.name : item.product.nameEn}
                      </Link>
                      <p className="text-sm text-primary font-semibold">
                        {item.product.price} {language === "ar" ? "ر.س" : "SAR"}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-lg border border-border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {(item.product.price * item.quantity).toFixed(0)} {language === "ar" ? "ر.س" : "SAR"}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Free Samples Section */}
                {sampleItems.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-accent-foreground">
                        {language === "ar" ? "عينات مجانية" : "Free Samples"}
                      </span>
                    </div>
                    {sampleItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex gap-3 rounded-lg border border-accent/30 bg-accent/10 p-3"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-14 w-14 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                        <div className="flex flex-1 flex-col justify-center">
                          <span className="text-sm font-medium line-clamp-1">
                            {language === "ar" ? item.product.name : item.product.nameEn}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-accent text-accent-foreground text-[10px]">
                              <Gift className="h-3 w-3 mr-1" />
                              {language === "ar" ? "مجاني" : "Free"}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-border p-4 space-y-4">
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {language === "ar" ? "المجموع الفرعي" : "Subtotal"}
                  </span>
                  <span>{currentTotal.toFixed(0)} {language === "ar" ? "ر.س" : "SAR"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {language === "ar" ? "الشحن" : "Shipping"}
                  </span>
                  <span className={remainingForFreeShipping <= 0 ? "text-green-600 font-medium" : ""}>
                    {remainingForFreeShipping <= 0 
                      ? (language === "ar" ? "مجاني" : "Free")
                      : (language === "ar" ? "يحسب عند الدفع" : "Calculated at checkout")}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-semibold">
                    {language === "ar" ? "المجموع" : "Total"}
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {currentTotal.toFixed(0)} {language === "ar" ? "ر.س" : "SAR"}
                  </span>
                </div>
              </div>

              <Link to="/checkout" onClick={toggleCart}>
                <Button className="w-full gap-2" size="lg">
                  <ShoppingBag className="h-5 w-5" />
                  {language === "ar" ? "إتمام الشراء" : "Checkout"}
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-destructive"
                onClick={clearCart}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {language === "ar" ? "مسح السلة" : "Clear Cart"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
