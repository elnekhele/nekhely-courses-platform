"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { Trash2 } from "lucide-react";

type Category = { id: string; name: string; slug: string; icon: string | null; count: number };

export function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);

  async function add() {
    if (!name) return;
    setLoading(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon }),
    });
    setLoading(false);
    if (!res.ok) {
      toast({ title: "فشل الإضافة", tone: "error" });
      return;
    }
    setName(""); setIcon("");
    toast({ title: "تم", tone: "success" });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("حذف القسم؟")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else toast({ title: "تعذر الحذف (قد يحتوي على دورات)", tone: "error" });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="اسم القسم" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="أيقونة (إيموجي)" value={icon} onChange={(e) => setIcon(e.target.value)} className="max-w-[120px]" />
        <Button onClick={add} disabled={loading}>إضافة</Button>
      </div>
      <ul className="divide-y">
        {initial.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{c.icon ?? "📚"}</span>
              <span className="font-medium">{c.name}</span>
              <span className="text-xs text-slate-500">({c.count} دورة)</span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>
              <Trash2 className="size-4 text-red-600" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
