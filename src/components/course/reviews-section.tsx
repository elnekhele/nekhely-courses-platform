"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { formatDate } from "@/lib/utils";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string; image: string | null };
};

export function ReviewsSection({
  courseId,
  initial,
  canReview,
}: {
  courseId: string;
  initial: Review[];
  canReview: boolean;
}) {
  const [reviews, setReviews] = useState<Review[]>(initial);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/courses/${courseId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      toast({ title: "تعذر إرسال التقييم", description: data.error, tone: "error" });
      return;
    }
    const newReview = (await res.json()) as Review;
    setReviews((prev) => [newReview, ...prev.filter((r) => r.id !== newReview.id)]);
    setComment("");
    toast({ title: "شكراً على تقييمك", tone: "success" });
  }

  return (
    <div className="bg-white rounded-2xl p-6 text-slate-900">
      <h2 className="font-display text-xl font-bold mb-4">التقييمات</h2>

      {canReview && (
        <form onSubmit={submit} className="mb-6 border border-slate-200 rounded-xl p-4">
          <div className="text-sm font-medium mb-2">قيّم هذه الدورة</div>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} نجوم`}
              >
                <Star
                  className={`size-6 ${n <= rating ? "fill-amber-400 stroke-amber-400" : "stroke-slate-300"}`}
                />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="شاركنا رأيك..."
            rows={3}
          />
          <div className="mt-3">
            <Button type="submit" disabled={loading} size="sm">
              {loading ? "جارٍ الإرسال..." : "إرسال التقييم"}
            </Button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-slate-500 text-sm">لا توجد تقييمات بعد.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="size-9 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-bold text-sm">
                  {r.user.name.slice(0, 1)}
                </div>
                <div>
                  <div className="font-medium text-sm">{r.user.name}</div>
                  <div className="text-xs text-slate-500">{formatDate(r.createdAt)}</div>
                </div>
                <div className="ms-auto flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`size-4 ${n <= r.rating ? "fill-amber-400 stroke-amber-400" : "stroke-slate-300"}`}
                    />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-sm text-slate-700">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
