import store from "@/store";

export function getCurrentUserId() {
  const u = store?.state?.user?.data;
  if (!u) return null;
  const id = u.id ?? null;
  // Intenta varias formas comunes:
  return id != null && !Number.isNaN(+id) ? +id : null;
}
