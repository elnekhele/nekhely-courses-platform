"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/lib/toast";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 max-w-md">جارٍ التحميل...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      toast({ title: "فشل تسجيل الدخول", description: "تحقق من البريد وكلمة المرور", tone: "error" });
    } else {
      const callbackUrl = search.get("callbackUrl") || "/dashboard";
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>تسجيل الدخول</CardTitle>
          <CardDescription>مرحباً بعودتك! أدخل بياناتك للمتابعة</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
          <div className="mt-4 text-sm text-slate-500 text-center">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-brand-700 font-medium">إنشاء حساب</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
