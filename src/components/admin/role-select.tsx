"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export function RoleSelect({
  userId,
  defaultRole,
}: {
  userId: string;
  defaultRole: string;
}) {
  const [role, setRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function change(newRole: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setLoading(false);
    if (!res.ok) {
      toast({ title: "فشل التحديث", tone: "error" });
      return;
    }
    setRole(newRole);
    router.refresh();
  }

  return (
    <select
      value={role}
      disabled={loading}
      onChange={(e) => change(e.target.value)}
      className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs"
    >
      <option value="STUDENT">طالب</option>
      <option value="INSTRUCTOR">مدرب</option>
      <option value="ADMIN">مشرف</option>
    </select>
  );
}
