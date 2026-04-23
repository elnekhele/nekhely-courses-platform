"use client";

export function LessonPlayer({
  lesson,
}: {
  lesson: { id: string; videoUrl: string | null; content: string | null };
}) {
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
