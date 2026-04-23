import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  icon: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

async function guard() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(req: Request) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  const baseSlug = slugify(parsed.data.name) || "category";
  let slug = baseSlug; let i = 1;
  while (await prisma.category.findUnique({ where: { slug } })) slug = `${baseSlug}-${++i}`;
  const cat = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      icon: parsed.data.icon ?? null,
      description: parsed.data.description ?? null,
    },
  });
  return NextResponse.json(cat);
}
