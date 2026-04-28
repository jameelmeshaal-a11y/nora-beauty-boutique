import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Payout {
  id: string; supplier_id: string; amount: number; status: string;
  payment_method: string | null; notes: string | null; requested_at: string;
  processed_at: string | null;
  suppliers?: { company_name: string; bank_account: string | null };
}

const PayoutsManager = () => {
  const [items, setItems] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("vendor_payouts").select("*, suppliers(company_name, bank_account)").order("requested_at", { ascending: false });
    setItems((data as any) || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === "approved" || status === "rejected") updates.processed_at = new Date().toISOString();
    const { error } = await supabase.from("vendor_payouts").update(updates).eq("id", id);
    if (error) return toast({ title: "خطأ", variant: "destructive" });
    toast({ title: status === "approved" ? "تمت الموافقة" : "تم الرفض" });
    load();
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">طلبات سحب الموردين</h2>
      <Table>
        <TableHeader><TableRow><TableHead>المورد</TableHead><TableHead>المبلغ</TableHead><TableHead>IBAN</TableHead><TableHead>التاريخ</TableHead><TableHead>الحالة</TableHead><TableHead>إجراءات</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">لا توجد طلبات</TableCell></TableRow>}
          {items.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.suppliers?.company_name || "—"}</TableCell>
              <TableCell className="font-bold">{p.amount} ر.س</TableCell>
              <TableCell className="font-mono text-xs">{p.suppliers?.bank_account || "—"}</TableCell>
              <TableCell>{new Date(p.requested_at).toLocaleDateString("ar-SA")}</TableCell>
              <TableCell><Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}>{p.status}</Badge></TableCell>
              <TableCell>
                {p.status === "pending" && (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => updateStatus(p.id, "approved")} className="bg-green-600 hover:bg-green-700"><Check className="h-3 w-3" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(p.id, "rejected")}><X className="h-3 w-3" /></Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PayoutsManager;
