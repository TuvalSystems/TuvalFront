// Conserva el valor predeterminado de las lecturas ausentes también si el JSON
// está dañado. No modifica otros datos de la sesión ni elimina el token.
export function readSessionJson(key, fallback = null) {
  try {
    const value = sessionStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}
