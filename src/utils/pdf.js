import axiosClient from "@/axios";
export function getFilenameFromDisposition(disposition, fallback = 'documento.pdf') {
  if (!disposition) return fallback
  const m = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i.exec(disposition)
  const raw = (m && (m[1] || m[2] || m[3])) || ''
  try { return decodeURIComponent(raw) || fallback } catch { return raw || fallback }
}

export async function ensurePdfBlob(res) {
  const ct = (res && res.headers && res.headers['content-type']) || ''
  const blob = res && res.data
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
 * Llama a tu API Laravel, valida que sea PDF y descarga el archivo
 * @param {Object} opts
 * @param {string} opts.url - endpoint Laravel
 * @param {'POST'|'GET'} [opts.method='POST']
 * @param {any} [opts.payload] - body (POST) o params (GET)
 * @param {string} [opts.filenameFallback='documento.pdf']
 * @param {Object} [opts.headers={}]
 * @returns {Promise<{ok: boolean, filename?: string, message?: string}>}
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
      responseType: 'blob',
      headers: { Accept: 'application/pdf', ...headers },
      validateStatus: s => s < 500
    }

    const res = method === 'GET'
      ? await axiosClient.get(url, { ...config, params: payload })
      : await axiosClient.post(url, payload, config)

    const blob = await ensurePdfBlob(res) // lanza si no es PDF

    const cd = res.headers && res.headers['content-disposition']
    let filename = getFilenameFromDisposition(cd, filenameFallback)
    filename = ensurePdfExtension(filename);

    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = filename
    document.body.appendChild(a); // más compatible con Safari
    a.click();
    a.remove();
    URL.revokeObjectURL(href);

    return { ok: true, filename }
  } catch (err) {
    const msg =
      (err && err.response && err.response.data && err.response.data.error) ||
      (err && err.message) ||
      'No se pudo generar el PDF.'
    return { ok: false, message: msg }
  }
}