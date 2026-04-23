import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, ShoppingBag, DollarSign } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminHome() {
  const [users, courses, orders, revenueAgg, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "PAID" } }),
    prisma.order.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: true, items: { include: { course: true } } },
    }),
  ]);
  const revenue = revenueAgg._sum.total ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">لوحة المشرف</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<Users className="size-5" />} label="المستخدمون" value={users} />
        <Stat icon={<BookOpen className="size-5" />} label="الدورات" value={courses} />
        <Stat icon={<ShoppingBag className="size-5" />} label="الطلبات" value={orders} />
        <Stat icon={<DollarSign className="size-5" />} label="الإيرادات" value={formatPrice(revenue)} />
      </div>

      <Card>
        <CardHeader><CardTitle>آخر الطلبات</CardTitle></CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500">لا توجد طلبات.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-start">
                    <th className="text-start py-2">العميل</th>
                    <th className="text-start py-2">المحتوى</th>
                    <th className="text-start py-2">التاريخ</th>
                    <th className="text-start py-2">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-2">{o.user.name}</td>
                      <td className="py-2">
                        {o.items.map((i) => i.course.title).join(", ")}
                      </td>
                      <td className="py-2 text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                      <td className="py-2 font-semibold text-brand-700">{formatPrice(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="size-10 rounded-lg bg-brand-100 text-brand-700 grid place-items-center">{icon}</div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
