import { GraduationCap, Heart, Users, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <div className="size-16 rounded-2xl bg-brand-100 text-brand-700 grid place-items-center mx-auto mb-4">
          <GraduationCap className="size-8" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
          عن أكاديمية نَخِيلة
        </h1>
        <p className="text-slate-600 leading-relaxed">
          منصة تعليمية عربية نؤمن بأن المعرفة حق للجميع، ونسعى لتقديم محتوى
          احترافي بجودة عالية يُمكّن كل عربي من تطوير مهاراته في التصميم،
          الموشن جرافيك، صناعة المحتوى، والذكاء الاصطناعي.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-12">
        <ValueCard icon={<Heart className="size-5" />} title="شغف" text="نحب ما نعلّمه، ونهتم بتفاصيل كل درس." />
        <ValueCard icon={<Users className="size-5" />} title="مجتمع" text="ندعم الطالب بتواصل مباشر مع المدربين." />
        <ValueCard icon={<Award className="size-5" />} title="جودة" text="مناهج عملية من الصفر حتى الاحتراف." />
      </div>

      <Card>
        <CardContent className="p-8 text-slate-700 leading-loose">
          تأسست الأكاديمية لتكون جسراً بين المتعلم العربي وأفضل الأدوات والمهارات
          التي يحتاجها في سوق العمل الحديث. نعمل مع نخبة من المدربين ذوي الخبرة
          الطويلة لتقديم تجربة تعليمية متكاملة من الشرح الواضح والمشاريع العملية
          والشهادات المعتمدة.
        </CardContent>
      </Card>
    </div>
  );
}

function ValueCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="size-10 rounded-lg bg-brand-100 text-brand-700 grid place-items-center mb-3">
          {icon}
        </div>
        <div className="font-semibold mb-1">{title}</div>
        <p className="text-sm text-slate-500">{text}</p>
      </CardContent>
    </Card>
  );
}
