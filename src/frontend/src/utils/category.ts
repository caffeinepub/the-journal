import { Category } from "../backend";

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.health]: "Health",
  [Category.anime]: "Anime",
  [Category.lifestyle]: "Lifestyle",
  [Category.travel]: "Travel",
  [Category.recipes]: "Recipes",
  [Category.tech]: "Tech",
  [Category.poetries]: "Poetries",
  [Category.other]: "Other",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.health]: "text-emerald-600",
  [Category.anime]: "text-orange-500",
  [Category.lifestyle]: "text-amber-600",
  [Category.travel]: "text-teal-600",
  [Category.recipes]: "text-blue-500",
  [Category.tech]: "text-slate-500",
  [Category.poetries]: "text-violet-500",
  [Category.other]: "text-gray-500",
};

export const CATEGORY_BG_COLORS: Record<Category, string> = {
  [Category.health]: "bg-emerald-50 text-emerald-700",
  [Category.anime]: "bg-orange-50 text-orange-700",
  [Category.lifestyle]: "bg-amber-50 text-amber-700",
  [Category.travel]: "bg-teal-50 text-teal-700",
  [Category.recipes]: "bg-blue-50 text-blue-700",
  [Category.tech]: "bg-slate-100 text-slate-700",
  [Category.poetries]: "bg-violet-50 text-violet-700",
  [Category.other]: "bg-gray-100 text-gray-600",
};

export function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const ALL_CATEGORIES = Object.values(Category);
