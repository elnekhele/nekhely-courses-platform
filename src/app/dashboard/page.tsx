import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, TrendingUp } from "lucide-react";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const [enrollments, certCount] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: { course: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.certificate.count({ where: { userId: session.user.id } }),
  ]);

  const avgProgress =
    enrollments.length > 0
      ? enrollments.reduce((a, e) => a + e.progress, 0) / enrollments.length
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">
          مرحباً، {session.user.name}!
        </h1>
        <p className="text-slate-500">تابع تقدمك في التعلم من هنا.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={<BookOpen className="size-5" />} label="دوراتي" value={enrollments.length} />
        <StatCard icon={<Award className="size-5" />} label="شهاداتي" value={certCount} />
        <StatCard icon={<TrendingUp className="size-5" />} label="متوسط التقدم" value={`${Math.round(avgProgress)}%`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>آخر الدورات</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              لم تشترك في أي دورة بعد.{" "}
              <Link href="/courses" className="text-brand-700 font-medium">ابدأ الآن</Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {enrollments.map((e) => (
                <li key={e.id} className="flex items-center gap-4">
                  <div className="size-14 bg-brand-100 rounded-lg grid place-items-center text-brand-700 font-bold shrink-0">
                    {e.course.title.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/learn/${e.course.id}`}
                      className="font-medium hover:text-brand-700 line-clamp-1"
                    >
                      {e.course.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={e.progress} className="flex-1" />
                      <span className="text-xs text-slate-500 w-10 text-end">
                        {Math.round(e.progress)}%
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="size-10 rounded-lg bg-brand-100 text-brand-700 grid place-items-center">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
