import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { course: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">فواتيري</h1>
      {orders.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-slate-500">لا توجد فواتير.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-slate-500">
                    {formatDate(o.createdAt)} — رقم {o.id.slice(-8)}
                  </div>
                  <Badge
                    variant={
                      o.status === "PAID"
                        ? "success"
                        : o.status === "PENDING"
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {ORDER_STATUS_LABELS[o.status]}
                  </Badge>
                </div>
                <ul className="text-sm text-slate-700 mb-3 space-y-1">
                  {o.items.map((i) => (
                    <li key={i.id} className="flex justify-between">
                      <span className="line-clamp-1">{i.course.title}</span>
                      <span>{formatPrice(i.price)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span>الإجمالي</span>
                  <span className="font-bold text-brand-700">{formatPrice(o.total)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
