import { prisma } from "@/lib/prisma";
import { NewCourseForm } from "@/components/instructor/new-course-form";

export default async function NewCoursePage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold mb-6">إنشاء دورة جديدة</h1>
      <NewCourseForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
