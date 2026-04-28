import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Influencer {
  id: string; name: string; name_ar: string | null; name_ru: string | null;
  bio_ar: string | null; photo_url: string | null;
  instagram: string | null; tiktok: string | null;
  affiliate_code: string | null; commission_rate: number | null;
  followers_count: number | null; is_featured: boolean | null; is_active: boolean | null;
}

const empty = { name: "", name_ar: "", name_ru: "", bio_ar: "", photo_url: "", instagram: "", tiktok: "", affiliate_code: "", commission_rate: 10, followers_count: 0, is_featured: true, is_active: true };

const InfluencersManager = () => {
  const [items, setItems] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Influencer | null>(null);
  const [form, setForm] = useState(empty);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("influencers").select("*").order("created_at", { ascending: false });
    setItems((data as Influencer[]) || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startEdit = (i?: Influencer) => {
    if (i) { setEditing(i); setForm({ name: i.name, name_ar: i.name_ar || "", name_ru: i.name_ru || "", bio_ar: i.bio_ar || "", photo_url: i.photo_url || "", instagram: i.instagram || "", tiktok: i.tiktok || "", affiliate_code: i.affiliate_code || "", commission_rate: i.commission_rate || 10, followers_count: i.followers_count || 0, is_featured: i.is_featured ?? true, is_active: i.is_active ?? true }); }
    else { setEditing(null); setForm(empty); }
    setOpen(true);
  };

  const save = async () => {
    const { error } = editing
      ? await supabase.from("influencers").update(form).eq("id", editing.id)
      : await supabase.from("influencers").insert(form);
    if (error) return toast({ title: "خطأ", description: error.message, variant: "destructive" });
    toast({ title: editing ? "تم التحديث" : "تمت الإضافة" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف؟")) return;
    await supabase.from("influencers").delete().eq("id", id);
    load();
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">إدارة المؤثرات</h2>
        <Button onClick={() => startEdit()} className="gap-2"><Plus className="h-4 w-4" /> مؤثرة جديدة</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((i) => (
          <Card key={i.id}>
            <CardContent className="p-3">
              {i.photo_url && <img src={i.photo_url} alt="" className="w-full h-32 object-cover rounded mb-2" />}
              <p className="font-bold">{i.name_ar || i.name}</p>
              <p className="text-xs text-muted-foreground">{i.followers_count?.toLocaleString()} متابع</p>
              {i.affiliate_code && <p className="text-sm font-mono text-crimson mt-1">{i.affiliate_code} ({i.commission_rate}%)</p>}
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(i)}><Edit className="h-3 w-3" /></Button>
                <Button size="sm" variant="destructive" onClick={() => remove(i.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "تعديل" : "مؤثرة جديدة"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div><Label>الاسم (EN)</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>(AR)</Label><Input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} /></div>
              <div><Label>(RU)</Label><Input value={form.name_ru} onChange={(e) => setForm({ ...form, name_ru: e.target.value })} /></div>
            </div>
            <div><Label>الصورة</Label><Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} /></div>
            <div><Label>السيرة (AR)</Label><Textarea value={form.bio_ar} onChange={(e) => setForm({ ...form, bio_ar: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Instagram</Label><Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></div>
              <div><Label>TikTok</Label><Input value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>كود الإحالة</Label><Input value={form.affiliate_code} onChange={(e) => setForm({ ...form, affiliate_code: e.target.value.toUpperCase() })} /></div>
              <div><Label>عمولة %</Label><Input type="number" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>المتابعون</Label><Input type="number" value={form.followers_count} onChange={(e) => setForm({ ...form, followers_count: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>نشطة</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /><Label>مميزة</Label></div>
            </div>
            <Button onClick={save} className="w-full">حفظ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InfluencersManager;
