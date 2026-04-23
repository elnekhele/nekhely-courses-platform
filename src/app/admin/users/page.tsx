import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { RoleSelect } from "@/components/admin/role-select";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      _count: { select: { enrollments: true, courses: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">المستخدمون ({users.length})</h1>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500 bg-slate-50">
              <tr>
                <th className="text-start py-3 px-4">الاسم</th>
                <th className="text-start py-3 px-4">البريد</th>
                <th className="text-start py-3 px-4">الدور</th>
                <th className="text-start py-3 px-4">اشتراكات</th>
                <th className="text-start py-3 px-4">دورات</th>
                <th className="text-start py-3 px-4">منذ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-2 px-4 font-medium">{u.name}</td>
                  <td className="py-2 px-4 text-slate-600">{u.email}</td>
                  <td className="py-2 px-4">
                    <RoleSelect userId={u.id} defaultRole={u.role} />
                  </td>
                  <td className="py-2 px-4">{u._count.enrollments}</td>
                  <td className="py-2 px-4">{u._count.courses}</td>
                  <td className="py-2 px-4 text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
