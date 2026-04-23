import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  role: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  await prisma.user.update({ where: { id }, data: { role: parsed.data.role } });
  return NextResponse.json({ ok: true });
}
