import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Brand {
  id: string; name: string; name_ar: string | null; name_ru: string | null; slug: string;
  logo_url: string | null; country: string | null; discount_percent: number | null;
  is_featured: boolean | null; is_active: boolean | null;
}

const empty = { name: "", name_ar: "", name_ru: "", slug: "", logo_url: "", country: "Russia", discount_percent: 0, is_featured: true, is_active: true };

const BrandsManager = () => {
  const [items, setItems] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState(empty);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("brands").select("*").order("sort_order");
    setItems((data as Brand[]) || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startEdit = (b?: Brand) => {
    if (b) { setEditing(b); setForm({ name: b.name, name_ar: b.name_ar || "", name_ru: b.name_ru || "", slug: b.slug, logo_url: b.logo_url || "", country: b.country || "Russia", discount_percent: b.discount_percent || 0, is_featured: b.is_featured ?? true, is_active: b.is_active ?? true }); }
    else { setEditing(null); setForm(empty); }
    setOpen(true);
  };

  const save = async () => {
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-");
    const payload = { ...form, slug };
    const { error } = editing
      ? await supabase.from("brands").update(payload).eq("id", editing.id)
      : await supabase.from("brands").insert(payload);
    if (error) return toast({ title: "خطأ", description: error.message, variant: "destructive" });
    toast({ title: editing ? "تم التحديث" : "تمت الإضافة" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف البراند؟")) return;
    await supabase.from("brands").delete().eq("id", id);
    toast({ title: "تم الحذف" }); load();
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">إدارة البراندات الروسية ({items.length})</h2>
        <Button onClick={() => startEdit()} className="gap-2"><Plus className="h-4 w-4" /> براند جديد</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
        {items.map((b) => (
          <Card key={b.id}>
            <CardContent className="p-3 text-center">
              {b.logo_url ? <img src={b.logo_url} alt="" className="w-full h-20 object-contain mb-2" /> : <div className="h-20 bg-muted rounded mb-2" />}
              <p className="font-bold text-sm">{b.name}</p>
              <p className="text-xs text-muted-foreground">{b.name_ar}</p>
              {!!b.discount_percent && <p className="text-xs text-crimson font-bold mt-1">-{b.discount_percent}%</p>}
              <div className="flex gap-1 mt-2 justify-center">
                <Button size="sm" variant="outline" onClick={() => startEdit(b)}><Edit className="h-3 w-3" /></Button>
                <Button size="sm" variant="destructive" onClick={() => remove(b.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "تعديل البراند" : "براند جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div><Label>الاسم (EN)</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>(AR)</Label><Input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} /></div>
              <div><Label>(RU)</Label><Input value={form.name_ru} onChange={(e) => setForm({ ...form, name_ru: e.target.value })} /></div>
            </div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" /></div>
            <div><Label>رابط اللوقو</Label><Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>البلد</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
              <div><Label>الخصم %</Label><Input type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>نشط</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /><Label>مميز</Label></div>
            </div>
            <Button onClick={save} className="w-full">حفظ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandsManager;
