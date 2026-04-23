export function toast(opts: {
  title: string;
  description?: string;
  tone?: "success" | "error";
}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app:toast", { detail: opts }));
}
