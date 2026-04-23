"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/lib/toast";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      toast({ title: "خطأ في التسجيل", description: data.error ?? "حاول مرة أخرى", tone: "error" });
      setLoading(false);
      return;
    }
    await signIn("credentials", {
      email: body.email,
      password: body.password,
      redirect: false,
    });
    setLoading(false);
    toast({ title: "تم إنشاء الحساب", tone: "success" });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>إنشاء حساب جديد</CardTitle>
          <CardDescription>انضم إلى آلاف المتعلمين وابدأ رحلتك</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input id="name" name="name" required minLength={2} />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور (6 أحرف على الأقل)</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جارٍ الإنشاء..." : "إنشاء حساب"}
            </Button>
          </form>
          <div className="mt-4 text-sm text-slate-500 text-center">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-brand-700 font-medium">تسجيل الدخول</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
