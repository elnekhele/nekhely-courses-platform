"use client";

import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/components/cart/cart-context";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { ShoppingCart, Check } from "lucide-react";

export function AddToCartButton({ course }: { course: CartItem }) {
  const { add, has } = useCart();
  const router = useRouter();
  const inCart = has(course.courseId);

  if (inCart) {
    return (
      <Button
        className="w-full gap-2"
        size="lg"
        variant="secondary"
        onClick={() => router.push("/cart")}
      >
        <Check className="size-4" />
        مضاف للسلة — عرض السلة
      </Button>
    );
  }

  return (
    <Button
      className="w-full gap-2"
      size="lg"
      onClick={() => {
        add(course);
        toast({ title: "تمت الإضافة إلى السلة", tone: "success" });
      }}
    >
      <ShoppingCart className="size-4" />
      أضف إلى السلة
    </Button>
  );
}
