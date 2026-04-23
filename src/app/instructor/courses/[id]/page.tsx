import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourseEditor } from "@/components/instructor/course-editor";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) notFound();
  if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/instructor/courses");
  }
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <CourseEditor
      course={{
        id: course.id,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        price: course.price,
        discountPrice: course.discountPrice,
        level: course.level,
        thumbnail: course.thumbnail,
        categoryId: course.categoryId,
        published: course.published,
        featured: course.featured,
        requirements: course.requirements,
        whatYouWillLearn: course.whatYouWillLearn,
        sections: course.sections.map((s) => ({
          id: s.id,
          title: s.title,
          order: s.order,
          lessons: s.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            videoUrl: l.videoUrl,
            durationMinutes: l.durationMinutes,
            order: l.order,
            isPreview: l.isPreview,
          })),
        })),
      }}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      isAdmin={session.user.role === "ADMIN"}
    />
  );
}
