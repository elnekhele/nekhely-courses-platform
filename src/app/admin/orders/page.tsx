import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { course: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">الطلبات</h1>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500 bg-slate-50">
              <tr>
                <th className="text-start py-3 px-4">العميل</th>
                <th className="text-start py-3 px-4">المحتوى</th>
                <th className="text-start py-3 px-4">التاريخ</th>
                <th className="text-start py-3 px-4">الحالة</th>
                <th className="text-start py-3 px-4">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="py-2 px-4 font-medium">{o.user.name}</td>
                  <td className="py-2 px-4 text-slate-600 max-w-xs line-clamp-2">
                    {o.items.map((i) => i.course.title).join(", ")}
                  </td>
                  <td className="py-2 px-4 text-xs text-slate-500">{formatDate(o.createdAt)}</td>
                  <td className="py-2 px-4">
                    <Badge
                      variant={
                        o.status === "PAID" ? "success" : o.status === "PENDING" ? "warning" : "destructive"
                      }
                    >
                      {ORDER_STATUS_LABELS[o.status]}
                    </Badge>
                  </td>
                  <td className="py-2 px-4 font-semibold text-brand-700">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
