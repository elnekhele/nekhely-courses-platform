import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  courseIds: z.array(z.string()).min(1),
  couponCode: z.string().nullable().optional(),
});

/**
 * Simplified checkout used by the demo UI. In production this would:
 *   - tokenize the card via Moyasar.js on the client
 *   - POST the token + amount here
 *   - call createPayment(...) in src/lib/moyasar.ts
 *   - wait for the webhook to flip the order to PAID
 *
 * For development we create the order, mark it PAID immediately, and grant
 * enrollments so the rest of the flow (learn pages, certificates) is usable
 * without real payment credentials.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "غير مسجل" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const { courseIds, couponCode } = parsed.data;

  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds }, published: true },
  });
  if (courses.length !== courseIds.length)
    return NextResponse.json({ error: "دورة غير موجودة" }, { status: 400 });

  // Skip already-enrolled courses
  const existing = await prisma.enrollment.findMany({
    where: { userId: session.user.id, courseId: { in: courseIds } },
    select: { courseId: true },
  });
  const existingSet = new Set(existing.map((e) => e.courseId));
  const toBuy = courses.filter((c) => !existingSet.has(c.id));
  if (toBuy.length === 0)
    return NextResponse.json({ error: "أنت مشترك بالفعل في هذه الدورات" }, { status: 400 });

  const subtotal = toBuy.reduce(
    (acc, c) => acc + (c.discountPrice ?? c.price),
    0,
  );

  let discount = 0;
  let coupon = null as Awaited<ReturnType<typeof prisma.coupon.findUnique>>;
  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.active && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
      discount = Math.round((subtotal * coupon.percentOff) / 100);
    }
  }
  const total = Math.max(0, subtotal - discount);

  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        userId: session.user.id,
        subtotal,
        discount,
        total,
        couponCode: coupon?.code,
        status: "PAID",
        paymentRef: "dev-simulated-" + Date.now(),
        items: {
          create: toBuy.map((c) => ({
            courseId: c.id,
            price: c.discountPrice ?? c.price,
          })),
        },
      },
    });

    for (const c of toBuy) {
      await tx.enrollment.create({
        data: { userId: session.user.id, courseId: c.id },
      });
    }
    if (coupon) {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { used: { increment: 1 } },
      });
    }
    return o;
  });

  return NextResponse.json({ orderId: order.id });
}
