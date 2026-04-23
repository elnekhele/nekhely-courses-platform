import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ title: z.string().min(1) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "غير مسجل" }, { status: 401 });
  const { id: courseId } = await params;
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const count = await prisma.section.count({ where: { courseId } });
  const section = await prisma.section.create({
    data: { courseId, title: parsed.data.title, order: count },
  });
  return NextResponse.json(section);
}
