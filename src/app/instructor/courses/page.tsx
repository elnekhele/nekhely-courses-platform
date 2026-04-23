import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, LEVEL_LABELS } from "@/lib/utils";

export default async function InstructorCoursesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const courses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    include: { _count: { select: { enrollments: true } }, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">دوراتي</h1>
        <Link href="/instructor/courses/new">
          <Button>+ دورة جديدة</Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-slate-500">لم تقم بإنشاء أي دورة بعد.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="size-14 bg-brand-100 rounded-lg grid place-items-center text-brand-700 font-bold">
                  {c.title.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/instructor/courses/${c.id}`} className="font-semibold hover:text-brand-700 line-clamp-1">
                    {c.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span>{c.category.name}</span>
                    <span>•</span>
                    <span>{LEVEL_LABELS[c.level]}</span>
                    <span>•</span>
                    <span>{c._count.enrollments} طالب</span>
                  </div>
                </div>
                <div className="text-end">
                  <div className="font-bold text-brand-700">{formatPrice(c.price)}</div>
                  <Badge variant={c.published ? "success" : "secondary"}>
                    {c.published ? "منشور" : "مسودة"}
                  </Badge>
                </div>
                <Link href={`/instructor/courses/${c.id}`}>
                  <Button size="sm" variant="outline">تعديل</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
