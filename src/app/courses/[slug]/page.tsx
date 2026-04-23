import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  PlayCircle,
  Users,
  Award,
  BookOpen,
  Star,
  Check,
  Lock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDuration, LEVEL_LABELS } from "@/lib/utils";
import { AddToCartButton } from "@/components/course/add-to-cart-button";
import { ReviewsSection } from "@/components/course/reviews-section";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructor: { select: { id: true, name: true, bio: true, image: true } },
      sections: { include: { lessons: true }, orderBy: { order: "asc" } },
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { enrollments: true, reviews: true } },
    },
  });
  if (!course || !course.published) notFound();

  const session = await getServerSession(authOptions);
  const enrollment = session?.user
    ? await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId: session.user.id, courseId: course.id },
        },
      })
    : null;

  const ratingSum = course.reviews.reduce((a, r) => a + r.rating, 0);
  const rating = course.reviews.length > 0 ? ratingSum / course.reviews.length : 0;
  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);

  const hasDiscount =
    course.discountPrice != null && course.discountPrice < course.price;

  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Link
              href={`/categories/${course.category.slug}`}
              className="text-sm text-brand-300 hover:text-brand-200"
            >
              {course.category.name}
            </Link>
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-3">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="text-slate-300 text-lg mb-4">{course.subtitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 stroke-amber-400" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                  <span className="text-slate-400">({course._count.reviews} تقييم)</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-slate-300">
                <Users className="size-4" />
                {course._count.enrollments} طالب
              </span>
              <Badge variant="default">{LEVEL_LABELS[course.level]}</Badge>
            </div>
            <div className="mt-4 text-sm text-slate-300">
              المدرب: <span className="text-white font-medium">{course.instructor.name}</span>
            </div>
          </div>

          {/* Side card */}
          <div className="md:row-span-2">
            <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-soft sticky top-24">
              <div className="aspect-video bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center text-white">
                {course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <PlayCircle className="size-16" />
                )}
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-baseline gap-3">
                  {course.price === 0 ? (
                    <span className="text-2xl font-bold text-emerald-600">مجاني</span>
                  ) : hasDiscount ? (
                    <>
                      <span className="text-2xl font-bold text-brand-700">
                        {formatPrice(course.discountPrice ?? 0)}
                      </span>
                      <span className="text-slate-400 line-through">
                        {formatPrice(course.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-brand-700">
                      {formatPrice(course.price)}
                    </span>
                  )}
                </div>

                {enrollment ? (
                  <Link href={`/learn/${course.id}`} className="block">
                    <Button className="w-full" size="lg">
                      متابعة التعلم
                    </Button>
                  </Link>
                ) : (
                  <AddToCartButton
                    course={{
                      courseId: course.id,
                      slug: course.slug,
                      title: course.title,
                      thumbnail: course.thumbnail,
                      price: course.price,
                      discountPrice: course.discountPrice,
                    }}
                  />
                )}

                <ul className="space-y-2 text-sm text-slate-600 pt-2 border-t">
                  <li className="flex items-center gap-2">
                    <BookOpen className="size-4 text-brand-600" />
                    {totalLessons} درس
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="size-4 text-brand-600" />
                    {formatDuration(course.durationMinutes)}
                  </li>
                  <li className="flex items-center gap-2">
                    <Award className="size-4 text-brand-600" />
                    شهادة إتمام معتمدة
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="size-4 text-brand-600" />
                    وصول مدى الحياة
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8 pt-4">
            {course.whatYouWillLearn && (
              <div className="bg-white rounded-2xl p-6 text-slate-900">
                <h2 className="font-display text-xl font-bold mb-4">ماذا ستتعلم</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  {course.whatYouWillLearn.split("\n").map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 text-slate-900">
              <h2 className="font-display text-xl font-bold mb-4">وصف الدورة</h2>
              <div className="prose prose-slate max-w-none whitespace-pre-line text-sm leading-relaxed">
                {course.description}
              </div>
            </div>

            {course.requirements && (
              <div className="bg-white rounded-2xl p-6 text-slate-900">
                <h2 className="font-display text-xl font-bold mb-4">المتطلبات</h2>
                <ul className="space-y-1 text-sm list-disc ps-5">
                  {course.requirements.split("\n").map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 text-slate-900">
              <h2 className="font-display text-xl font-bold mb-4">محتوى الدورة</h2>
              <div className="space-y-3">
                {course.sections.map((section) => (
                  <div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 font-semibold text-slate-900 flex items-center justify-between">
                      <span>{section.title}</span>
                      <span className="text-xs text-slate-500">
                        {section.lessons.length} درس
                      </span>
                    </div>
                    <ul className="divide-y">
                      {section.lessons.map((lesson) => (
                        <li key={lesson.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {enrollment || lesson.isPreview ? (
                              <PlayCircle className="size-4 text-brand-600" />
                            ) : (
                              <Lock className="size-4 text-slate-400" />
                            )}
                            <span>{lesson.title}</span>
                            {lesson.isPreview && !enrollment && (
                              <Badge variant="secondary">معاينة</Badge>
                            )}
                          </div>
                          <span className="text-slate-400 text-xs">
                            {formatDuration(lesson.durationMinutes)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 text-slate-900">
              <h2 className="font-display text-xl font-bold mb-4">المدرب</h2>
              <div className="flex items-start gap-4">
                <div className="size-16 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-bold text-xl shrink-0">
                  {course.instructor.name.slice(0, 1)}
                </div>
                <div>
                  <div className="font-semibold">{course.instructor.name}</div>
                  {course.instructor.bio && (
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">
                      {course.instructor.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <ReviewsSection
              courseId={course.id}
              initial={course.reviews.map((r) => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt.toISOString(),
                user: r.user,
              }))}
              canReview={!!enrollment}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
