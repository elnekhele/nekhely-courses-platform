import Link from "next/link";
import { Star, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDuration, LEVEL_LABELS } from "@/lib/utils";

export type CourseCardData = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  thumbnail?: string | null;
  price: number;
  discountPrice?: number | null;
  level: string;
  durationMinutes: number;
  category: { name: string; slug: string };
  instructor: { name: string };
  rating?: number;
  reviewCount?: number;
  enrollCount?: number;
};

export function CourseCard({ course }: { course: CourseCardData }) {
  const hasDiscount =
    course.discountPrice != null && course.discountPrice < course.price;
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-soft transition-shadow"
    >
      <div className="aspect-video bg-gradient-to-br from-brand-200 to-brand-400 relative overflow-hidden">
        {course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-white text-4xl font-display font-bold">
            {course.title.slice(0, 2)}
          </div>
        )}
        <div className="absolute top-3 start-3">
          <Badge variant="default">{LEVEL_LABELS[course.level] ?? course.level}</Badge>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-xs text-brand-700 font-medium mb-1">
          {course.category.name}
        </div>
        <h3 className="font-semibold text-slate-900 line-clamp-2 mb-1 group-hover:text-brand-700">
          {course.title}
        </h3>
        <div className="text-xs text-slate-500 mb-3">{course.instructor.name}</div>
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          {course.rating != null && (
            <span className="flex items-center gap-1 text-amber-600">
              <Star className="size-3.5 fill-amber-500 stroke-amber-500" />
              {course.rating.toFixed(1)}
              {course.reviewCount != null && (
                <span className="text-slate-400">({course.reviewCount})</span>
              )}
            </span>
          )}
          {course.enrollCount != null && (
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {course.enrollCount}
            </span>
          )}
          {course.durationMinutes > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatDuration(course.durationMinutes)}
            </span>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {hasDiscount ? (
              <>
                <span className="font-bold text-brand-700">
                  {formatPrice(course.discountPrice ?? 0)}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(course.price)}
                </span>
              </>
            ) : course.price === 0 ? (
              <span className="font-bold text-emerald-600">مجاني</span>
            ) : (
              <span className="font-bold text-brand-700">
                {formatPrice(course.price)}
              </span>
            )}
          </div>
          <span className="text-xs text-brand-700 font-medium">تفاصيل ←</span>
        </div>
      </div>
    </Link>
  );
}
