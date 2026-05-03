import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Image as ImageIcon, Search, Loader2, Upload, Link as LinkIcon } from "lucide-react";

interface Product {
  id: string;
  name: string;
  name_ar: string | null;
  name_ru: string | null;
  description: string | null;
  description_ar: string | null;
  description_ru: string | null;
  brand: string | null;
  price: number;
  original_price: number | null;
  category: string;
  image_url: string | null;
  images: string[] | null;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  rating: number | null;
  in_stock: boolean | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  is_new: boolean | null;
  is_bestseller: boolean | null;
}

const emptyForm: Partial<Product> = {
  name: "", name_ar: "", name_ru: "", description: "", description_ar: "", description_ru: "",
  brand: "", price: 0, original_price: null, category: "skin", image_url: "", images: [],
  stock_quantity: 10, low_stock_threshold: 5, rating: 4.5,
  in_stock: true, is_active: true, is_featured: false, is_new: true, is_bestseller: false,
};

export const ProductsManager = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<Partial<Product>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [fixOpen, setFixOpen] = useState(false);
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [fixUrl, setFixUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false }).limit(1000);
    setProducts((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.name_ar?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") list = list.filter((p) => p.category === categoryFilter);
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [products, search, categoryFilter, sortBy]);

  const toggleSelect = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  const bulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    if (action === "delete") {
      if (!confirm(`حذف ${ids.length} منتج؟`)) return;
      await supabase.from("products").delete().in("id", ids);
    } else {
      await supabase.from("products").update({ is_active: action === "activate" }).in("id", ids);
    }
    toast({ title: "تم تنفيذ العملية" });
    setSelected(new Set());
    fetchProducts();
  };

  const openEdit = (p?: Product) => {
    if (p) {
      setForm({ ...p, images: p.images || [] });
      setEditingId(p.id);
    } else {
      setForm(emptyForm);
      setEditingId(null);
    }
    setEditOpen(true);
  };

  const saveProduct = async () => {
    const payload: any = {
      name: form.name, name_ar: form.name_ar, name_ru: form.name_ru,
      description: form.description, description_ar: form.description_ar, description_ru: form.description_ru,
      brand: form.brand, price: Number(form.price), original_price: form.original_price ? Number(form.original_price) : null,
      category: form.category, image_url: form.image_url, images: form.images,
      stock_quantity: Number(form.stock_quantity || 0),
      low_stock_threshold: Number(form.low_stock_threshold || 5),
      rating: Number(form.rating || 4.5),
      in_stock: form.in_stock, is_active: form.is_active,
      is_featured: form.is_featured, is_new: form.is_new, is_bestseller: form.is_bestseller,
    };
    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) return toast({ title: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) return toast({ title: error.message, variant: "destructive" });
    }
    toast({ title: "تم الحفظ" });
    setEditOpen(false);
    fetchProducts();
  };

  const deleteOne = async (id: string) => {
    if (!confirm("حذف هذا المنتج؟")) return;
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "تم الحذف" });
    fetchProducts();
  };

  const openFix = (id: string) => { setFixingId(id); setFixUrl(""); setFixOpen(true); };

  const handleFileUpload = async (file: File, productId: string) => {
    setUploading(true);
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (upErr) { setUploading(false); return toast({ title: upErr.message, variant: "destructive" }); }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    const url = data.publicUrl;
    const product = products.find((p) => p.id === productId);
    const newImages = [...(product?.images || []), url].slice(0, 5);
    await supabase.from("products").update({ image_url: url, images: newImages }).eq("id", productId);
    setUploading(false);
    setFixOpen(false);
    toast({ title: "تم تحديث الصورة" });
    fetchProducts();
  };

  const applyUrl = async () => {
    if (!fixingId || !fixUrl) return;
    const product = products.find((p) => p.id === fixingId);
    const newImages = [...(product?.images || []), fixUrl].slice(0, 5);
    await supabase.from("products").update({ image_url: fixUrl, images: newImages }).eq("id", fixingId);
    setFixOpen(false);
    toast({ title: "تم تحديث الصورة" });
    fetchProducts();
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[200px]">
          <Label>بحث</Label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pr-10" placeholder="اسم، براند..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="w-48">
          <Label>الفئة</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Label>الترتيب</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث</SelectItem>
              <SelectItem value="price-asc">السعر: الأقل</SelectItem>
              <SelectItem value="price-desc">السعر: الأعلى</SelectItem>
              <SelectItem value="rating">التقييم</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => openEdit()} className="gap-2"><Plus className="h-4 w-4" />إضافة منتج</Button>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex gap-2 items-center bg-muted p-3 rounded-lg">
          <span className="text-sm font-medium">{selected.size} محدد</span>
          <Button size="sm" variant="outline" onClick={() => bulkAction("activate")}>تفعيل</Button>
          <Button size="sm" variant="outline" onClick={() => bulkAction("deactivate")}>تعطيل</Button>
          <Button size="sm" variant="destructive" onClick={() => bulkAction("delete")}>حذف</Button>
        </div>
      )}

      <div className="text-sm text-muted-foreground">{filtered.length} منتج</div>

      {/* Table */}
      <div className="border rounded-lg">
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>صورة</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>البراند</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>المخزون</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 200).map((p) => (
                <TableRow key={p.id}>
                  <TableCell><Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleSelect(p.id)} /></TableCell>
                  <TableCell>
                    <img src={p.image_url || "/placeholder.svg"} alt={p.name}
                      className="h-14 w-14 object-cover rounded-md border" />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.name_ar}</div>
                  </TableCell>
                  <TableCell className="text-sm">{p.brand}</TableCell>
                  <TableCell className="text-xs">{p.category}</TableCell>
                  <TableCell>{p.price} ر.س</TableCell>
                  <TableCell>{p.stock_quantity}</TableCell>
                  <TableCell>
                    {p.is_active ? <Badge>نشط</Badge> : <Badge variant="secondary">غير نشط</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => openFix(p.id)} title="إصلاح الصورة">
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteOne(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? "تعديل منتج" : "إضافة منتج"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>الاسم (EN)</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>الاسم (AR)</Label><Input value={form.name_ar || ""} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} /></div>
            <div><Label>الاسم (RU)</Label><Input value={form.name_ru || ""} onChange={(e) => setForm({ ...form, name_ru: e.target.value })} /></div>
            <div><Label>البراند</Label><Input value={form.brand || ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
            <div><Label>الفئة</Label><Input value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><Label>السعر</Label><Input type="number" value={form.price || 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
            <div><Label>السعر الأصلي</Label><Input type="number" value={form.original_price || ""} onChange={(e) => setForm({ ...form, original_price: e.target.value ? Number(e.target.value) : null })} /></div>
            <div><Label>المخزون</Label><Input type="number" value={form.stock_quantity || 0} onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })} /></div>
            <div><Label>التقييم</Label><Input type="number" step="0.1" value={form.rating || 4.5} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} /></div>
            <div className="col-span-2"><Label>رابط الصورة</Label><Input value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
            <div className="col-span-2"><Label>الوصف (AR)</Label><Textarea value={form.description_ar || ""} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} /></div>
            <div className="col-span-2"><Label>الوصف (EN)</Label><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2"><Switch checked={!!form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />نشط</label>
            <label className="flex items-center gap-2"><Switch checked={!!form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} />متوفر</label>
            <label className="flex items-center gap-2"><Switch checked={!!form.is_new} onCheckedChange={(v) => setForm({ ...form, is_new: v })} />جديد</label>
            <label className="flex items-center gap-2"><Switch checked={!!form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />مميز</label>
            <label className="flex items-center gap-2"><Switch checked={!!form.is_bestseller} onCheckedChange={(v) => setForm({ ...form, is_bestseller: v })} />الأكثر مبيعاً</label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={saveProduct}>حفظ</Button>
            <Button variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fix Image Dialog */}
      <Dialog open={fixOpen} onOpenChange={setFixOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>إصلاح الصورة</DialogTitle></DialogHeader>
          <Tabs defaultValue="upload">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="upload"><Upload className="h-4 w-4 ml-1" />رفع ملف</TabsTrigger>
              <TabsTrigger value="url"><LinkIcon className="h-4 w-4 ml-1" />رابط URL</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-3 pt-3">
              <Input type="file" accept="image/*" disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f && fixingId) handleFileUpload(f, fixingId); }} />
              {uploading && <p className="text-sm text-muted-foreground">جاري الرفع...</p>}
            </TabsContent>
            <TabsContent value="url" className="space-y-3 pt-3">
              <Input placeholder="https://..." value={fixUrl} onChange={(e) => setFixUrl(e.target.value)} dir="ltr" />
              {fixUrl && <img src={fixUrl} alt="preview" className="max-h-40 mx-auto rounded-md border" />}
              <Button onClick={applyUrl} disabled={!fixUrl}>تطبيق</Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsManager;
