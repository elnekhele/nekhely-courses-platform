import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "غير مسجل" }, { status: 401 });

  const { id: courseId } = await params;
  const json = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (!enrollment)
    return NextResponse.json({ error: "يجب شراء الدورة أولاً" }, { status: 403 });

  const review = await prisma.review.upsert({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    create: {
      userId: session.user.id,
      courseId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
    update: {
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
    include: { user: { select: { name: true, image: true } } },
  });

  return NextResponse.json({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    user: review.user,
  });
}
