import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Banner {
  id: string;
  title: string | null;
  title_ar: string | null;
  title_ru: string | null;
  subtitle: string | null;
  subtitle_ar: string | null;
  subtitle_ru: string | null;
  image_url: string;
  link: string | null;
  type: string;
  is_active: boolean | null;
  sort_order: number | null;
}

const empty = {
  title: "", title_ar: "", title_ru: "",
  subtitle: "", subtitle_ar: "", subtitle_ru: "",
  image_url: "", link: "/products", type: "hero", sort_order: 0, is_active: true,
};

const BannersManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(empty);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    setBanners((data as Banner[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startEdit = (b?: Banner) => {
    if (b) {
      setEditing(b);
      setForm({
        title: b.title || "", title_ar: b.title_ar || "", title_ru: b.title_ru || "",
        subtitle: b.subtitle || "", subtitle_ar: b.subtitle_ar || "", subtitle_ru: b.subtitle_ru || "",
        image_url: b.image_url, link: b.link || "/products", type: b.type, sort_order: b.sort_order || 0, is_active: b.is_active ?? true,
      });
    } else {
      setEditing(null);
      setForm(empty);
    }
    setOpen(true);
  };

  const save = async () => {
    if (!form.image_url) return toast({ title: "صورة البنر مطلوبة", variant: "destructive" });
    const payload = { ...form };
    const { error } = editing
      ? await supabase.from("banners").update(payload).eq("id", editing.id)
      : await supabase.from("banners").insert(payload);
    if (error) return toast({ title: "خطأ", description: error.message, variant: "destructive" });
    toast({ title: editing ? "تم التحديث" : "تمت الإضافة" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف البنر؟")) return;
    await supabase.from("banners").delete().eq("id", id);
    toast({ title: "تم الحذف" }); load();
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">إدارة البنرات</h2>
        <Button onClick={() => startEdit()} className="gap-2"><Plus className="h-4 w-4" /> إضافة بنر</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {banners.map((b) => (
          <Card key={b.id}>
            <CardContent className="p-4">
              <img src={b.image_url} alt="" className="w-full h-32 object-cover rounded mb-3" />
              <h3 className="font-bold">{b.title_ar || b.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{b.subtitle_ar || b.subtitle}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => startEdit(b)}><Edit className="h-3 w-3" /></Button>
                <Button size="sm" variant="destructive" onClick={() => remove(b.id)}><Trash2 className="h-3 w-3" /></Button>
                <span className="text-xs ml-auto self-center">{b.is_active ? "✅ نشط" : "❌ معطل"} · {b.type}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "تعديل البنر" : "بنر جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>رابط الصورة *</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>العنوان (AR)</Label><Input value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} /></div>
              <div><Label>العنوان (EN)</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>العنوان (RU)</Label><Input value={form.title_ru} onChange={(e) => setForm({ ...form, title_ru: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>الوصف (AR)</Label><Textarea value={form.subtitle_ar} onChange={(e) => setForm({ ...form, subtitle_ar: e.target.value })} /></div>
              <div><Label>الوصف (EN)</Label><Textarea value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
              <div><Label>الوصف (RU)</Label><Textarea value={form.subtitle_ru} onChange={(e) => setForm({ ...form, subtitle_ru: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>الرابط</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
              <div><Label>الترتيب</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>نشط</Label></div>
            <Button onClick={save} className="w-full">حفظ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BannersManager;
