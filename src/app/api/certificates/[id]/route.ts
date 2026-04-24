import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// pdfkit reads font metric files from disk at runtime, which requires the
// full Node.js runtime (not the Edge runtime).
export const runtime = "nodejs";
// Certificate PDFs are generated per request and must never be statically
// cached.
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "غير مسجل" }, { status: 401 });
  const { id } = await params;

  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: { course: true, user: true },
  });
  if (!cert) return NextResponse.json({ error: "الشهادة غير موجودة" }, { status: 404 });
  if (cert.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }

  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c as Buffer));
  const finished: Promise<Buffer> = new Promise((resolve) =>
    doc.on("end", () => resolve(Buffer.concat(chunks))),
  );

  // Certificate border
  doc.lineWidth(3).strokeColor("#b85c16").rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
  doc.lineWidth(1).strokeColor("#eeb16a").rect(32, 32, doc.page.width - 64, doc.page.height - 64).stroke();

  doc.fontSize(18).fillColor("#b85c16").text("Nekhely Academy", 0, 70, { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(36).fillColor("#0f172a").text("Certificate of Completion", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(14).fillColor("#475569").text("This certifies that", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(30).fillColor("#0f172a").text(cert.user.name, { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(14).fillColor("#475569").text("has successfully completed the course", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(22).fillColor("#b85c16").text(cert.course.title, { align: "center" });
  doc.moveDown(2);

  const dateStr = new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "long", day: "numeric",
  }).format(cert.issuedAt);
  doc.fontSize(12).fillColor("#475569").text(`Date: ${dateStr}`, 60, doc.page.height - 100);
  doc.text(`Certificate Code: ${cert.code}`, 0, doc.page.height - 100, {
    align: "right",
    width: doc.page.width - 60,
  });

  doc.end();
  const pdf = await finished;
  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certificate-${cert.code}.pdf"`,
    },
  });
}
