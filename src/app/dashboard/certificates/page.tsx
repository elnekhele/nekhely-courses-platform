import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const certs = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: { course: true },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">شهاداتي</h1>
      {certs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-slate-500">أكمل دورة واحدة على الأقل للحصول على شهادتك.</CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {certs.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5 flex items-start gap-4">
                <div className="size-12 rounded-lg bg-amber-100 text-amber-700 grid place-items-center">
                  <Award className="size-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold line-clamp-1">{c.course.title}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    رقم الشهادة: {c.code}
                  </div>
                  <div className="text-xs text-slate-500">
                    أُصدرت في {formatDate(c.issuedAt)}
                  </div>
                  <Link href={`/api/certificates/${c.id}`} target="_blank" className="inline-block mt-3">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Download className="size-4" />
                      تحميل PDF
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
