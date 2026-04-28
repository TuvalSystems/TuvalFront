import axiosPrint from "@/axiosPrint"; // 1. Cambiamos la instancia

export function getFilenameFromDisposition(disposition, fallback = 'documento.pdf') {
  if (!disposition) return fallback;
  const m = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i.exec(disposition);
  const raw = (m && (m[1] || m[2] || m[3])) || '';
  try { return decodeURIComponent(raw) || fallback; } catch { return raw || fallback; }
}

async function assertSuccessBlob(res) {
  const ct = res?.headers?.['content-type'] ?? '';
  const blob = res?.data;

  // Si es un tipo de documento válido, lo dejamos pasar
  const isDocument = ['application/pdf', 'application/vnd', 'application/octet-stream']
    .some(t => ct.includes(t));

  if (!isDocument) {
    // Intentamos extraer el mensaje de error del blob
    let message = 'Respuesta inesperada del servidor.';
    try {
      const text = await blob?.text?.();
      const json = text ? JSON.parse(text) : null;
      message = json?.error || json?.message || text || message;
    } catch {
      // Si no se puede parsear, usamos el mensaje por defecto
    }
    throw new Error(message);
  }

  return blob;
}

/**
 * Usa axiosPrint para descargar y validar el PDF
 */
export async function downloadFileFromApi(opts = {}) {
  const {
    url,
    method = 'POST',
    payload,
    filenameFallback = 'documento',
    headers = {}
  } = opts;

  const config = {
    headers: { Accept: 'application/pdf, application/octet-stream', ...headers },
    validateStatus: s => s < 500,
  };

  // ✅ Un solo try/catch, sin wrappear dos veces el error
  const res = method === 'GET'
    ? await axiosPrint.get(url, { ...config, params: payload })
    : await axiosPrint.post(url, payload, config);

  const blob = await assertSuccessBlob(res); // lanza si hay error

  const cd = res.headers?.['content-disposition'];
  const filename = getFilenameFromDisposition(cd, filenameFallback);

  const href = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);

  return filename;
}