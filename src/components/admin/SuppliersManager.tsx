import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: string; company_name: string; company_name_ar: string | null; country: string | null;
  contact_email: string | null; total_sales: number | null; commission_rate: number;
  is_active: boolean | null; is_verified: boolean | null; created_at: string;
}

const SuppliersManager = () => {
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false });
    setItems((data as Supplier[]) || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: any) => {
    await supabase.from("suppliers").update(patch).eq("id", id);
    toast({ title: "تم التحديث" });
    load();
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">إدارة الموردين ({items.length})</h2>
      <Table>
        <TableHeader><TableRow><TableHead>الشركة</TableHead><TableHead>البلد</TableHead><TableHead>المبيعات</TableHead><TableHead>عمولة</TableHead><TableHead>موثق</TableHead><TableHead>نشط</TableHead><TableHead>إجراءات</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <div className="font-medium">{s.company_name_ar || s.company_name}</div>
                <div className="text-xs text-muted-foreground">{s.contact_email}</div>
              </TableCell>
              <TableCell>{s.country}</TableCell>
              <TableCell className="font-bold">{Number(s.total_sales || 0).toLocaleString()} ر.س</TableCell>
              <TableCell>{s.commission_rate}%</TableCell>
              <TableCell><Switch checked={!!s.is_verified} onCheckedChange={(v) => update(s.id, { is_verified: v })} /></TableCell>
              <TableCell><Switch checked={!!s.is_active} onCheckedChange={(v) => update(s.id, { is_active: v })} /></TableCell>
              <TableCell>
                {!s.is_verified && <Button size="sm" onClick={() => update(s.id, { is_verified: true, is_active: true })} className="gap-1"><Check className="h-3 w-3" /> موافقة</Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SuppliersManager;
