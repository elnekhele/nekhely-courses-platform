import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "SAR") {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} دقيقة`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} ساعة`;
  return `${h} س ${m} د`;
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "مبتدئ",
  INTERMEDIATE: "متوسط",
  ADVANCED: "متقدم",
  ALL: "كل المستويات",
};

export const ROLE_LABELS: Record<string, string> = {
  STUDENT: "طالب",
  INSTRUCTOR: "مدرب",
  ADMIN: "مشرف",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد الانتظار",
  PAID: "مدفوع",
  FAILED: "فشل",
  REFUNDED: "مسترد",
};
