import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  title: z.string().min(3).optional(),
  subtitle: z.string().nullable().optional(),
  description: z.string().min(10).optional(),
  price: z.number().min(0).optional(),
  discountPrice: z.number().min(0).nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL"]).optional(),
  categoryId: z.string().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  requirements: z.string().nullable().optional(),
  whatYouWillLearn: z.string().nullable().optional(),
});

async function ownerGuard(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "غير مسجل", status: 401 as const };
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return { error: "غير موجود", status: 404 as const };
  if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "غير مسموح", status: 403 as const };
  }
  return { session, course };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await ownerGuard(id);
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const isAdmin = guard.session.user.role === "ADMIN";

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const data = { ...parsed.data };
  if (!isAdmin) delete data.featured;

  const course = await prisma.course.update({ where: { id }, data });
  return NextResponse.json({ ok: true, course });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await ownerGuard(id);
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
