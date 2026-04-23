"use client";

import Link from "next/link";
import { CheckCircle2, Circle, PlayCircle, HelpCircle } from "lucide-react";
import { formatDuration } from "@/lib/utils";

type SectionData = {
  id: string;
  title: string;
  lessons: { id: string; title: string; durationMinutes: number }[];
};

export function CurriculumSidebar({
  courseId,
  currentLessonId,
  completedIds,
  sections,
  quizzes,
}: {
  courseId: string;
  currentLessonId: string;
  completedIds: string[];
  sections: SectionData[];
  quizzes: { id: string; title: string }[];
}) {
  const completedSet = new Set(completedIds);
  return (
    <aside className="border-s border-slate-200 bg-white overflow-y-auto">
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        <div className="font-semibold text-slate-900">محتوى الدورة</div>
        <div className="text-xs text-slate-500 mt-1">
          {completedIds.length} / {sections.reduce((a, s) => a + s.lessons.length, 0)} مكتمل
        </div>
      </div>
      <div className="p-2 space-y-3">
        {sections.map((section) => (
          <div key={section.id}>
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
              {section.title}
            </div>
            <ul className="space-y-0.5">
              {section.lessons.map((lesson) => {
                const active = lesson.id === currentLessonId;
                const done = completedSet.has(lesson.id);
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/learn/${courseId}/${lesson.id}`}
                      className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm ${active ? "bg-brand-50 text-brand-800" : "hover:bg-slate-50 text-slate-700"}`}
                    >
                      {done ? (
                        <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : active ? (
                        <PlayCircle className="size-4 text-brand-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="size-4 text-slate-300 shrink-0 mt-0.5" />
                      )}
                      <span className="flex-1 line-clamp-2">{lesson.title}</span>
                      {lesson.durationMinutes > 0 && (
                        <span className="text-xs text-slate-400">
                          {formatDuration(lesson.durationMinutes)}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {quizzes.length > 0 && (
          <div>
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
              الاختبارات
            </div>
            <ul className="space-y-0.5">
              {quizzes.map((q) => (
                <li key={q.id}>
                  <Link
                    href={`/learn/${courseId}/quiz/${q.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-slate-50 text-slate-700"
                  >
                    <HelpCircle className="size-4 text-amber-600" />
                    {q.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
