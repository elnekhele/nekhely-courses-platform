import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminCourseToggles } from "@/components/admin/admin-course-toggles";
import { formatPrice, LEVEL_LABELS } from "@/lib/utils";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      category: true, instructor: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">الدورات ({courses.length})</h1>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500 bg-slate-50">
              <tr>
                <th className="text-start py-3 px-4">العنوان</th>
                <th className="text-start py-3 px-4">المدرب</th>
                <th className="text-start py-3 px-4">القسم</th>
                <th className="text-start py-3 px-4">السعر</th>
                <th className="text-start py-3 px-4">طلاب</th>
                <th className="text-start py-3 px-4">الحالة</th>
                <th className="text-start py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {courses.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 px-4 font-medium max-w-xs">
                    <Link href={`/courses/${c.slug}`} className="hover:text-brand-700 line-clamp-1">
                      {c.title}
                    </Link>
                    <div className="text-xs text-slate-500">{LEVEL_LABELS[c.level]}</div>
                  </td>
                  <td className="py-2 px-4 text-slate-600">{c.instructor.name}</td>
                  <td className="py-2 px-4">{c.category.name}</td>
                  <td className="py-2 px-4">{formatPrice(c.price)}</td>
                  <td className="py-2 px-4">{c._count.enrollments}</td>
                  <td className="py-2 px-4">
                    <div className="flex flex-col gap-1">
                      <Badge variant={c.published ? "success" : "secondary"}>
                        {c.published ? "منشور" : "مسودة"}
                      </Badge>
                      {c.featured && <Badge>مميز</Badge>}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex gap-1">
                      <AdminCourseToggles
                        courseId={c.id}
                        published={c.published}
                        featured={c.featured}
                      />
                      <Link href={`/instructor/courses/${c.id}`}>
                        <Button size="sm" variant="outline">تحرير</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
