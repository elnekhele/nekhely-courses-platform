"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

export function AdminCourseToggles({
  courseId,
  published,
  featured,
}: {
  courseId: string;
  published: boolean;
  featured: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle(field: "published" | "featured", value: boolean) {
    setLoading(true);
    const res = await fetch(`/api/instructor/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setLoading(false);
    if (!res.ok) {
      toast({ title: "فشل التحديث", tone: "error" });
      return;
    }
    router.refresh();
  }

  return (
    <>
      <Button
        size="sm"
        variant={published ? "secondary" : "default"}
        disabled={loading}
        onClick={() => toggle("published", !published)}
      >
        {published ? "إلغاء النشر" : "نشر"}
      </Button>
      <Button
        size="sm"
        variant={featured ? "secondary" : "outline"}
        disabled={loading}
        onClick={() => toggle("featured", !featured)}
      >
        {featured ? "إلغاء التمييز" : "تمييز"}
      </Button>
    </>
  );
}
