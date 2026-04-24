import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createDirectUploadUrl, isStreamConfigured } from "@/lib/cloudflare-stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Request a Cloudflare Stream Direct Creator Upload URL.
 * Called by the course editor before the browser uploads the video file
 * directly to Cloudflare (bypassing our server entirely).
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "غير مسجل" }, { status: 401 });
  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });

  if (!isStreamConfigured()) {
    return NextResponse.json(
      { error: "لم يتم تفعيل رفع الفيديو — أخبر مشرف الموقع بإعداد Cloudflare Stream" },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    maxDurationSeconds?: number;
  };

  try {
    const { uploadURL, uid } = await createDirectUploadUrl({
      name: body.name,
      maxDurationSeconds: body.maxDurationSeconds ?? 2 * 3600,
      requireSignedURLs: true,
      creatorId: session.user.id,
    });
    return NextResponse.json({ uploadURL, uid });
  } catch (e) {
    const message = e instanceof Error ? e.message : "فشل طلب رابط الرفع";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
