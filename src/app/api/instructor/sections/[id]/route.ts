import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ownerGuard(sectionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "غير مسجل", status: 401 as const };
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { course: true },
  });
  if (!section) return { error: "غير موجود", status: 404 as const };
  if (section.course.instructorId !== session.user.id && session.user.role !== "ADMIN")
    return { error: "غير مسموح", status: 403 as const };
  return { section };
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await ownerGuard(id);
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  await prisma.section.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
