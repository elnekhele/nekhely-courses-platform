import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(1),
  videoUrl: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  durationMinutes: z.number().int().min(0).default(0),
  isPreview: z.boolean().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "غير مسجل" }, { status: 401 });
  const { id: sectionId } = await params;
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { course: true },
  });
  if (!section) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (section.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const count = await prisma.lesson.count({ where: { sectionId } });
  const lesson = await prisma.lesson.create({
    data: {
      sectionId,
      title: parsed.data.title,
      videoUrl: parsed.data.videoUrl ?? null,
      content: parsed.data.content ?? null,
      durationMinutes: parsed.data.durationMinutes,
      isPreview: parsed.data.isPreview ?? false,
      order: count,
    },
  });

  // recompute course duration
  const agg = await prisma.lesson.aggregate({
    where: { section: { courseId: section.courseId } },
    _sum: { durationMinutes: true },
  });
  await prisma.course.update({
    where: { id: section.courseId },
    data: { durationMinutes: agg._sum.durationMinutes ?? 0 },
  });

  return NextResponse.json(lesson);
}
