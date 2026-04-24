"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";
import { Plus, Trash2 } from "lucide-react";
import { LessonVideoUpload } from "@/components/instructor/lesson-video-upload";

type CourseData = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  price: number;
  discountPrice: number | null;
  level: string;
  thumbnail: string | null;
  categoryId: string;
  published: boolean;
  featured: boolean;
  requirements: string | null;
  whatYouWillLearn: string | null;
  sections: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      videoUrl: string | null;
      videoProvider: string;
      videoUid: string | null;
      durationMinutes: number;
      order: number;
      isPreview: boolean;
    }[];
  }[];
};

export function CourseEditor({
  course,
  categories,
  isAdmin,
}: {
  course: CourseData;
  categories: { id: string; name: string }[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function saveDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      title: fd.get("title"),
      subtitle: fd.get("subtitle"),
      description: fd.get("description"),
      price: Number(fd.get("price") || 0),
      discountPrice: fd.get("discountPrice") ? Number(fd.get("discountPrice")) : null,
      thumbnail: fd.get("thumbnail") || null,
      level: fd.get("level"),
      categoryId: fd.get("categoryId"),
      published: fd.get("published") === "on",
      requirements: fd.get("requirements"),
      whatYouWillLearn: fd.get("whatYouWillLearn"),
    };
    if (isAdmin) body.featured = fd.get("featured") === "on";
    const res = await fetch(`/api/instructor/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      toast({ title: "فشل الحفظ", tone: "error" });
      return;
    }
    toast({ title: "تم الحفظ", tone: "success" });
    router.refresh();
  }

  async function addSection() {
    const title = prompt("عنوان القسم");
    if (!title) return;
    const res = await fetch(`/api/instructor/courses/${course.id}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      toast({ title: "تم إضافة القسم", tone: "success" });
      router.refresh();
    } else toast({ title: "فشل الإضافة", tone: "error" });
  }

  async function addLesson(sectionId: string) {
    const title = prompt("عنوان الدرس");
    if (!title) return;
    const videoUrl = prompt("رابط الفيديو (اختياري، يقبل YouTube/Vimeo)") || null;
    const durationMinutes = Number(prompt("مدة الدرس بالدقائق") || 0);
    const res = await fetch(`/api/instructor/sections/${sectionId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, videoUrl, durationMinutes }),
    });
    if (res.ok) {
      toast({ title: "تم إضافة الدرس", tone: "success" });
      router.refresh();
    } else toast({ title: "فشل الإضافة", tone: "error" });
  }

  async function deleteSection(id: string) {
    if (!confirm("حذف القسم وكل دروسه؟")) return;
    const res = await fetch(`/api/instructor/sections/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }
  async function deleteLesson(id: string) {
    if (!confirm("حذف الدرس؟")) return;
    const res = await fetch(`/api/instructor/lessons/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{course.title}</h1>
        <Badge variant={course.published ? "success" : "secondary"}>
          {course.published ? "منشور" : "مسودة"}
        </Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>معلومات الدورة</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={saveDetails} className="space-y-4">
            <div><Label>عنوان الدورة</Label><Input name="title" defaultValue={course.title} required /></div>
            <div><Label>عنوان فرعي</Label><Input name="subtitle" defaultValue={course.subtitle ?? ""} /></div>
            <div><Label>الوصف</Label><Textarea name="description" defaultValue={course.description} rows={4} required /></div>
            <div><Label>رابط صورة الغلاف</Label><Input name="thumbnail" defaultValue={course.thumbnail ?? ""} dir="ltr" /></div>
            <div><Label>ماذا ستتعلم (سطر لكل بند)</Label><Textarea name="whatYouWillLearn" defaultValue={course.whatYouWillLearn ?? ""} rows={3} /></div>
            <div><Label>المتطلبات (سطر لكل بند)</Label><Textarea name="requirements" defaultValue={course.requirements ?? ""} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>السعر</Label><Input name="price" type="number" defaultValue={course.price} /></div>
              <div><Label>السعر بعد الخصم</Label><Input name="discountPrice" type="number" defaultValue={course.discountPrice ?? ""} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>المستوى</Label>
                <select name="level" defaultValue={course.level} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm">
                  <option value="BEGINNER">مبتدئ</option>
                  <option value="INTERMEDIATE">متوسط</option>
                  <option value="ADVANCED">متقدم</option>
                  <option value="ALL">كل المستويات</option>
                </select>
              </div>
              <div>
                <Label>القسم</Label>
                <select name="categoryId" defaultValue={course.categoryId} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={course.published} />منشور</label>
              {isAdmin && (
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={course.featured} />مميز</label>
              )}
            </div>
            <Button type="submit" disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>المحتوى</CardTitle>
          <Button size="sm" onClick={addSection} className="gap-1"><Plus className="size-4" />قسم جديد</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {course.sections.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">لا توجد أقسام بعد.</p>
          ) : (
            course.sections.map((s) => (
              <div key={s.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 flex items-center justify-between">
                  <div className="font-semibold">{s.title}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => addLesson(s.id)} className="gap-1">
                      <Plus className="size-3" />درس
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteSection(s.id)}>
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <ul className="divide-y">
                  {s.lessons.map((l) => (
                    <li key={l.id} className="px-4 py-2 text-sm flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate">{l.title}</span>
                        {l.videoProvider === "STREAM" ? (
                          <Badge variant="success">فيديو محمي</Badge>
                        ) : l.videoUrl ? (
                          <Badge variant="secondary">رابط خارجي</Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-500">{l.durationMinutes} د</span>
                        <LessonVideoUpload
                          lessonId={l.id}
                          lessonTitle={l.title}
                          currentProvider={l.videoProvider}
                        />
                        <Button size="sm" variant="ghost" onClick={() => deleteLesson(l.id)}>
                          <Trash2 className="size-3.5 text-red-600" />
                        </Button>
                      </div>
                    </li>
                  ))}
                  {s.lessons.length === 0 && (
                    <li className="px-4 py-3 text-xs text-slate-400">لا توجد دروس</li>
                  )}
                </ul>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
