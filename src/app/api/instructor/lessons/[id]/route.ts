import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "غير مسجل" }, { status: 401 });
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { section: { include: { course: true } } },
  });
  if (!lesson) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (
    lesson.section.course.instructorId !== session.user.id &&
    session.user.role !== "ADMIN"
  ) {
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }
  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
