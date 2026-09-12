import axiosPrint from "@/axiosPrint";

export function getFilenameFromDisposition(
  disposition,
  fallback = "documento"
) {
  if (!disposition) return fallback;

  const match =
    /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i.exec(
      disposition
    );

  const rawFilename =
    (match && (match[1] || match[2] || match[3])) || "";

  try {
    return decodeURIComponent(rawFilename) || fallback;
  } catch {
    return rawFilename || fallback;
  }
}

async function extractBlobError(blob, fallbackMessage) {
  const fallback = {
    message: fallbackMessage,
    data: {},
  };

  try {
    const text = await blob?.text?.();

    if (!text) {
      return fallback;
    }

    try {
      const json = JSON.parse(text);
      const data =
        json && typeof json === "object"
          ? json
          : { message: String(json) };

      return {
        message:
          json?.error ||
          json?.message ||
          getFirstErrorMessage(json?.errors) ||
          fallbackMessage,
        data,
      };
    } catch {
      return {
        message: text,
        data: { message: text },
      };
    }
  } catch {
    return fallback;
  }
}

function getFirstErrorMessage(errors) {
  if (!errors) return null;

  if (Array.isArray(errors)) {
    return errors.find(Boolean) || null;
  }

  if (typeof errors === "object") {
    return Object.values(errors).flat().find(Boolean) || null;
  }

  return String(errors);
}

function createDownloadError(message, response, data = {}) {
  const error = new Error(message);
  const status = response?.status ?? 0;

  error.name = "FileDownloadError";
  error.status = status;
  error.data = data;
  error.response = {
    status,
    data,
    headers: response?.headers ?? {},
    statusText: response?.statusText ?? "",
  };

  return error;
}

async function assertSuccessBlob(response) {
  const status = response?.status ?? 0;
  const blob = response?.data;

  const contentType = String(
    response?.headers?.["content-type"] ?? ""
  ).toLowerCase();

  const contentDisposition = String(
    response?.headers?.["content-disposition"] ?? ""
  ).toLowerCase();

  const isSuccessful = status >= 200 && status < 300;
  const isAttachment = contentDisposition.includes("attachment");

  if (!isSuccessful) {
    const errorInfo = await extractBlobError(
      blob,
      `No se pudo descargar el archivo. Código HTTP: ${status}.`
    );

    throw createDownloadError(
      errorInfo.message,
      response,
      errorInfo.data
    );
  }

  /*
   * Cuando el servidor devuelve JSON sin Content-Disposition,
   * normalmente corresponde a un mensaje de error y no a un archivo.
   */
  const isJsonResponse =
    contentType.includes("application/json") ||
    contentType.includes("application/problem+json");

  if (isJsonResponse && !isAttachment) {
    let json = null;

    try {
      const text = await blob?.text?.();
      json = text ? JSON.parse(text) : null;
    } catch {
      // No fue posible interpretar la respuesta.
    }

    if (
      json?.success === false ||
      json?.error ||
      json?.message
    ) {
      throw createDownloadError(
        json?.error ||
          json?.message ||
          getFirstErrorMessage(json?.errors) ||
          "El servidor devolvió una respuesta de error.",
        response,
        json ?? {}
      );
    }
  }

  if (!(blob instanceof Blob)) {
    throw createDownloadError(
      "El servidor no devolvió un archivo válido.",
      response
    );
  }

  return blob;
}

export async function downloadFileFromApi(options = {}) {
  const {
    url,
    method = "POST",
    payload,
    filenameFallback = "documento",
    headers = {},
  } = options;

  const config = {
    headers: {
      Accept: "*/*",
      ...headers,
    },

    /*
     * Permite recibir también respuestas 4xx/5xx como Blob
     * para extraer el mensaje real enviado por Laravel.
     */
    validateStatus: () => true,
  };

  const normalizedMethod = method.toUpperCase();

  let response;

  if (normalizedMethod === "GET") {
    response = await axiosPrint.get(url, {
      ...config,
      params: payload,
    });
  } else {
    response = await axiosPrint.request({
      ...config,
      url,
      method: normalizedMethod,
      data: payload,
    });
  }

  const blob = await assertSuccessBlob(response);

  const contentDisposition =
    response.headers?.["content-disposition"];

  const filename = getFilenameFromDisposition(
    contentDisposition,
    filenameFallback
  );

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 100);

  return filename;
}
