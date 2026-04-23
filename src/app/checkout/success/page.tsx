import Link from "next/link";
import { getServerSession } from "next-auth";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const session = await getServerSession(authOptions);
  const order =
    orderId && session?.user?.id
      ? await prisma.order.findFirst({
          where: { id: orderId, userId: session.user.id },
          include: { items: { include: { course: true } } },
        })
      : null;

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <Card>
        <CardContent className="py-12 text-center">
          <div className="size-16 rounded-full bg-emerald-100 grid place-items-center mx-auto mb-4">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">تم الدفع بنجاح!</h1>
          <p className="text-slate-500 mb-6">
            شكراً على شرائك. يمكنك الآن الوصول لدوراتك من لوحة التحكم.
          </p>

          {order && (
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-start mb-6">
              <div className="text-xs text-slate-500 mb-2">رقم الطلب: {order.id}</div>
              <ul className="space-y-1">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span className="line-clamp-1">{item.course.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Link href="/dashboard"><Button>لوحة التحكم</Button></Link>
            <Link href="/courses"><Button variant="outline">تابع التصفح</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
