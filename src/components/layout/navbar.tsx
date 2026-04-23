"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/components/cart/cart-context";
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { href: "/", label: "الرئيسية" },
  { href: "/courses", label: "الدورات" },
  { href: "/categories", label: "الأقسام" },
  { href: "/about", label: "من نحن" },
];

export function Navbar() {
  const { data: session } = useSession();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-brand-600 text-white grid place-items-center font-bold">
              <GraduationCap className="size-5" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900">نَخِيلة</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-slate-700 hover:text-brand-700 rounded-md hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/cart" className="relative p-2 text-slate-700 hover:text-brand-700">
            <ShoppingCart className="size-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] rounded-full size-4 grid place-items-center font-bold">
                {count}
              </span>
            )}
          </Link>

          {session?.user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/dashboard" className="p-2 text-slate-700 hover:text-brand-700">
                <LayoutDashboard className="size-5" />
              </Link>
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-50">
                <User className="size-4 text-slate-500" />
                <span className="text-sm text-slate-700">{session.user.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">تسجيل الدخول</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">إنشاء حساب</Button>
              </Link>
            </div>
          )}

          <button
            className="md:hidden p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="قائمة"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="h-px bg-slate-200 my-2" />
            {session?.user ? (
              <>
                <Link href="/dashboard" className="px-3 py-2 text-sm" onClick={() => setOpen(false)}>لوحة التحكم</Link>
                <button className="px-3 py-2 text-sm text-red-600 text-start" onClick={() => signOut({ callbackUrl: "/" })}>تسجيل الخروج</button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 text-sm" onClick={() => setOpen(false)}>تسجيل الدخول</Link>
                <Link href="/register" className="px-3 py-2 text-sm" onClick={() => setOpen(false)}>إنشاء حساب</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
