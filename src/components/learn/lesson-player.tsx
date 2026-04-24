"use client";

import { useEffect, useState } from "react";

type LessonInput = {
  id: string;
  videoProvider?: string | null;
  videoUrl: string | null;
  videoUid?: string | null;
  content: string | null;
};

export function LessonPlayer({ lesson }: { lesson: LessonInput }) {
  if (lesson.videoProvider === "STREAM" && lesson.videoUid) {
    return <StreamPlayer lessonId={lesson.id} />;
  }

  if (lesson.videoUrl) {
    const isYoutube = /youtube\.com|youtu\.be/.test(lesson.videoUrl);
    const isVimeo = /vimeo\.com/.test(lesson.videoUrl);
    if (isYoutube || isVimeo) {
      return (
        <div className="aspect-video rounded-2xl overflow-hidden bg-black">
          <iframe
            src={toEmbedUrl(lesson.videoUrl)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="درس"
          />
        </div>
      );
    }
    return (
      <div className="aspect-video rounded-2xl overflow-hidden bg-black">
        <video src={lesson.videoUrl} controls className="w-full h-full" />
      </div>
    );
  }
  return (
    <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 grid place-items-center text-slate-400">
      <div className="text-center">
        <div className="text-4xl mb-2">🎬</div>
        <div className="text-sm">لا يوجد فيديو متاح لهذا الدرس</div>
        {lesson.content && (
          <div className="mt-4 px-6 text-start text-slate-300 max-w-2xl mx-auto whitespace-pre-line">
            {lesson.content}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Fetch a short-lived signed playback token from our API, then embed the
 * Cloudflare Stream iframe using the signed URL. The token is refreshed if
 * the user reopens the page.
 */
function StreamPlayer({ lessonId }: { lessonId: string }) {
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "ready"; src: string }
    | { kind: "error"; message: string }
  >({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/lessons/${lessonId}/stream-token`, {
          cache: "no-store",
        });
        const data = (await res.json()) as {
          token?: string;
          subdomain?: string;
          error?: string;
        };
        if (!res.ok || !data.token || !data.subdomain) {
          throw new Error(data.error ?? "تعذر تحميل الفيديو");
        }
        if (!cancelled) {
          setState({
            kind: "ready",
            src: `https://${data.subdomain}/${data.token}/iframe?preload=metadata&poster=`,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            kind: "error",
            message: e instanceof Error ? e.message : "تعذر تحميل الفيديو",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  if (state.kind === "loading") {
    return (
      <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 grid place-items-center text-slate-400 text-sm">
        جاري تحميل الفيديو...
      </div>
    );
  }
  if (state.kind === "error") {
    return (
      <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 grid place-items-center text-slate-300 text-sm px-6 text-center">
        {state.message}
      </div>
    );
  }
  return (
    <div className="aspect-video rounded-2xl overflow-hidden bg-black">
      <iframe
        src={state.src}
        className="w-full h-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        title="درس"
      />
    </div>
  );
}

function toEmbedUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      return `https://player.vimeo.com/video${u.pathname}`;
    }
  } catch {
    /* ignore */
  }
  return url;
}
