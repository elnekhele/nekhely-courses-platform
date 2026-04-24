import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getCustomerSubdomain,
  isStreamConfigured,
  signPlaybackToken,
} from "@/lib/cloudflare-stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Issue a short-lived signed playback token for a Cloudflare Stream lesson.
 * Returned only if:
 *   - The lesson is a preview lesson, OR
 *   - The caller is enrolled in the course, OR
 *   - The caller is ADMIN, OR the course instructor.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: lessonId } = await params;
  if (!isStreamConfigured()) {
    return NextResponse.json(
      { error: "ميزة الفيديو المحمي غير مفعّلة" },
      { status: 503 },
    );
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { section: { include: { course: true } } },
  });
  if (!lesson) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (lesson.videoProvider !== "STREAM" || !lesson.videoUid) {
    return NextResponse.json(
      { error: "هذا الدرس ليس فيديو Cloudflare Stream" },
      { status: 400 },
    );
  }

  const courseId = lesson.section.courseId;

  // Preview lessons are open to everyone (matches existing product behaviour).
  if (lesson.isPreview) {
    const token = signPlaybackToken(lesson.videoUid);
    return NextResponse.json({ token, subdomain: getCustomerSubdomain() });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "غير مسجل" }, { status: 401 });

  const isOwnerOrAdmin =
    session.user.role === "ADMIN" ||
    lesson.section.course.instructorId === session.user.id;

  if (!isOwnerOrAdmin) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      select: { id: true },
    });
    if (!enrollment)
      return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }

  const token = signPlaybackToken(lesson.videoUid);
  return NextResponse.json({ token, subdomain: getCustomerSubdomain() });
}
