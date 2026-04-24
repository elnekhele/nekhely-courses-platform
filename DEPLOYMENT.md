# 🚀 Deployment Guide — Vercel + Neon Postgres

> دليل النشر للإنتاج — Vercel + قاعدة بيانات Neon Postgres
> مكتوب للمبتدئين. خطوة بخطوة. ستتم الأمور في ~١٥ دقيقة.

## 0. Prerequisites — المتطلبات

- حساب على GitHub (موجود — المستودع عندك).
- حساب مجاني على [Vercel](https://vercel.com) (سجّل بـ GitHub).
- حساب مجاني على [Neon](https://neon.tech) (Postgres serverless).
- `openssl` على جهازك لتوليد `NEXTAUTH_SECRET` (موجود افتراضياً على macOS/Linux/WSL).

بديل: إذا كنت تفضّل **Supabase** بدل Neon، اتبع نفس الخطوات لكن من لوحة Supabase Dashboard → Project Settings → Database → Connection string.

---

## 1. Create a Neon Postgres database — أنشئ قاعدة بيانات Neon

1. افتح https://console.neon.tech واضغط **New Project**.
2. اختر:
   - **Project name:** `nekhely-courses` (أو ما تريد)
   - **Region:** أقرب منطقة (مثلاً *EU (Frankfurt)* أو *US East*)
   - **Postgres version:** الافتراضي (أحدث نسخة)
3. بعد الإنشاء تنتقل إلى صفحة **Connection Details**. ستجد صندوقين:
   - **Pooled connection** → ينتهي بـ `?sslmode=require` — هذا للـ `DATABASE_URL`.
   - **Direct connection** → بدون `-pooler` في الـ host — هذا للـ `DIRECT_URL`.
4. احتفظ بهذين السلسلتين مؤقتاً (مفكرة/ملف آمن). **لا ترفعهما على GitHub أبداً.**

---

## 2. Generate NEXTAUTH_SECRET — وَلِّد مفتاح المصادقة

على جهازك، في Terminal:

```bash
openssl rand -base64 32
```

انسخ الناتج (٤٤ حرف تقريباً). هذا هو `NEXTAUTH_SECRET`.

> ⚠️ **لا تستخدم نفس القيمة في التطوير والإنتاج.** ولّد واحدة جديدة لكل بيئة.

---

## 3. Import the repo into Vercel — اربط المستودع بـ Vercel

1. افتح https://vercel.com/new
2. اختر **Import Git Repository** → اختر `elnekhele/nekhely-courses-platform`.
3. Vercel يتعرّف تلقائياً على Next.js. **لا تعدّل أي إعدادات بناء.** الإعدادات الصحيحة موجودة في `package.json` و`next.config.mjs`.
4. قبل الضغط على **Deploy**، انزل إلى قسم **Environment Variables** وأضف:

   | Name | Value | Environment |
   |---|---|---|
   | `DATABASE_URL` | الـ **Pooled** URL من Neon (مع `?sslmode=require`) | Production, Preview, Development |
   | `DIRECT_URL` | الـ **Direct** URL من Neon | Production, Preview, Development |
   | `NEXTAUTH_SECRET` | الناتج من الخطوة 2 | Production, Preview, Development |
   | `NEXTAUTH_URL` | `https://<your-project>.vercel.app` (ستحصل عليها بعد أول Deploy) | Production |
   | `NEXT_PUBLIC_SITE_NAME` | `أكاديمية نَخِيلة` | Production, Preview, Development |
   | `NEXT_PUBLIC_CURRENCY` | `SAR` | Production, Preview, Development |

   **Moyasar (اختياري — اتركها فارغة الآن):**
   | `MOYASAR_PUBLISHABLE_KEY` | `` |
   | `MOYASAR_SECRET_KEY` | `` |

5. اضغط **Deploy**. البناء الأول سيستغرق دقيقة أو دقيقتين.

> 💡 **تنبيه:** الـ deploy الأول سينجح، لكن الموقع سيعطي خطأ عند أي صفحة تحتاج قاعدة بيانات لأن الجداول لم تُنشأ بعد. نحل هذا في الخطوة التالية.

---

## 4. Push the database schema — أنشئ الجداول في Neon

نستخدم Prisma `db push` لإنشاء كل الجداول دفعة واحدة. افعل هذا **مرة واحدة فقط** على جهازك:

```bash
# ١. استنسخ المستودع إذا لم تكن قد فعلت
git clone https://github.com/elnekhele/nekhely-courses-platform.git
cd nekhely-courses-platform
npm install

# ٢. أنشئ ملف .env محلي بنفس الـ DATABASE_URL و DIRECT_URL اللذين وضعتهما في Vercel
cp .env.example .env
# ثم افتح .env وعبّئ القيم

# ٣. أنشئ كل الجداول في Neon
npx prisma db push

# ٤. (اختياري) زرع بيانات تجريبية: 8 دورات، 4 مستخدمين، كوبونات، مدرّبين
npm run db:seed
```

بعد هذه الخطوة، قاعدة Neon بها كل الجداول وبيانات أولية.

> 🔐 **حسابات الدخول الأولية بعد الـ seed:**
> - `admin@nekhely.sa` / `password123`
> - `instructor1@nekhely.sa` / `password123`
> - `student@nekhely.sa` / `password123`
>
> **هام جداً:** بعد أوّل تسجيل دخول على الإنتاج، غيّر هذه الكلمات من صفحة "ملفي الشخصي" أو احذف هؤلاء المستخدمين نهائياً.

---

## 5. Update NEXTAUTH_URL and redeploy — حدّث الرابط

1. من Vercel Dashboard → مشروعك → **Settings** → **Environment Variables**.
2. حدّث قيمة `NEXTAUTH_URL` إلى الرابط الحقيقي (مثلاً `https://nekhely-courses-platform.vercel.app`). إذا أضفت نطاقاً مخصصاً لاحقاً، ضع نطاقك بدلاً من `vercel.app`.
3. من تبويب **Deployments**، اختر آخر deploy → النقاط الثلاث → **Redeploy** (مع "Use existing Build Cache" مطفأ في المرة الأولى).

---

## 6. Verify in production — اختبر النشر

بعد الـ redeploy:

- [ ] افتح الرابط الرئيسي → يجب أن تظهر الصفحة الرئيسية العربية RTL مع الدورات.
- [ ] اضغط **تسجيل الدخول** → أدخل `student@nekhely.sa / password123`.
- [ ] اذهب إلى **لوحة التحكم** → يجب أن ترى دوراتك.
- [ ] اختر دورة → أضفها للسلة → اذهب للدفع → طبّق كوبون `WELCOME10` → ادفع (وضع تجريبي).
- [ ] أكمل الدروس → ستُصدَر شهادة → حمّل الـ PDF.

إذا كل هذا يعمل، **مبروك 🎉** الموقع جاهز.

---

## 7. Add a custom domain — أضف نطاقاً مخصصاً (اختياري)

1. في Vercel: **Settings → Domains → Add** → اكتب نطاقك (مثلاً `nekhely.academy`).
2. Vercel يعطيك سجل DNS (غالباً `CNAME` يشير إلى `cname.vercel-dns.com`).
3. أضف السجل عند مزوّد نطاقك (Namecheap، GoDaddy، Cloudflare…).
4. بعد انتشار DNS (٥–٣٠ دقيقة)، حدّث `NEXTAUTH_URL` إلى النطاق الجديد وأعد الـ deploy.

---

## 8. Going fully production — تحضيرات نهائية للإنتاج

- **المدفوعات الحقيقية:** استبدل محاكاة الدفع بـ Moyasar.js tokenization — راجع `src/lib/moyasar.ts` و `src/app/checkout/page.tsx`. أضف مفاتيح Moyasar الحقيقية في Vercel ENV وفعّل webhook عند `/api/payments/webhook` (البنية جاهزة).
- **الخط العربي للشهادات:** افتراضياً pdfkit لا يدعم العربية داخل الـ PDF. ارفع خط عربي مثل [Tajawal](https://fonts.google.com/specimen/Tajawal) إلى `public/fonts/Tajawal-Bold.ttf` ثم سجّله في `src/app/api/certificates/[id]/route.ts`:
  ```ts
  const fontPath = path.join(process.cwd(), "public/fonts/Tajawal-Bold.ttf");
  doc.registerFont("ar", fontPath);
  doc.font("ar");
  ```
- **النسخ الاحتياطي:** Neon يحفظ نسخاً احتياطية تلقائية في Point-in-Time Restore على الخطة المدفوعة. راجع إعدادات Neon للتأكد.
- **Rate limiting:** أضف طبقة مثل [Upstash Ratelimit](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview) على `/api/auth/*` و `/api/checkout` لحماية من الهجمات.
- **تسجيل الأخطاء:** فعّل [Sentry](https://sentry.io/welcome/) أو [Vercel Monitoring](https://vercel.com/docs/analytics/observability).

---

## Troubleshooting — حل المشاكل الشائعة

| المشكلة | الحل |
|---|---|
| Build fails with "Environment variable not found: DATABASE_URL" | راجع إضافة المتغيرات في Vercel → Environment Variables. تأكد أنها مُفعّلة لـ *Production*. |
| "PrismaClientInitializationError: Can't reach database server" | تأكد أن `DATABASE_URL` في Vercel يحتوي `?sslmode=require` في نهايته. Neon تطلب SSL دائماً. |
| تسجيل الدخول يعمل لكن يُرجع 302 أو loop | `NEXTAUTH_URL` غير مطابق للـ URL الفعلي. حدّثه وأعد الـ deploy. |
| صفحة `/dashboard` تعطي 500 | عادة بسبب عدم إنشاء الجداول. نفّذ الخطوة 4 (`npx prisma db push`). |
| الشهادة تعرض الاسم العربي كرموز | قيد معروف — راجع الخطوة 8 لإضافة خط عربي. |
| Vercel build ناجح لكن الصفحة تعطي "Application error" | راجع **Functions → Logs** في Vercel Dashboard — غالباً يشير إلى متغير بيئة مفقود. |

---

## Useful links — روابط مفيدة

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Neon Console](https://console.neon.tech)
- [Prisma docs: Deploy with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [NextAuth.js: Configuration](https://next-auth.js.org/configuration/options)
