export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  return date
    .toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    .toUpperCase();
}
