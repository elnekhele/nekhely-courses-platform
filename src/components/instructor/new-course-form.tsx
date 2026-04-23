"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

export function NewCourseForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/instructor/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        subtitle: fd.get("subtitle"),
        description: fd.get("description"),
        price: Number(fd.get("price") || 0),
        level: fd.get("level"),
        categoryId: fd.get("categoryId"),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      toast({ title: "فشل الإنشاء", description: data.error, tone: "error" });
      return;
    }
    const data = (await res.json()) as { id: string };
    toast({ title: "تم إنشاء الدورة", tone: "success" });
    router.push(`/instructor/courses/${data.id}`);
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>عنوان الدورة</Label>
            <Input name="title" required minLength={3} />
          </div>
          <div>
            <Label>عنوان فرعي</Label>
            <Input name="subtitle" />
          </div>
          <div>
            <Label>الوصف</Label>
            <Textarea name="description" required rows={5} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>السعر (ر.س)</Label>
              <Input name="price" type="number" min="0" defaultValue="0" />
            </div>
            <div>
              <Label>المستوى</Label>
              <select name="level" defaultValue="BEGINNER" className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm">
                <option value="BEGINNER">مبتدئ</option>
                <option value="INTERMEDIATE">متوسط</option>
                <option value="ADVANCED">متقدم</option>
                <option value="ALL">كل المستويات</option>
              </select>
            </div>
          </div>
          <div>
            <Label>القسم</Label>
            <select name="categoryId" required className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm">
              <option value="">اختر قسماً</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "جارٍ الإنشاء..." : "إنشاء الدورة"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
