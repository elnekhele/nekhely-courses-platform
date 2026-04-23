"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";

type Coupon = {
  id: string;
  code: string;
  percentOff: number;
  active: boolean;
  used: number;
  maxUses: number | null;
};

export function CouponManager({ initial }: { initial: Coupon[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [maxUses, setMaxUses] = useState("");
  const [loading, setLoading] = useState(false);

  async function add() {
    if (!code) return;
    setLoading(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.toUpperCase(),
        percentOff: Number(percent),
        maxUses: maxUses ? Number(maxUses) : null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      toast({ title: "فشل", description: data.error, tone: "error" });
      return;
    }
    setCode(""); setPercent("10"); setMaxUses("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("حذف الكوبون؟")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <Input placeholder="الكود" value={code} onChange={(e) => setCode(e.target.value)} />
        <Input type="number" min="1" max="100" placeholder="نسبة الخصم %" value={percent} onChange={(e) => setPercent(e.target.value)} />
        <Input type="number" min="0" placeholder="حد الاستخدام (اختياري)" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
        <Button onClick={add} disabled={loading}>إضافة</Button>
      </div>
      {initial.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">لا توجد كوبونات.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="text-start py-2">الكود</th>
              <th className="text-start py-2">الخصم</th>
              <th className="text-start py-2">الاستخدامات</th>
              <th className="text-start py-2">الحالة</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {initial.map((c) => (
              <tr key={c.id}>
                <td className="py-2 font-mono font-semibold">{c.code}</td>
                <td className="py-2">{c.percentOff}%</td>
                <td className="py-2">{c.used}{c.maxUses != null ? ` / ${c.maxUses}` : ""}</td>
                <td className="py-2"><Badge variant={c.active ? "success" : "secondary"}>{c.active ? "نشط" : "معطل"}</Badge></td>
                <td className="py-2 text-end">
                  <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>
                    <Trash2 className="size-4 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
