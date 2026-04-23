import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuizRunner } from "@/components/learn/quiz-runner";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>;
}) {
  const { courseId, quizId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (!enrollment) redirect(`/courses`);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz || quiz.courseId !== courseId) notFound();

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="font-display text-3xl font-bold mb-2">{quiz.title}</h1>
      {quiz.description && <p className="text-slate-500 mb-6">{quiz.description}</p>}
      <QuizRunner
        quizId={quiz.id}
        passingScore={quiz.passingScore}
        questions={quiz.questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: JSON.parse(q.options) as string[],
        }))}
      />
    </div>
  );
}
