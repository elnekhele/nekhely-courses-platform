import Link from "next/link";
import { GraduationCap, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 mt-16">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="size-9 rounded-lg bg-brand-600 text-white grid place-items-center">
              <GraduationCap className="size-5" />
            </div>
            <span className="font-display font-bold text-lg">أكاديمية نَخِيلة</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            منصة تعليمية عربية تقدم كورسات ودبلومات احترافية في التصميم والموشن جرافيك وصناعة المحتوى والذكاء الاصطناعي.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">روابط سريعة</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/courses">جميع الدورات</Link></li>
            <li><Link href="/categories">الأقسام</Link></li>
            <li><Link href="/about">من نحن</Link></li>
            <li><Link href="/contact">تواصل معنا</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">للمتعلمين</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/dashboard">لوحة الطالب</Link></li>
            <li><Link href="/dashboard/certificates">شهاداتي</Link></li>
            <li><Link href="/dashboard/orders">فواتيري</Link></li>
            <li><Link href="/register">إنشاء حساب</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">تواصل</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2"><Mail className="size-4" /> support@nekhely.academy</li>
            <li className="flex items-center gap-2"><Phone className="size-4" /> +966 00 000 0000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} أكاديمية نَخِيلة - جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
