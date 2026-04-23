import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function LearnEntry({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const first = await prisma.lesson.findFirst({
    where: { section: { courseId } },
    orderBy: [{ section: { order: "asc" } }, { order: "asc" }],
  });
  if (!first) redirect("/dashboard");
  redirect(`/learn/${courseId}/${first.id}`);
}
