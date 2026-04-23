import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  courseId: z.string(),
  lessonId: z.string(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "غير مسجل" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  const { courseId, lessonId } = parsed.data;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (!enrollment) return NextResponse.json({ error: "ليس لديك اشتراك" }, { status: 403 });

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, section: { courseId } },
    select: { id: true },
  });
  if (!lesson)
    return NextResponse.json({ error: "الدرس غير موجود في هذه الدورة" }, { status: 400 });

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    create: {
      userId: session.user.id,
      lessonId,
      completed: true,
      completedAt: new Date(),
    },
    update: { completed: true, completedAt: new Date() },
  });

  // Recompute overall course progress
  const allLessons = await prisma.lesson.findMany({
    where: { section: { courseId } },
    select: { id: true },
  });
  const done = await prisma.lessonProgress.count({
    where: {
      userId: session.user.id,
      completed: true,
      lesson: { section: { courseId } },
    },
  });
  const progress = allLessons.length > 0 ? (done / allLessons.length) * 100 : 0;
  const completed = progress >= 100;

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      progress,
      completedAt: completed ? new Date() : null,
    },
  });

  // Auto-issue certificate on completion
  if (completed) {
    await prisma.certificate.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      create: {
        userId: session.user.id,
        courseId,
        code: `NEK-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1e4)}`,
      },
      update: {},
    });
  }

  return NextResponse.json({ progress, completed });
}
