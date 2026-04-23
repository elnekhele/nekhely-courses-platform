"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";
import { toast } from "@/lib/toast";

export function LessonFooterClient({
  courseId,
  lessonId,
  nextHref,
}: {
  courseId: string;
  lessonId: string;
  nextHref: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markComplete() {
    setLoading(true);
    const res = await fetch(`/api/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, lessonId }),
    });
    setLoading(false);
    if (!res.ok) {
      toast({ title: "فشل الحفظ", tone: "error" });
      return;
    }
    const data = (await res.json()) as { progress: number; completed: boolean };
    if (data.completed) {
      toast({ title: "🎉 تهانينا! أتممت الدورة", tone: "success" });
    } else {
      toast({ title: "تم الحفظ", description: `التقدم: ${Math.round(data.progress)}%`, tone: "success" });
    }
    if (nextHref) router.push(nextHref);
    else router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={markComplete} disabled={loading} className="gap-2">
        <Check className="size-4" />
        {nextHref ? "أكمل وانتقل للدرس التالي" : "إتمام الدورة"}
      </Button>
      {nextHref && (
        <Button variant="outline" onClick={() => router.push(nextHref)} className="gap-2">
          تخطي
          <ArrowLeft className="size-4" />
        </Button>
      )}
    </div>
  );
}
