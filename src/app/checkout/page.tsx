"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { CreditCard } from "lucide-react";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const total = Math.max(0, subtotal - discount);

  async function applyCoupon() {
    if (!coupon) return;
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon, subtotal }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      toast({ title: "كوبون غير صالح", description: data.error, tone: "error" });
      return;
    }
    const data = (await res.json()) as { discount: number; code: string };
    setDiscount(data.discount);
    setCouponCode(data.code);
    toast({ title: `تم تطبيق خصم ${formatPrice(data.discount)}`, tone: "success" });
  }

  async function pay() {
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseIds: items.map((i) => i.courseId),
        couponCode,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      toast({ title: "فشلت عملية الدفع", description: data.error, tone: "error" });
      return;
    }
    const data = (await res.json()) as { orderId: string };
    clear();
    router.push(`/checkout/success?orderId=${data.orderId}`);
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-slate-500">
        سلة المشتريات فارغة.{" "}
        <a href="/courses" className="text-brand-700 font-medium">تصفح الدورات</a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="font-display text-3xl font-bold mb-8">إتمام الشراء</h1>

      <div className="grid md:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الدورات المطلوبة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.courseId} className="flex items-center justify-between text-sm">
                  <span className="line-clamp-1">{item.title}</span>
                  <span className="font-semibold text-brand-700">
                    {formatPrice(item.discountPrice ?? item.price)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5" />
                بيانات الدفع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 text-xs">
                <strong>تنبيه تطوير:</strong> هذا الإصدار يستخدم محاكاة دفع تجريبية
                للتكامل مع Moyasar. في الإنتاج سيتم تحميل نموذج Moyasar.js
                لتوكينة البطاقات بأمان دون أن يلمس الخادم بياناتها.
              </div>
              <div>
                <Label>رقم البطاقة (تجريبي)</Label>
                <Input placeholder="4242 4242 4242 4242" dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>MM/YY</Label>
                  <Input placeholder="12/28" dir="ltr" />
                </div>
                <div>
                  <Label>CVC</Label>
                  <Input placeholder="123" dir="ltr" />
                </div>
              </div>
              <div>
                <Label>الاسم على البطاقة</Label>
                <Input placeholder="Mohammad Alsaeed" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit sticky top-24">
          <CardHeader>
            <CardTitle>ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>المجموع الفرعي</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>الخصم ({couponCode})</span>
                <span>- {formatPrice(discount)}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between font-bold text-base">
              <span>الإجمالي</span>
              <span className="text-brand-700">{formatPrice(total)}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="كود الخصم"
              />
              <Button variant="outline" onClick={applyCoupon}>تطبيق</Button>
            </div>

            <Button onClick={pay} disabled={loading} size="lg" className="w-full mt-3">
              {loading ? "جارٍ الدفع..." : `ادفع ${formatPrice(total)}`}
            </Button>
            <p className="text-xs text-slate-500 text-center">
              بإتمام الشراء فإنك توافق على شروط الاستخدام.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
