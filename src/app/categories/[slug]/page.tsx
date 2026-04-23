import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPublishedCourses } from "@/lib/queries";
import { CourseCard } from "@/components/course/course-card";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();
  const courses = await getPublishedCourses({ categorySlug: slug });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-slate-500 mt-1">{category.description}</p>
        )}
      </div>
      {courses.length === 0 ? (
        <div className="py-16 text-center text-slate-500">لا توجد دورات في هذا القسم حالياً.</div>
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
