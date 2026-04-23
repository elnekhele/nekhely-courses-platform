import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json(
      { error: "هذا البريد مسجل بالفعل" },
      { status: 409 },
    );
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, password: hash, role: "STUDENT" },
    select: { id: true, email: true, name: true },
  });
  return NextResponse.json(user, { status: 201 });
}
