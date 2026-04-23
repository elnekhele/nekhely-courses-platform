import Link from "next/link";
import { getCategories, getPublishedCourses } from "@/lib/queries";
import { CourseCard } from "@/components/course/course-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LEVEL_LABELS } from "@/lib/utils";

type Params = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    level?: string;
    sort?: string;
  }>;
};

export default async function CoursesPage({ searchParams }: Params) {
  const sp = await searchParams;
  const [categories, courses] = await Promise.all([
    getCategories(),
    getPublishedCourses({
      search: sp.q,
      categorySlug: sp.category,
      level: sp.level,
      orderBy: sp.sort === "popular" ? "popular" : "new",
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          جميع الدورات
        </h1>
        <p className="text-slate-500">استعرض مكتبتنا المتنوعة من الدورات الاحترافية</p>
      </div>

      <form className="grid md:grid-cols-[2fr_1fr_1fr_auto] gap-3 mb-8" action="/courses">
        <Input name="q" defaultValue={sp.q} placeholder="ابحث عن دورة..." />
        <select name="category" defaultValue={sp.category ?? ""} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm">
          <option value="">كل الأقسام</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select name="level" defaultValue={sp.level ?? ""} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm">
          <option value="">كل المستويات</option>
          {Object.entries(LEVEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <Button type="submit">بحث</Button>
      </form>

      {/* Sort */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <span className="text-slate-500">ترتيب:</span>
        <Link
          href={{ pathname: "/courses", query: { ...sp, sort: "new" } }}
          className={`px-3 py-1 rounded-full border ${sp.sort !== "popular" ? "bg-brand-50 border-brand-200 text-brand-700" : "border-slate-200 text-slate-600"}`}
        >
          الأحدث
        </Link>
        <Link
          href={{ pathname: "/courses", query: { ...sp, sort: "popular" } }}
          className={`px-3 py-1 rounded-full border ${sp.sort === "popular" ? "bg-brand-50 border-brand-200 text-brand-700" : "border-slate-200 text-slate-600"}`}
        >
          الأكثر شعبية
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          لم يتم العثور على دورات مطابقة.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
