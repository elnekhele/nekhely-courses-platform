import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Award,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course/course-card";
import { getCategories, getPublishedCourses } from "@/lib/queries";

export default async function HomePage() {
  const [categories, latestCourses, featuredCourses] = await Promise.all([
    getCategories(),
    getPublishedCourses({ take: 8, orderBy: "new" }),
    getPublishedCourses({ take: 4, featured: true }),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient">
        <div className="container mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur rounded-full px-3 py-1 text-xs font-medium text-brand-700 border border-brand-100 mb-5">
              <Sparkles className="size-3.5" />
              أكثر من ١٠٠ دورة احترافية باللغة العربية
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
              ابدأ رحلتك في التعلم
              <br />
              مع <span className="text-brand-600">أكاديمية نَخِيلة</span>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              كورسات عملية ودبلومات متخصصة في التصميم والموشن جرافيك وصناعة المحتوى
              والذكاء الاصطناعي — بيد نخبة من المدربين العرب، مع شهادات معتمدة.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/courses">
                <Button size="lg" className="gap-2">
                  استعرض الدورات
                  <ArrowLeft className="size-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  إنشاء حساب مجاني
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              <Stat icon={<Users className="size-4" />} value="+٢٥ ألف" label="طالب" />
              <Stat icon={<GraduationCap className="size-4" />} value="+١٢٠" label="دورة" />
              <Stat icon={<Award className="size-4" />} value="+٥٠" label="مدرب" />
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-tr from-brand-500 via-brand-400 to-amber-300 shadow-soft overflow-hidden relative">
              <div className="absolute inset-0 grid place-items-center text-white">
                <div className="text-center">
                  <GraduationCap className="size-20 mx-auto mb-3 drop-shadow" />
                  <div className="font-display text-2xl font-bold">تعلم بجودة عالية</div>
                  <div className="opacity-90 mt-1">من أي مكان في العالم</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <SectionHeading
          title="تصفح الأقسام"
          subtitle="اختر المجال الذي يناسب شغفك"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-300 hover:shadow-soft transition-all"
            >
              <div className="size-12 rounded-xl bg-brand-50 text-brand-700 grid place-items-center mb-4 group-hover:bg-brand-100 text-2xl">
                {cat.icon ?? "📚"}
              </div>
              <div className="font-semibold text-slate-900">{cat.name}</div>
              <div className="text-xs text-slate-500 mt-1">
                {cat._count.courses} دورة
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featuredCourses.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <SectionHeading
            title="الدورات المميزة"
            subtitle="اختيارات فريق الأكاديمية لك"
            action={
              <Link href="/courses" className="text-sm text-brand-700 font-medium">
                عرض الكل ←
              </Link>
            }
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      <section className="container mx-auto px-4 py-12">
        <SectionHeading
          title="أحدث الدورات"
          subtitle="أحدث الدورات المضافة حديثاً"
          action={
            <Link href="/courses" className="text-sm text-brand-700 font-medium">
              عرض الكل ←
            </Link>
          }
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {latestCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-3xl bg-gradient-to-l from-brand-600 to-brand-700 text-white p-10 md:p-14 text-center shadow-soft">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            جاهز للبدء؟
          </h2>
          <p className="opacity-90 mb-6 max-w-2xl mx-auto">
            أنشئ حسابك الآن واستمتع بالوصول لأكثر من ١٠٠ دورة عربية متخصصة،
            وابدأ رحلتك نحو الاحتراف اليوم.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/register">
              <Button size="lg" variant="secondary">إنشاء حساب</Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                تصفح الدورات
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 text-brand-700">{icon}<span className="text-xl font-bold">{value}</span></div>
      <span className="text-xs text-slate-600">{label}</span>
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900">
          {title}
        </h2>
        {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
