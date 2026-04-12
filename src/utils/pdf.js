import axiosPrint from "@/axiosPrint"; // 1. Cambiamos la instancia

export function getFilenameFromDisposition(disposition, fallback = 'documento.pdf') {
  if (!disposition) return fallback
  const m = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i.exec(disposition)
  const raw = (m && (m[1] || m[2] || m[3])) || ''
  try { return decodeURIComponent(raw) || fallback } catch { return raw || fallback }
}

export async function ensurePdfBlob(res) {
  const ct = (res && res.headers && res.headers['content-type']) || ''
  const blob = res && res.data
  
  // Si la respuesta no es PDF, intentamos leer el error JSON dentro del blob
  if (!ct.includes('application/pdf')) {
    try {
      const text = typeof blob?.text === 'function' ? await blob.text() : ''
      try {
        const json = text ? JSON.parse(text) : null
        const msg = (json && (json.error || json.message)) || 'Respuesta no es PDF.'
        throw new Error(msg)
      } catch {
        throw new Error(text || 'Respuesta no es PDF.')
      }
    } catch (e) {
      throw new Error(e && e.message ? e.message : 'Respuesta no es PDF.')
    }
  }
  return blob
}

function ensurePdfExtension(name) {
  return /\.pdf$/i.test(name) ? name : `${name}.pdf`;
}

/**
 * Usa axiosPrint para descargar y validar el PDF
 */
export async function downloadPdfFromApi(opts) {
  const {
    url,
    method = 'POST',
    payload,
    filenameFallback = 'documento.pdf',
    headers = {}
  } = opts || {}

  try {
    const config = {
      // Nota: responseType: 'blob' ya viene heredado de axiosPrint
      headers: { Accept: 'application/pdf', ...headers },
      validateStatus: s => s < 500
    }

    // 2. Usamos axiosPrint en lugar de axiosClient
    const res = method === 'GET'
      ? await axiosPrint.get(url, { ...config, params: payload })
      : await axiosPrint.post(url, payload, config)

    const blob = await ensurePdfBlob(res) 

    const cd = res.headers && res.headers['content-disposition']
    let filename = getFilenameFromDisposition(cd, filenameFallback)
    filename = ensurePdfExtension(filename);

    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = filename
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);

    return { ok: true, filename }
  } catch (err) {
    // Si Axios arroja un error (ej. 401, 500), intentamos extraer el mensaje
    const msg =
      (err && err.response && err.response.data && err.response.data.error) ||
      (err && err.message) ||
      'No se pudo generar el PDF.'
    return { ok: false, message: msg }
  }
}