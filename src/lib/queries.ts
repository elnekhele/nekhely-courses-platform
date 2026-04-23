import { prisma } from "./prisma";

/** Returns course card data enriched with instructor/category/ratings. */
export async function getPublishedCourses(opts?: {
  take?: number;
  featured?: boolean;
  categorySlug?: string;
  search?: string;
  level?: string;
  orderBy?: "new" | "popular";
}) {
  const courses = await prisma.course.findMany({
    where: {
      published: true,
      ...(opts?.featured ? { featured: true } : {}),
      ...(opts?.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
      ...(opts?.level ? { level: opts.level } : {}),
      ...(opts?.search
        ? {
            OR: [
              { title: { contains: opts.search } },
              { subtitle: { contains: opts.search } },
              { description: { contains: opts.search } },
            ],
          }
        : {}),
    },
    include: {
      category: { select: { name: true, slug: true } },
      instructor: { select: { name: true } },
      reviews: { select: { rating: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy:
      opts?.orderBy === "popular"
        ? { enrollments: { _count: "desc" } }
        : { createdAt: "desc" },
    take: opts?.take,
  });

  return courses.map((c) => {
    const reviewCount = c.reviews.length;
    const rating =
      reviewCount > 0
        ? c.reviews.reduce((a, r) => a + r.rating, 0) / reviewCount
        : undefined;
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      thumbnail: c.thumbnail,
      price: c.price,
      discountPrice: c.discountPrice,
      level: c.level,
      durationMinutes: c.durationMinutes,
      category: c.category,
      instructor: c.instructor,
      rating,
      reviewCount,
      enrollCount: c._count.enrollments,
    };
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { courses: { where: { published: true } } } } },
  });
}
