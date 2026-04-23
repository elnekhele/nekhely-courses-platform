import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { CouponManager } from "@/components/admin/coupon-manager";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">الكوبونات</h1>
      <Card>
        <CardContent className="p-5">
          <CouponManager
            initial={coupons.map((c) => ({
              id: c.id,
              code: c.code,
              percentOff: c.percentOff,
              active: c.active,
              used: c.used,
              maxUses: c.maxUses,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
