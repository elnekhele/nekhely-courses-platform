import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteStreamAsset, isStreamConfigured } from "@/lib/cloudflare-stream";

async function authorize(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "غير مسجل" as const, status: 401 as const };
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { section: { include: { course: true } } },
  });
  if (!lesson) return { error: "غير موجود" as const, status: 404 as const };
  if (
    lesson.section.course.instructorId !== session.user.id &&
    session.user.role !== "ADMIN"
  ) {
    return { error: "غير مسموح" as const, status: 403 as const };
  }
  return { lesson };
}

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  durationMinutes: z.number().int().min(0).optional(),
  isPreview: z.boolean().optional(),
  // Video source — exactly one of these should be used at a time. The editor
  // enforces it, but we also tolerate explicit nulls to clear a field.
  videoProvider: z.enum(["EXTERNAL", "STREAM"]).optional(),
  videoUrl: z.string().nullable().optional(),
  videoUid: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await authorize(id);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  // If we're replacing a Stream-hosted video, clean up the old asset in Cloudflare.
  const next = parsed.data;
  if (
    auth.lesson.videoProvider === "STREAM" &&
    auth.lesson.videoUid &&
    next.videoUid !== undefined &&
    next.videoUid !== auth.lesson.videoUid
  ) {
    if (isStreamConfigured()) {
      await deleteStreamAsset(auth.lesson.videoUid);
    }
  }

  const lesson = await prisma.lesson.update({
    where: { id },
    data: next,
  });
  return NextResponse.json(lesson);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await authorize(id);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (auth.lesson.videoProvider === "STREAM" && auth.lesson.videoUid && isStreamConfigured()) {
    await deleteStreamAsset(auth.lesson.videoUid);
  }
  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
