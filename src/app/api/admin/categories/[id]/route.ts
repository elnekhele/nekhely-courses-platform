import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  const { id } = await params;
  const count = await prisma.course.count({ where: { categoryId: id } });
  if (count > 0)
    return NextResponse.json({ error: "يحتوي على دورات" }, { status: 400 });
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
