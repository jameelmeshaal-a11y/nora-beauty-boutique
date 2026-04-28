import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Coupon {
  id: string; code: string; discount_type: string; discount_value: number;
  min_order_amount: number | null; max_uses: number | null; used_count: number | null;
  is_active: boolean | null; expires_at: string | null;
}

const empty = { code: "", discount_type: "percent", discount_value: 10, min_order_amount: 0, max_uses: 100, is_active: true, expires_at: "" };

const CouponsManager = () => {
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setItems((data as Coupon[]) || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.code) return toast({ title: "كود الخصم مطلوب", variant: "destructive" });
    const payload: any = { ...form, code: form.code.toUpperCase() };
    if (!payload.expires_at) delete payload.expires_at;
    const { error } = await supabase.from("coupons").insert(payload);
    if (error) return toast({ title: "خطأ", description: error.message, variant: "destructive" });
    toast({ title: "تمت الإضافة" }); setOpen(false); setForm(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف الكوبون؟")) return;
    await supabase.from("coupons").delete().eq("id", id);
    toast({ title: "تم الحذف" }); load();
  };

  const toggle = async (id: string, is_active: boolean) => {
    await supabase.from("coupons").update({ is_active: !is_active }).eq("id", id);
    load();
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">إدارة الكوبونات</h2>
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> كوبون جديد</Button>
      </div>

      <Table>
        <TableHeader><TableRow><TableHead>الكود</TableHead><TableHead>الخصم</TableHead><TableHead>حد أدنى</TableHead><TableHead>الاستخدام</TableHead><TableHead>الحالة</TableHead><TableHead>إجراءات</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono font-bold">{c.code}</TableCell>
              <TableCell>{c.discount_type === "percent" ? `${c.discount_value}%` : `${c.discount_value} ر.س`}</TableCell>
              <TableCell>{c.min_order_amount} ر.س</TableCell>
              <TableCell>{c.used_count || 0} / {c.max_uses || "∞"}</TableCell>
              <TableCell><Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "نشط" : "معطل"}</Badge></TableCell>
              <TableCell className="flex gap-1">
                <Switch checked={!!c.is_active} onCheckedChange={() => toggle(c.id, !!c.is_active)} />
                <Button size="sm" variant="destructive" onClick={() => remove(c.id)}><Trash2 className="h-3 w-3" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>كوبون جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>الكود</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="NORA20" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>النوع</Label>
                <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percent">نسبة %</SelectItem><SelectItem value="fixed">مبلغ ثابت</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>القيمة</Label><Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>حد أدنى للطلب (ر.س)</Label><Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>عدد الاستخدامات</Label><Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div><Label>تاريخ الانتهاء (اختياري)</Label><Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></div>
            <Button onClick={save} className="w-full">حفظ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponsManager;
