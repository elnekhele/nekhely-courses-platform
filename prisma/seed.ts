import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");
  // Clean
  await prisma.certificate.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.review.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.section.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const pwd = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.create({
    data: { name: "مشرف النظام", email: "admin@nekhely.sa", role: "ADMIN", password: pwd },
  });
  const student = await prisma.user.create({
    data: { name: "أحمد الطالب", email: "student@nekhely.sa", role: "STUDENT", password: pwd },
  });
  const instructor1 = await prisma.user.create({
    data: {
      name: "حسني محمد",
      email: "instructor1@nekhely.sa",
      role: "INSTRUCTOR",
      password: pwd,
      bio: "مصمم موشن جرافيك محترف وخبير بأدوبي أفترافكت.",
    },
  });
  const instructor2 = await prisma.user.create({
    data: {
      name: "سارة العتيبي",
      email: "instructor2@nekhely.sa",
      role: "INSTRUCTOR",
      password: pwd,
      bio: "مصممة UI/UX ومطورة واجهات، أحب تعليم الأدوات العملية.",
    },
  });
  const instructor3 = await prisma.user.create({
    data: {
      name: "عمر الحربي",
      email: "instructor3@nekhely.sa",
      role: "INSTRUCTOR",
      password: pwd,
      bio: "صانع محتوى رقمي ومؤسس استوديو إنتاج رقمي.",
    },
  });

  // Categories
  const catDefs = [
    { name: "الموشن جرافيك", slug: "motion-graphics", icon: "🎞️" },
    { name: "التصميم", slug: "design", icon: "🎨" },
    { name: "صناعة المحتوى", slug: "content-creation", icon: "📱" },
    { name: "مونتاج الفيديو", slug: "video-editing", icon: "🎬" },
    { name: "الثري دي", slug: "3d", icon: "🧊" },
    { name: "تصميم المواقع والتطبيقات", slug: "web-design", icon: "💻" },
    { name: "الذكاء الاصطناعي", slug: "ai", icon: "🤖" },
    { name: "الدورات المجانية", slug: "free", icon: "🎁" },
  ];
  const categories: Record<string, string> = {};
  for (const c of catDefs) {
    const cat = await prisma.category.create({ data: c });
    categories[c.slug] = cat.id;
  }

  // Coupons
  await prisma.coupon.createMany({
    data: [
      { code: "WELCOME10", percentOff: 10, active: true },
      { code: "RAMADAN25", percentOff: 25, active: true, maxUses: 100 },
    ],
  });

  // Courses
  const courseDefs: Array<{
    title: string;
    subtitle: string;
    description: string;
    price: number;
    discountPrice?: number;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL";
    category: string;
    instructorId: string;
    featured?: boolean;
    thumbnail?: string;
    whatYouWillLearn: string;
    requirements: string;
    sections: Array<{ title: string; lessons: Array<{ title: string; duration: number; preview?: boolean }> }>;
  }> = [
    {
      title: "كورس الموشن جرافيك من الصفر للاحتراف",
      subtitle: "تعلم تصميم موشن جرافيك احترافي بأدوبي أفترافكت",
      description:
        "دورة شاملة تبدأ معك من أساسيات البرنامج وحتى إنتاج مشاريع موشن جرافيك احترافية جاهزة لسوق العمل. يرافقك فيها المدرب خطوة بخطوة عبر شروحات عملية ومشاريع واقعية.",
      price: 499,
      discountPrice: 299,
      level: "ALL",
      category: "motion-graphics",
      instructorId: instructor1.id,
      featured: true,
      whatYouWillLearn: [
        "إتقان واجهة After Effects والأدوات الأساسية",
        "تحريك الأشكال والنصوص بطرق احترافية",
        "استخدام التعابير (Expressions) لتسريع العمل",
        "تصدير الفيديوهات بأفضل جودة",
      ].join("\n"),
      requirements: ["جهاز كمبيوتر بمعالج i5 أو أعلى", "برنامج After Effects", "رغبة في التعلم"].join("\n"),
      sections: [
        { title: "المقدمة", lessons: [
          { title: "مرحباً بك في الدورة", duration: 5, preview: true },
          { title: "متطلبات الدورة", duration: 7 },
        ]},
        { title: "أساسيات أفترافكت", lessons: [
          { title: "جولة في الواجهة", duration: 12 },
          { title: "إنشاء مشروع جديد", duration: 10 },
          { title: "الطبقات والتراكيب", duration: 15 },
          { title: "المفاتيح والتحريك الأساسي", duration: 18 },
        ]},
        { title: "تحريك الأشكال", lessons: [
          { title: "رسم الأشكال", duration: 14 },
          { title: "الحركة المتقدمة", duration: 20 },
          { title: "أمثلة عملية", duration: 25 },
        ]},
        { title: "مشروع التخرج", lessons: [
          { title: "إعداد المشروع", duration: 20 },
          { title: "التحريك والتوقيت", duration: 35 },
          { title: "التصدير والتسليم", duration: 15 },
        ]},
      ],
    },
    {
      title: "كورس فيجما لتصميم واجهات المستخدم",
      subtitle: "UI / UX Design in Figma",
      description:
        "ستتعلم في هذه الدورة أسس تصميم تجربة المستخدم باستخدام برنامج Figma، مع تطبيق المعرفة على مشاريع حقيقية لتصميم تطبيقات جوال ومواقع ويب.",
      price: 399,
      discountPrice: 249,
      level: "BEGINNER",
      category: "web-design",
      instructorId: instructor2.id,
      featured: true,
      whatYouWillLearn: ["إتقان Figma","مبادئ التصميم الحديث","إنشاء نظام تصميم متكامل","نماذج أولية تفاعلية"].join("\n"),
      requirements: ["لا حاجة لخبرة مسبقة"].join("\n"),
      sections: [
        { title: "مقدمة عن Figma", lessons: [
          { title: "تثبيت Figma", duration: 6, preview: true },
          { title: "الواجهة الأساسية", duration: 10 },
        ]},
        { title: "أساسيات التصميم", lessons: [
          { title: "الألوان والخطوط", duration: 15 },
          { title: "الشبكات والمسافات", duration: 12 },
          { title: "نظام التصميم Design System", duration: 22 },
        ]},
        { title: "مشروع: تطبيق جوال", lessons: [
          { title: "شاشة الدخول", duration: 18 },
          { title: "القائمة الرئيسية", duration: 22 },
          { title: "الصفحة الشخصية", duration: 20 },
        ]},
      ],
    },
    {
      title: "ورشة صناعة المحتوى بالذكاء الاصطناعي",
      subtitle: "استخدم ChatGPT وMidjourney لإنتاج محتوى احترافي",
      description:
        "ورشة عملية سريعة تتعلم فيها كيفية الاستفادة من أدوات الذكاء الاصطناعي الحديثة في صناعة محتوى جذاب لحسابات السوشيال ميديا والمدونات.",
      price: 0,
      level: "BEGINNER",
      category: "ai",
      instructorId: instructor3.id,
      featured: true,
      whatYouWillLearn: ["التعامل مع ChatGPT باحتراف","كتابة البرومت المثالي","توليد الصور","أفكار للمحتوى"].join("\n"),
      requirements: ["اشتراك مجاني في ChatGPT"].join("\n"),
      sections: [
        { title: "أدوات الذكاء الاصطناعي", lessons: [
          { title: "نظرة عامة", duration: 10, preview: true },
          { title: "أفضل الأدوات 2025", duration: 12 },
        ]},
        { title: "تطبيقات عملية", lessons: [
          { title: "كتابة تغريدات احترافية", duration: 15 },
          { title: "توليد صور لمقال", duration: 20 },
        ]},
      ],
    },
    {
      title: "Master Video Editing in CapCut",
      subtitle: "مونتاج فيديوهات الريلز والسوشيال بكفاءة",
      description:
        "تعلم مونتاج الفيديوهات القصيرة عبر تطبيق CapCut سواء على الجوال أو سطح المكتب، من البداية حتى الاحتراف.",
      price: 299,
      level: "BEGINNER",
      category: "video-editing",
      instructorId: instructor1.id,
      whatYouWillLearn: ["استيراد المقاطع","القص والترتيب","المؤثرات والانتقالات","تصدير الفيديو"].join("\n"),
      requirements: ["جوال أو حاسوب"].join("\n"),
      sections: [
        { title: "التعريف بالبرنامج", lessons: [
          { title: "مقدمة", duration: 5, preview: true },
          { title: "تثبيت CapCut", duration: 5 },
        ]},
        { title: "أساسيات المونتاج", lessons: [
          { title: "استيراد المقاطع", duration: 10 },
          { title: "القص والترتيب", duration: 15 },
          { title: "إضافة الموسيقى", duration: 12 },
        ]},
      ],
    },
    {
      title: "الموشن جرافيك المتقدم | تحريك كولاج أرت",
      subtitle: "صمم موشن جرافيك بأسلوب الكولاج الحديث",
      description: "دورة متقدمة تغوص بك في عالم الكولاج الرقمي وتحريكه عبر After Effects بتقنيات احترافية.",
      price: 599,
      level: "ADVANCED",
      category: "motion-graphics",
      instructorId: instructor1.id,
      whatYouWillLearn: ["أسلوب الكولاج","تقنيات التحريك المتقدمة","استخدام الصور ثلاثية الأبعاد"].join("\n"),
      requirements: ["خبرة مسبقة في أفترافكت"].join("\n"),
      sections: [
        { title: "أساسيات الأسلوب", lessons: [
          { title: "مقدمة عن الكولاج الرقمي", duration: 8, preview: true },
          { title: "تجهيز الصور", duration: 14 },
        ]},
        { title: "المشروع", lessons: [
          { title: "تصميم المشهد", duration: 25 },
          { title: "التحريك", duration: 32 },
          { title: "الإخراج النهائي", duration: 18 },
        ]},
      ],
    },
    {
      title: "تصميم الهويات البصرية | Brand Design",
      subtitle: "من الفكرة إلى شعار احترافي وهوية متكاملة",
      description: "تعلم كيف تبني هوية بصرية متكاملة من البحث حتى تسليم الملفات، مع مشاريع تطبيقية.",
      price: 449,
      level: "INTERMEDIATE",
      category: "design",
      instructorId: instructor2.id,
      whatYouWillLearn: ["البحث وبناء المفهوم","تصميم الشعار","نظام الألوان","دليل الاستخدام"].join("\n"),
      requirements: ["إلمام بـ Illustrator أو Figma"].join("\n"),
      sections: [
        { title: "المقدمة", lessons: [
          { title: "ماهية الهوية البصرية", duration: 12, preview: true },
        ]},
        { title: "تصميم الشعار", lessons: [
          { title: "مراحل التصميم", duration: 18 },
          { title: "الشبكة الذهبية", duration: 15 },
        ]},
      ],
    },
    {
      title: "دورة صناعة الفيديوهات بالذكاء الاصطناعي",
      subtitle: "اصنع فيديوهات بلا كاميرا باستخدام الذكاء الاصطناعي",
      description: "دورة عملية تتعلم فيها إنتاج فيديوهات احترافية بالاعتماد على أدوات الذكاء الاصطناعي مثل Runway وPika.",
      price: 599,
      discountPrice: 399,
      level: "ALL",
      category: "ai",
      instructorId: instructor3.id,
      featured: true,
      whatYouWillLearn: ["توليد فيديو من نص","تحريك الصور","تحويل النص إلى صوت","دمج المخرجات"].join("\n"),
      requirements: ["اشتراك في أداة واحدة على الأقل"].join("\n"),
      sections: [
        { title: "نظرة على الأدوات", lessons: [
          { title: "Runway", duration: 14, preview: true },
          { title: "Pika Labs", duration: 12 },
        ]},
        { title: "مشاريع عملية", lessons: [
          { title: "فيديو ترويجي قصير", duration: 22 },
          { title: "إعلان منتج", duration: 28 },
        ]},
      ],
    },
    {
      title: "ورشة مونتاج Reel بالأفترافكت",
      subtitle: "صمم ريلز يتفاعل معه الجمهور",
      description: "ورشة عملية لصنع مقاطع ريلز لافتة وسريعة للسوشيال ميديا بأفترافكت.",
      price: 0,
      level: "INTERMEDIATE",
      category: "free",
      instructorId: instructor1.id,
      whatYouWillLearn: ["مبادئ الريلز الناجح","القواطع والإيقاع","إضافة المؤثرات"].join("\n"),
      requirements: ["معرفة بسيطة بأفترافكت"].join("\n"),
      sections: [
        { title: "الريلز", lessons: [
          { title: "ما الذي يصنع ريلز ناجح؟", duration: 10, preview: true },
          { title: "تقسيم المقطع", duration: 14 },
          { title: "المؤثرات", duration: 16 },
        ]},
      ],
    },
  ];

  const createdCourses: { id: string; slug: string }[] = [];
  for (const def of courseDefs) {
    const slug = def.title
      .toLowerCase()
      .replace(/[^\w\u0600-\u06FF\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80);

    let durationMinutes = 0;
    for (const s of def.sections) for (const l of s.lessons) durationMinutes += l.duration;

    const course = await prisma.course.create({
      data: {
        title: def.title,
        slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
        subtitle: def.subtitle,
        description: def.description,
        price: def.price,
        discountPrice: def.discountPrice ?? null,
        level: def.level,
        thumbnail: def.thumbnail ?? null,
        categoryId: categories[def.category],
        instructorId: def.instructorId,
        published: true,
        featured: def.featured ?? false,
        whatYouWillLearn: def.whatYouWillLearn,
        requirements: def.requirements,
        durationMinutes,
        sections: {
          create: def.sections.map((s, i) => ({
            title: s.title,
            order: i,
            lessons: {
              create: s.lessons.map((l, li) => ({
                title: l.title,
                durationMinutes: l.duration,
                order: li,
                isPreview: l.preview ?? false,
                videoUrl: li === 0 ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : null,
                content: `درس تجريبي: ${l.title}`,
              })),
            },
          })),
        },
      },
    });

    // Add a demo quiz to the first course
    if (createdCourses.length === 0) {
      await prisma.quiz.create({
        data: {
          title: "اختبار أساسيات الدورة",
          description: "اختبار قصير بعد إتمام وحدة الأساسيات",
          courseId: course.id,
          passingScore: 60,
          questions: {
            create: [
              {
                text: "ما الاختصار الذي يفتح نافذة التراكيب في أفترافكت؟",
                options: JSON.stringify(["Ctrl+N", "Ctrl+Shift+N", "Ctrl+T", "F5"]),
                answer: 0,
                order: 0,
              },
              {
                text: "ما الغرض من المفتاح Keyframe؟",
                options: JSON.stringify([
                  "تثبيت الإعداد",
                  "حفظ المشروع",
                  "تسجيل قيمة لحظية للحركة",
                  "تصدير المشروع",
                ]),
                answer: 2,
                order: 1,
              },
              {
                text: "أي من الأدوات التالية أفضل لتحريك النصوص بسرعة؟",
                options: JSON.stringify(["Shape Layer", "Text Animator", "Null Object", "Camera"]),
                answer: 1,
                order: 2,
              },
            ],
          },
        },
      });
    }

    createdCourses.push(course);
  }

  // Enroll student in 2 courses with progress, reviews, certificate
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: createdCourses[0].id,
      progress: 45,
    },
  });
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: createdCourses[2].id,
      progress: 100,
      completedAt: new Date(),
    },
  });
  await prisma.certificate.create({
    data: {
      userId: student.id,
      courseId: createdCourses[2].id,
      code: "NEK-DEMO-0001",
    },
  });
  await prisma.review.create({
    data: {
      userId: student.id,
      courseId: createdCourses[2].id,
      rating: 5,
      comment: "ورشة رائعة وسريعة وعملية جداً!",
    },
  });
  await prisma.order.create({
    data: {
      userId: student.id,
      subtotal: 299,
      total: 299,
      status: "PAID",
      paymentRef: "demo-seed-001",
      items: {
        create: [{ courseId: createdCourses[0].id, price: 299 }],
      },
    },
  });

  console.log("✅ Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
