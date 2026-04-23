import Link from "next/link";
import { getCategories } from "@/lib/queries";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-6">الأقسام</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-300 hover:shadow-soft transition"
          >
            <div className="size-12 rounded-xl bg-brand-50 text-brand-700 grid place-items-center mb-4 text-2xl">
              {cat.icon ?? "📚"}
            </div>
            <div className="font-semibold">{cat.name}</div>
            <div className="text-xs text-slate-500 mt-1">{cat._count.courses} دورة</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
