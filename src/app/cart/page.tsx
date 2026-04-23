"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Trash2, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const { items, remove, subtotal } = useCart();

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="font-display text-3xl font-bold mb-8">سلة المشتريات</h1>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-slate-500">
            <ShoppingCart className="size-12 mx-auto mb-3 text-slate-300" />
            <div className="font-medium">سلتك فارغة حالياً</div>
            <div className="mt-4">
              <Link href="/courses"><Button>تصفح الدورات</Button></Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.courseId}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="size-20 bg-brand-100 rounded-lg overflow-hidden shrink-0 grid place-items-center text-brand-700 font-bold">
                    {item.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      item.title.slice(0, 2)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/courses/${item.slug}`} className="font-semibold hover:text-brand-700 line-clamp-2">
                      {item.title}
                    </Link>
                    <div className="mt-1 font-bold text-brand-700">
                      {formatPrice(item.discountPrice ?? item.price)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(item.courseId)}
                    aria-label="إزالة"
                  >
                    <Trash2 className="size-4 text-red-600" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit sticky top-24">
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>المجموع الفرعي</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>الإجمالي</span>
                <span className="text-brand-700">{formatPrice(subtotal)}</span>
              </div>
              <Link href="/checkout" className="block">
                <Button size="lg" className="w-full">المتابعة للدفع</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
