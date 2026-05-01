import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Upload,
  Loader2,
  Save,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

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
  in_stock: boolean | null;
  is_active: boolean | null;
  is_new: boolean | null;
  is_featured: boolean | null;
  is_bestseller: boolean | null;
  rating: number | null;
  reviews_count: number | null;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
}

interface CategoryRow {
  slug: string;
  name: string;
  name_ar: string | null;
}

const emptyForm = {
  name: "",
  name_ar: "",
  name_ru: "",
  description: "",
  description_ar: "",
  description_ru: "",
  brand: "",
  price: "",
  original_price: "",
  category: "skin",
  image_url: "",
  stock_quantity: "0",
  low_stock_threshold: "5",
  rating: "4.5",
  is_new: true,
  is_featured: false,
  is_bestseller: false,
  in_stock: true,
};

const ProductsManager = () => {
  const { toast } = useToast();
  const { language } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Edit/create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Quick image fix dialog
  const [imgDialogOpen, setImgDialogOpen] = useState(false);
  const [imgDialogProduct, setImgDialogProduct] = useState<Product | null>(null);
  const [imgUrlInput, setImgUrlInput] = useState("");
  const [imgUploading, setImgUploading] = useState(false);

  const isAr = language === "ar";

  useEffect(() => {
    void fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("slug, name, name_ar").order("sort_order"),
    ]);
    setProducts((p as any) || []);
    setCategories((c as any) || []);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.name_ar?.toLowerCase().includes(q) ||
          p.name_ru?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }
    if (filterCategory !== "all") {
      list = list.filter((p) => p.category === filterCategory);
    }
    if (sortBy === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [products, search, filterCategory, sortBy]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setGalleryImages([]);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      name_ar: p.name_ar || "",
      name_ru: p.name_ru || "",
      description: p.description || "",
      description_ar: p.description_ar || "",
      description_ru: p.description_ru || "",
      brand: p.brand || "",
      price: String(p.price ?? ""),
      original_price: p.original_price ? String(p.original_price) : "",
      category: p.category || "skin",
      image_url: p.image_url || "",
      stock_quantity: String(p.stock_quantity ?? 0),
      low_stock_threshold: String(p.low_stock_threshold ?? 5),
      rating: String(p.rating ?? 4.5),
      is_new: !!p.is_new,
      is_featured: !!p.is_featured,
      is_bestseller: !!p.is_bestseller,
      in_stock: p.in_stock ?? true,
    });
    setGalleryImages(Array.isArray(p.images) ? p.images : []);
    setDialogOpen(true);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) {
      toast({ title: isAr ? "فشل الرفع" : "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleMainUpload = async (file: File) => {
    setUploadingMain(true);
    const url = await uploadFile(file);
    if (url) setForm((f) => ({ ...f, image_url: url }));
    setUploadingMain(false);
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploadingGallery(true);
    const remaining = 5 - galleryImages.length;
    const toUpload = Array.from(files).slice(0, remaining);
    const urls: string[] = [];
    for (const f of toUpload) {
      const u = await uploadFile(f);
      if (u) urls.push(u);
    }
    setGalleryImages((g) => [...g, ...urls].slice(0, 5));
    setUploadingGallery(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast({ title: isAr ? "الاسم والسعر مطلوبان" : "Name and price required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload: any = {
      name: form.name,
      name_ar: form.name_ar || null,
      name_ru: form.name_ru || null,
      description: form.description || null,
      description_ar: form.description_ar || null,
      description_ru: form.description_ru || null,
      brand: form.brand || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      category: form.category,
      image_url: form.image_url || null,
      images: galleryImages.length ? galleryImages : null,
      stock_quantity: parseInt(form.stock_quantity || "0", 10),
      low_stock_threshold: parseInt(form.low_stock_threshold || "5", 10),
      rating: parseFloat(form.rating || "4.5"),
      is_new: form.is_new,
      is_featured: form.is_featured,
      is_bestseller: form.is_bestseller,
      in_stock: form.in_stock,
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) {
      toast({ title: isAr ? "حدث خطأ" : "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? (isAr ? "تم التحديث" : "Updated") : (isAr ? "تمت الإضافة" : "Created") });
      setDialogOpen(false);
      void fetchAll();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? "تأكيد الحذف؟" : "Confirm delete?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast({ title: error.message, variant: "destructive" });
    else {
      toast({ title: isAr ? "تم الحذف" : "Deleted" });
      void fetchAll();
    }
  };

  const handleBulk = async (action: "delete" | "activate" | "deactivate") => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    if (action === "delete") {
      if (!confirm(isAr ? `حذف ${ids.length} منتج؟` : `Delete ${ids.length} products?`)) return;
      const { error } = await supabase.from("products").delete().in("id", ids);
      if (error) return toast({ title: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase
        .from("products")
        .update({ is_active: action === "activate" })
        .in("id", ids);
      if (error) return toast({ title: error.message, variant: "destructive" });
    }
    toast({ title: isAr ? "تم التنفيذ" : "Done" });
    setSelected(new Set());
    void fetchAll();
  };

  const openImgDialog = (p: Product) => {
    setImgDialogProduct(p);
    setImgUrlInput(p.image_url || "");
    setImgDialogOpen(true);
  };

  const saveImgUrl = async () => {
    if (!imgDialogProduct) return;
    const { error } = await supabase
      .from("products")
      .update({ image_url: imgUrlInput })
      .eq("id", imgDialogProduct.id);
    if (error) return toast({ title: error.message, variant: "destructive" });
    toast({ title: isAr ? "تم تحديث الصورة" : "Image updated" });
    setImgDialogOpen(false);
    void fetchAll();
  };

  const uploadImgDialog = async (file: File) => {
    if (!imgDialogProduct) return;
    setImgUploading(true);
    const url = await uploadFile(file);
    if (url) {
      const { error } = await supabase
        .from("products")
        .update({ image_url: url })
        .eq("id", imgDialogProduct.id);
      if (error) toast({ title: error.message, variant: "destructive" });
      else {
        toast({ title: isAr ? "تم رفع الصورة" : "Image uploaded" });
        setImgDialogOpen(false);
        void fetchAll();
      }
    }
    setImgUploading(false);
  };

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? "بحث بالاسم أو البراند..." : "Search name or brand..."}
              className="pl-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "كل الفئات" : "All categories"}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {isAr ? c.name_ar || c.name : c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{isAr ? "الأحدث" : "Recent"}</SelectItem>
              <SelectItem value="price_asc">{isAr ? "السعر ↑" : "Price ↑"}</SelectItem>
              <SelectItem value="price_desc">{isAr ? "السعر ↓" : "Price ↓"}</SelectItem>
              <SelectItem value="rating">{isAr ? "التقييم" : "Rating"}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> {isAr ? "منتج جديد" : "New Product"}
          </Button>
        </div>

        {selected.size > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
            <span className="text-sm text-muted-foreground">
              {isAr ? `محدد: ${selected.size}` : `Selected: ${selected.size}`}
            </span>
            <Button size="sm" variant="outline" onClick={() => handleBulk("activate")} className="gap-1">
              <Eye className="h-3 w-3" /> {isAr ? "تفعيل" : "Activate"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulk("deactivate")} className="gap-1">
              <EyeOff className="h-3 w-3" /> {isAr ? "إيقاف" : "Deactivate"}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulk("delete")} className="gap-1">
              <Trash2 className="h-3 w-3" /> {isAr ? "حذف" : "Delete"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          {isAr ? `إجمالي: ${filtered.length} من ${products.length}` : `${filtered.length} of ${products.length}`}
        </p>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-20">{isAr ? "صورة" : "Image"}</TableHead>
                <TableHead>{isAr ? "الاسم" : "Name"}</TableHead>
                <TableHead>{isAr ? "الفئة" : "Category"}</TableHead>
                <TableHead>{isAr ? "السعر" : "Price"}</TableHead>
                <TableHead>{isAr ? "المخزون" : "Stock"}</TableHead>
                <TableHead className="text-right">{isAr ? "إجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleSelect(p.id)} />
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => openImgDialog(p)}
                      className="relative h-14 w-14 overflow-hidden rounded-md border bg-muted hover:ring-2 hover:ring-primary transition"
                      title={isAr ? "إصلاح/تغيير الصورة" : "Fix/change image"}
                    >
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="m-auto h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{isAr ? p.name_ar || p.name : p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.brand}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-primary">{p.price} {isAr ? "ر.س" : "SAR"}</TableCell>
                  <TableCell>
                    <span className={p.stock_quantity && p.stock_quantity > 0 ? "" : "text-destructive"}>
                      {p.stock_quantity ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openImgDialog(p)} title={isAr ? "إصلاح صورة" : "Fix image"}>
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? (isAr ? "تعديل منتج" : "Edit product") : (isAr ? "منتج جديد" : "New product")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "الاسم (EN)" : "Name (EN)"}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الاسم (AR)" : "Name (AR)"}</Label>
              <Input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{isAr ? "الاسم (RU)" : "Name (RU)"}</Label>
              <Input value={form.name_ru} onChange={(e) => setForm({ ...form, name_ru: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>{isAr ? "البراند" : "Brand"}</Label>
              <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الفئة" : "Category"}</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {isAr ? c.name_ar || c.name : c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{isAr ? "السعر" : "Price"}</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "السعر الأصلي" : "Original price"}</Label>
              <Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>{isAr ? "المخزون" : "Stock"}</Label>
              <Input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "حد المخزون المنخفض" : "Low stock threshold"}</Label>
              <Input type="number" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>{isAr ? "التقييم" : "Rating"}</Label>
              <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
            </div>
            <div className="flex items-end gap-4 pb-2">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_new} onCheckedChange={(v) => setForm({ ...form, is_new: v })} />
                <Label className="text-xs">{isAr ? "جديد" : "New"}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_bestseller} onCheckedChange={(v) => setForm({ ...form, is_bestseller: v })} />
                <Label className="text-xs">{isAr ? "الأكثر مبيعاً" : "Bestseller"}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} />
                <Label className="text-xs">{isAr ? "متوفر" : "In stock"}</Label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label>{isAr ? "الوصف (AR)" : "Description (AR)"}</Label>
              <Textarea rows={2} value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{isAr ? "الوصف (EN)" : "Description (EN)"}</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{isAr ? "الوصف (RU)" : "Description (RU)"}</Label>
              <Textarea rows={2} value={form.description_ru} onChange={(e) => setForm({ ...form, description_ru: e.target.value })} />
            </div>

            {/* Main image */}
            <div className="space-y-2 md:col-span-2 border-t pt-4">
              <Label className="text-base font-semibold">{isAr ? "الصورة الرئيسية" : "Main image"}</Label>
              <div className="flex gap-3">
                {form.image_url && (
                  <img src={form.image_url} alt="preview" className="h-24 w-24 rounded-md object-cover border" />
                )}
                <div className="flex-1 space-y-2">
                  <Input
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleMainUpload(e.target.files[0])}
                      disabled={uploadingMain}
                    />
                    {uploadingMain && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="space-y-2 md:col-span-2 border-t pt-4">
              <Label className="text-base font-semibold">
                {isAr ? `معرض الصور (${galleryImages.length}/5)` : `Gallery (${galleryImages.length}/5)`}
              </Label>
              <div className="flex flex-wrap gap-2">
                {galleryImages.map((url, i) => (
                  <div key={i} className="relative h-20 w-20 rounded-md border overflow-hidden group">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setGalleryImages((g) => g.filter((_, idx) => idx !== i))}
                      className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl-md p-0.5 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {galleryImages.length < 5 && (
                  <label className="h-20 w-20 rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted">
                    {uploadingGallery ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-[10px] mt-1">{isAr ? "أضف" : "Add"}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
                      disabled={uploadingGallery}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isAr ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick image fix dialog */}
      <Dialog open={imgDialogOpen} onOpenChange={setImgDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "إصلاح صورة المنتج" : "Fix product image"}</DialogTitle>
          </DialogHeader>
          {imgDialogProduct && (
            <div className="space-y-4">
              <div className="flex gap-3">
                {imgUrlInput && (
                  <img src={imgUrlInput} alt="" className="h-32 w-32 rounded-md object-cover border" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{isAr ? imgDialogProduct.name_ar || imgDialogProduct.name : imgDialogProduct.name}</p>
                  <p className="text-xs text-muted-foreground">{imgDialogProduct.category}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "رابط الصورة" : "Image URL"}</Label>
                <Input value={imgUrlInput} onChange={(e) => setImgUrlInput(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "أو ارفع من الجهاز" : "Or upload from device"}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && uploadImgDialog(e.target.files[0])}
                    disabled={imgUploading}
                  />
                  {imgUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImgDialogOpen(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={saveImgUrl} className="gap-2">
              <Save className="h-4 w-4" /> {isAr ? "حفظ الرابط" : "Save URL"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsManager;
