import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  code: z.string().min(2).max(40),
  percentOff: z.number().int().min(1).max(100),
  maxUses: z.number().int().min(1).nullable().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  const exists = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
  if (exists) return NextResponse.json({ error: "الكود مستخدم" }, { status: 409 });
  const c = await prisma.coupon.create({
    data: {
      code: parsed.data.code,
      percentOff: parsed.data.percentOff,
      maxUses: parsed.data.maxUses ?? null,
    },
  });
  return NextResponse.json(c);
}
