import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function InstructorHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const [courseCount, enrollmentCount, orderItems] = await Promise.all([
    prisma.course.count({ where: { instructorId: session.user.id } }),
    prisma.enrollment.count({
      where: { course: { instructorId: session.user.id } },
    }),
    prisma.orderItem.findMany({
      where: {
        course: { instructorId: session.user.id },
        order: { status: "PAID" },
      },
      select: { price: true },
    }),
  ]);
  const revenue = orderItems.reduce((a, i) => a + i.price, 0);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">لوحة المدرب</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <Stat icon={<BookOpen className="size-5" />} label="دوراتي" value={courseCount} />
        <Stat icon={<Users className="size-5" />} label="الطلاب" value={enrollmentCount} />
        <Stat icon={<DollarSign className="size-5" />} label="الإيرادات" value={formatPrice(revenue)} />
      </div>
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
