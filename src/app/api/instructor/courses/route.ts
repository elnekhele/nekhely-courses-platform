import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(3),
  subtitle: z.string().optional().nullable(),
  description: z.string().min(10),
  price: z.number().min(0),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL"]),
  categoryId: z.string(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "غير مسجل" }, { status: 401 });
  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const baseSlug = slugify(parsed.data.title) || "course";
  let slug = baseSlug;
  let i = 1;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++i}`;
  }

  const course = await prisma.course.create({
    data: {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle ?? null,
      description: parsed.data.description,
      price: parsed.data.price,
      level: parsed.data.level,
      categoryId: parsed.data.categoryId,
      instructorId: session.user.id,
      slug,
      published: false,
    },
  });
  return NextResponse.json({ id: course.id });
}
