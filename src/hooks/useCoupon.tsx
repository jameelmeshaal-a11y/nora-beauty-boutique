import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AppliedCoupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  discountAmount: number;
}

export const useCoupon = () => {
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const applyCoupon = async (code: string, orderTotal: number) => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: e } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();
      if (e || !data) { setError("كود الخصم غير صالح"); setLoading(false); return null; }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { setError("الكوبون منتهي الصلاحية"); setLoading(false); return null; }
      if (data.max_uses && (data.used_count || 0) >= data.max_uses) { setError("تم استنفاد عدد مرات الاستخدام"); setLoading(false); return null; }
      if (data.min_order_amount && orderTotal < Number(data.min_order_amount)) {
        setError(`الحد الأدنى للطلب: ${data.min_order_amount} ر.س`);
        setLoading(false); return null;
      }
      const value = Number(data.discount_value);
      const discountAmount = data.discount_type === "percent" ? (orderTotal * value) / 100 : Math.min(value, orderTotal);
      const result: AppliedCoupon = { id: data.id, code: data.code, discount_type: data.discount_type, discount_value: value, discountAmount };
      setApplied(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError("حدث خطأ");
      setLoading(false);
      return null;
    }
  };

  const clearCoupon = () => { setApplied(null); setError(null); };

  return { applied, error, loading, applyCoupon, clearCoupon };
};
