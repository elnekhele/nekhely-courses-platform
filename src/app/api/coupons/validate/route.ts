import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({
    where: { code: parsed.data.code.toUpperCase() },
  });

  if (!coupon || !coupon.active)
    return NextResponse.json({ error: "كود غير موجود" }, { status: 404 });
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return NextResponse.json({ error: "انتهت صلاحية الكود" }, { status: 400 });
  if (coupon.maxUses != null && coupon.used >= coupon.maxUses)
    return NextResponse.json({ error: "تم استنفاد الكود" }, { status: 400 });

  const discount = Math.round((parsed.data.subtotal * coupon.percentOff) / 100);
  return NextResponse.json({ discount, code: coupon.code });
}
