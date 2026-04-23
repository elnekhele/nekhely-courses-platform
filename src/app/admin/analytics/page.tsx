import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  const [topCourses, perCategory, last30Orders] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
      include: {
        _count: { select: { enrollments: true } },
        category: true,
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 10,
    }),
    prisma.category.findMany({
      include: { _count: { select: { courses: true } } },
    }),
    prisma.order.findMany({
      where: {
        status: "PAID",
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { total: true, createdAt: true },
    }),
  ]);

  const dailyRevenue: Record<string, number> = {};
  for (const o of last30Orders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    dailyRevenue[day] = (dailyRevenue[day] ?? 0) + o.total;
  }
  const days = Object.keys(dailyRevenue).sort();
  const maxRev = Math.max(1, ...Object.values(dailyRevenue));

  const total30 = last30Orders.reduce((a, o) => a + o.total, 0);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">التحليلات</h1>

      <Card>
        <CardHeader>
          <CardTitle>الإيرادات خلال آخر 30 يوماً — الإجمالي: {formatPrice(total30)}</CardTitle>
        </CardHeader>
        <CardContent>
          {days.length === 0 ? (
            <p className="text-sm text-slate-500">لا توجد بيانات.</p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {days.map((d) => (
                <div key={d} className="flex-1 flex flex-col items-center gap-1" title={`${d} · ${formatPrice(dailyRevenue[d])}`}>
                  <div
                    className="w-full bg-brand-500 rounded-t"
                    style={{ height: `${(dailyRevenue[d] / maxRev) * 100}%` }}
                  />
                  <div className="text-[9px] text-slate-400 rotate-45 origin-top-left h-4">
                    {d.slice(5)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>أعلى الدورات مبيعاً</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              {topCourses.map((c, i) => (
                <li key={c.id} className="flex items-center justify-between">
                  <span className="line-clamp-1">
                    <span className="text-slate-400 me-2">{i + 1}.</span>
                    {c.title}
                  </span>
                  <span className="font-semibold text-brand-700">{c._count.enrollments}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>الدورات لكل قسم</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              {perCategory.map((c) => (
                <li key={c.id} className="flex items-center justify-between">
                  <span>{c.icon} {c.name}</span>
                  <span className="font-semibold">{c._count.courses}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
