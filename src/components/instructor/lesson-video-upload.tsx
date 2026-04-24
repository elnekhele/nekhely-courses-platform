"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { Loader2, Upload } from "lucide-react";

/**
 * Per-lesson "upload a video" button. Flow:
 *   1. POST /api/instructor/stream/upload-url → { uploadURL, uid }
 *   2. Browser POSTs the file directly to Cloudflare (not through our server).
 *   3. PATCH /api/instructor/lessons/[id] with { videoProvider: "STREAM", videoUid }.
 */
export function LessonVideoUpload({
  lessonId,
  lessonTitle,
  currentProvider,
}: {
  lessonId: string;
  lessonTitle: string;
  currentProvider: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "preparing" | "uploading" | "saving">("idle");
  const [progress, setProgress] = useState(0);

  async function handlePick() {
    inputRef.current?.click();
  }

  async function handleFile(file: File) {
    try {
      setState("preparing");
      const res = await fetch("/api/instructor/stream/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: lessonTitle }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const { uploadURL, uid } = (await res.json()) as {
        uploadURL: string;
        uid: string;
      };

      setState("uploading");
      await uploadWithProgress(uploadURL, file, (pct) => setProgress(pct));

      setState("saving");
      const save = await fetch(`/api/instructor/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoProvider: "STREAM", videoUid: uid, videoUrl: null }),
      });
      if (!save.ok) throw new Error("فشل حفظ الفيديو على الدرس");

      toast({ title: "تم رفع الفيديو", tone: "success" });
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "فشل رفع الفيديو";
      toast({ title: message, tone: "error" });
    } finally {
      setState("idle");
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const label =
    state === "preparing"
      ? "جاري التحضير..."
      : state === "uploading"
        ? `جاري الرفع ${progress}%`
        : state === "saving"
          ? "جاري الحفظ..."
          : currentProvider === "STREAM"
            ? "استبدال الفيديو"
            : "رفع فيديو";

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={handlePick}
        disabled={state !== "idle"}
        className="gap-1"
      >
        {state === "idle" ? (
          <Upload className="size-3.5" />
        ) : (
          <Loader2 className="size-3.5 animate-spin" />
        )}
        {label}
      </Button>
    </>
  );
}

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`رفع الفيديو فشل (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("خطأ في الشبكة أثناء الرفع"));
    xhr.send(form);
  });
}
