"use client";

/**
 * Very lightweight toast system. Uses a browser `CustomEvent` as transport so
 * any component (client or inside a server boundary) can fire toasts by
 * calling `toast(...)` from `@/lib/toast`.
 */

import * as React from "react";

type Toast = { id: number; title: string; description?: string; tone?: "success" | "error" };

export function Toaster() {
  const [items, setItems] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent).detail as Omit<Toast, "id">;
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, ...detail }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    }
    window.addEventListener("app:toast", handler);
    return () => window.removeEventListener("app:toast", handler);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg px-4 py-3 shadow-lg text-sm max-w-sm border ${
            t.tone === "error"
              ? "bg-red-50 border-red-200 text-red-900"
              : t.tone === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <div className="font-semibold">{t.title}</div>
          {t.description && (
            <div className="mt-0.5 text-xs opacity-80">{t.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}
