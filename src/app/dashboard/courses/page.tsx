import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default async function MyCoursesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">دوراتي</h1>
      {enrollments.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-slate-500">لا توجد دورات بعد.</CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {enrollments.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-5 space-y-3">
                <Link href={`/learn/${e.course.id}`} className="font-semibold line-clamp-2 hover:text-brand-700">
                  {e.course.title}
                </Link>
                <div className="flex items-center gap-3">
                  <Progress value={e.progress} className="flex-1" />
                  <span className="text-xs text-slate-500">{Math.round(e.progress)}%</span>
                </div>
                <Link href={`/learn/${e.course.id}`}>
                  <Button size="sm" variant="outline">متابعة</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
