import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  answers: z.record(z.string(), z.number()),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "غير مسجل" }, { status: 401 });
  const { id: quizId } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });
  if (!quiz) return NextResponse.json({ error: "اختبار غير موجود" }, { status: 404 });

  let correct = 0;
  for (const q of quiz.questions) {
    if (parsed.data.answers[q.id] === q.answer) correct++;
  }
  const score = Math.round((correct / Math.max(1, quiz.questions.length)) * 100);
  const passed = score >= quiz.passingScore;

  await prisma.quizAttempt.create({
    data: {
      userId: session.user.id,
      quizId,
      score,
      passed,
      answers: JSON.stringify(parsed.data.answers),
    },
  });

  return NextResponse.json({ score, passed });
}
