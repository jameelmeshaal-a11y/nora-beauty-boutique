import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, ShoppingBag, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total, clearCart } = useCartStore();

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-foreground/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={toggleCart}
      />
      
      {/* Drawer */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">سلة التسوق</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleCart}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/30" />
                <p className="text-lg font-medium text-muted-foreground">سلة التسوق فارغة</p>
                <p className="mt-1 text-sm text-muted-foreground">ابدأ بإضافة منتجات إلى سلتك</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className={cn(
                      "flex gap-4 rounded-lg p-3",
                      item.isSample ? "bg-accent/10 border border-accent/30" : "bg-secondary/30"
                    )}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start gap-2">
                        <h3 className="font-medium text-foreground line-clamp-1 flex-1">
                          {item.product.name}
                        </h3>
                        {item.isSample && (
                          <Badge className="bg-accent text-accent-foreground text-[10px] flex items-center gap-1">
                            <Gift className="h-3 w-3" />
                            مجاني
                          </Badge>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm",
                        item.isSample ? "text-accent font-medium" : "text-primary"
                      )}>
                        {item.isSample ? "مجاني" : `${item.product.price} ر.س`}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        {!item.isSample ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">عينة مجانية مع طلبك</span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-border p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-muted-foreground">المجموع</span>
                <span className="text-xl font-bold text-primary">{total()} ر.س</span>
              </div>
              <Link to="/checkout" onClick={toggleCart}>
                <Button className="w-full" size="lg">
                  إتمام الشراء
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="mt-2 w-full text-muted-foreground"
                onClick={clearCart}
              >
                مسح السلة
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
