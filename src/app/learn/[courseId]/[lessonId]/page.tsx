import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LessonPlayer } from "@/components/learn/lesson-player";
import { CurriculumSidebar } from "@/components/learn/curriculum-sidebar";
import { LessonFooterClient } from "@/components/learn/lesson-footer-client";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (!enrollment) redirect(`/courses`);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      sections: {
        include: { lessons: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      quizzes: { select: { id: true, title: true } },
    },
  });
  if (!course) notFound();

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, section: { courseId } },
  });
  if (!lesson) notFound();

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id, lesson: { section: { courseId } } },
    select: { lessonId: true, completed: true },
  });
  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));

  const allLessons = course.sections.flatMap((s) => s.lessons);
  const currentIdx = allLessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = currentIdx >= 0 ? allLessons[currentIdx + 1] : null;

  return (
    <div className="grid md:grid-cols-[1fr_320px] min-h-[80vh]">
      <div className="p-6 md:p-10">
        <div className="mb-4">
          <Link href={`/courses/${course.slug}`} className="text-sm text-brand-700">
            ← {course.title}
          </Link>
        </div>
        <h1 className="font-display text-2xl font-bold mb-4">{lesson.title}</h1>
        <LessonPlayer
          lesson={{
            id: lesson.id,
            videoProvider: lesson.videoProvider,
            videoUrl: lesson.videoUrl,
            videoUid: lesson.videoUid,
            content: lesson.content,
          }}
        />
        <LessonFooter
          courseId={courseId}
          lessonId={lesson.id}
          nextHref={nextLesson ? `/learn/${courseId}/${nextLesson.id}` : null}
        />
      </div>
      <CurriculumSidebar
        courseId={courseId}
        currentLessonId={lesson.id}
        completedIds={Array.from(completedIds)}
        sections={course.sections.map((s) => ({
          id: s.id,
          title: s.title,
          lessons: s.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            durationMinutes: l.durationMinutes,
          })),
        }))}
        quizzes={course.quizzes}
      />
    </div>
  );
}

function LessonFooter({
  courseId,
  lessonId,
  nextHref,
}: {
  courseId: string;
  lessonId: string;
  nextHref: string | null;
}) {
  return (
    <div className="mt-6 border-t pt-4">
      <LessonFooterClient courseId={courseId} lessonId={lessonId} nextHref={nextHref} />
    </div>
  );
}
