# أكاديمية نَخِيلة — منصة بيع الكورسات

منصة تعليمية عربية (RTL) لبيع الكورسات والدبلومات الاحترافية، مستوحاة من تصميم
[Sonicourses](https://www.sonicourses.com/). مبنية بتقنية Next.js 14 و TypeScript
و Tailwind CSS و Prisma.

## المميزات

### الواجهة العامة
- صفحة رئيسية تعرض التصنيفات والدورات المميزة والأحدث مع إحصائيات وشريط CTA.
- كتالوج كامل مع بحث، فلترة بالتصنيف/المستوى، وفرز (الأحدث/الأكثر شعبية).
- صفحة تفاصيل كورس متكاملة (ماذا ستتعلم، المنهج، المدرب، التقييمات، التسعير والخصم).
- صفحة أقسام وصفحة قسم منفردة.
- سلة مشتريات مبنية على LocalStorage.
- صفحة دفع مع إدخال كود كوبون وحساب الضريبة والإجمالي.

### نظام المستخدمين
- NextAuth v4 مع مزود Credentials (بريد + كلمة مرور).
- ثلاثة أدوار: **طالب (STUDENT)**، **مدرب (INSTRUCTOR)**، **مشرف (ADMIN)** مع Middleware حماية.
- صفحات تسجيل دخول/إنشاء حساب بالعربية.

### لوحة الطالب
- نظرة عامة (متوسط التقدم، عدد الدورات، الشهادات).
- كورساتي مع شريط تقدم.
- شهاداتي مع تنزيل PDF.
- فواتيري.
- ملفي الشخصي.

### مشغل التعلم
- مشغل فيديو يدعم YouTube/Vimeo/MP4 مباشر.
- شريط جانبي بالمنهج ونسبة الإكمال.
- تتبع تقدم الدرس وإكماله.
- اختبارات (Quizzes) مع تصحيح تلقائي ونتيجة فورية.
- إصدار **شهادة PDF** تلقائياً عند إتمام الدورة.

### لوحة المدرب
- إحصائيات (عدد الدورات، الطلاب، الإيرادات).
- إنشاء دورة جديدة.
- محرر دورة متكامل لإضافة أقسام ودروس (فيديو/نص) وضبط الأسعار والنشر.

### لوحة المشرف Admin
- إحصائيات عامة (مستخدمون، دورات، طلبات، إيرادات).
- إدارة المستخدمين (تغيير الأدوار).
- إدارة الدورات (نشر/تمييز/تحرير).
- إدارة الأقسام والكوبونات.
- عرض كل الطلبات.
- لوحة تحليلات مع رسم بياني للإيرادات اليومية آخر ٣٠ يوماً والأكثر مبيعاً.

### الدفع — Moyasar
- مُهيّأ للتكامل مع بوابة [Moyasar](https://moyasar.com/) العربية عبر `src/lib/moyasar.ts`.
- في وضع التطوير يستخدم محاكاة دفع (بدون مفاتيح حقيقية) لتسهيل الاختبار.
- للإنتاج: أضف `MOYASAR_PUBLISHABLE_KEY` و `MOYASAR_SECRET_KEY` وعدّل صفحة
  `/checkout` لاستخدام Moyasar.js لتوكينة البطاقة ثم استدعِ `createPayment(...)`.
- قابلة للتبديل إلى Paymob/HyperPay بتغيير الملف `moyasar.ts`.

## التشغيل محلياً (تطوير)

> المشروع يستخدم PostgreSQL في التطوير والإنتاج. أسهل طريقة محلياً هي إنشاء قاعدة Neon مجانية واستخدام نفس المتغيرات.

```bash
# ١. التبعيات
npm install

# ٢. انسخ .env.example إلى .env وعبّئ DATABASE_URL و NEXTAUTH_SECRET
cp .env.example .env

# ٣. أنشئ الجداول في قاعدتك (أول مرة فقط)
npm run db:push

# ٤. (اختياري) زرع بيانات تجريبية
npm run db:seed

# ٥. التشغيل
npm run dev    # http://localhost:3000
```

### حسابات تجريبية (بعد التعبئة)

| الدور | البريد | كلمة المرور |
| --- | --- | --- |
| مشرف | `admin@nekhely.sa` | `password123` |
| مدرب | `instructor1@nekhely.sa` | `password123` |
| طالب | `student@nekhely.sa` | `password123` |

## البنية

```
src/
  app/                     # Next.js App Router
    (pages)/               # الصفحات العامة
    dashboard/             # لوحة الطالب
    instructor/            # لوحة المدرب
    admin/                 # لوحة المشرف
    learn/                 # مشغل الدروس
    api/                   # Route handlers
  components/              # UI + میزات
  lib/                     # prisma, auth, utils, moyasar
prisma/
  schema.prisma            # المخطط الكامل
  seed.ts                  # بيانات تجريبية عربية
```

## المتغيرات البيئية

انسخ `.env.example` إلى `.env` ثم عدّل:

```
DATABASE_URL=postgresql://user:pwd@host/db?sslmode=require   # Neon/Supabase
DIRECT_URL=postgresql://user:pwd@host/db?sslmode=require     # Neon direct URL
NEXTAUTH_SECRET=...                  # ولّد بـ openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000   # في الإنتاج: https://yourdomain.com
MOYASAR_PUBLISHABLE_KEY=...          # من لوحة Moyasar (اختياري)
MOYASAR_SECRET_KEY=...               # من لوحة Moyasar (اختياري)
```

## النشر للإنتاج 🚀

دليل كامل خطوة بخطوة لنشر الموقع على **Vercel** مع قاعدة بيانات **Neon Postgres**:

👉 **[DEPLOYMENT.md](./DEPLOYMENT.md)**

## الترخيص

خاص — جميع الحقوق محفوظة.
