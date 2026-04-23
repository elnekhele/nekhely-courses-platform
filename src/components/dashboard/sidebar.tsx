"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Receipt,
  UserCircle,
  Users,
  ShoppingBag,
  FolderTree,
  Ticket,
  BarChart3,
  PenSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: React.ReactNode };

const studentNav: Item[] = [
  { href: "/dashboard", label: "نظرة عامة", icon: <LayoutDashboard className="size-4" /> },
  { href: "/dashboard/courses", label: "دوراتي", icon: <BookOpen className="size-4" /> },
  { href: "/dashboard/certificates", label: "شهاداتي", icon: <Award className="size-4" /> },
  { href: "/dashboard/orders", label: "فواتيري", icon: <Receipt className="size-4" /> },
  { href: "/dashboard/profile", label: "ملفي الشخصي", icon: <UserCircle className="size-4" /> },
];

const instructorNav: Item[] = [
  { href: "/instructor", label: "نظرة عامة", icon: <LayoutDashboard className="size-4" /> },
  { href: "/instructor/courses", label: "دوراتي", icon: <BookOpen className="size-4" /> },
  { href: "/instructor/courses/new", label: "دورة جديدة", icon: <PenSquare className="size-4" /> },
];

const adminNav: Item[] = [
  { href: "/admin", label: "لوحة التحكم", icon: <LayoutDashboard className="size-4" /> },
  { href: "/admin/users", label: "المستخدمون", icon: <Users className="size-4" /> },
  { href: "/admin/courses", label: "الدورات", icon: <BookOpen className="size-4" /> },
  { href: "/admin/categories", label: "الأقسام", icon: <FolderTree className="size-4" /> },
  { href: "/admin/orders", label: "الطلبات", icon: <ShoppingBag className="size-4" /> },
  { href: "/admin/coupons", label: "الكوبونات", icon: <Ticket className="size-4" /> },
  { href: "/admin/analytics", label: "التحليلات", icon: <BarChart3 className="size-4" /> },
];

export function Sidebar({ role }: { role: "student" | "instructor" | "admin" }) {
  const pathname = usePathname();
  const items =
    role === "admin" ? adminNav : role === "instructor" ? instructorNav : studentNav;
  const title =
    role === "admin" ? "المشرف" : role === "instructor" ? "المدرب" : "الطالب";

  return (
    <aside className="w-full md:w-60 shrink-0">
      <div className="md:sticky md:top-20 bg-white border border-slate-200 rounded-xl p-3">
        <div className="px-2 py-1 text-xs text-slate-500 uppercase font-semibold mb-1">
          لوحة {title}
        </div>
        <nav className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                  active
                    ? "bg-brand-50 text-brand-800 font-medium"
                    : "text-slate-700 hover:bg-slate-50",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
