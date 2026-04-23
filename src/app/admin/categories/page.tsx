import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { courses: true } } },
  });
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">الأقسام</h1>
      <Card>
        <CardContent className="p-5">
          <CategoryManager
            initial={categories.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              icon: c.icon,
              count: c._count.courses,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
