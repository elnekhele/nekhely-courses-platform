import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS, formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>ملفي الشخصي</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Row label="الاسم" value={user.name} />
        <Row label="البريد الإلكتروني" value={user.email} />
        <Row label="الدور" value={ROLE_LABELS[user.role] ?? user.role} />
        <Row label="عضو منذ" value={formatDate(user.createdAt)} />
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
