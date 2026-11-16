export function normalizeRequestError(error) {
    if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
        error.message = "La solicitud excedió el tiempo de espera. Si estaba guardando información, consulte el resultado antes de volver a enviarla.";
    } else if (error?.code === "ERR_NETWORK") {
        error.message = "No se pudo conectar con el servidor. Revise su conexión. Si estaba guardando información, consulte el resultado antes de volver a enviarla.";
    }
    return error;
}
