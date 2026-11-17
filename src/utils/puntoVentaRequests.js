// Incluye la continuación de los consumidores antes de considerar libre la red.
const pendientes = new Set();
export function iniciarSolicitud(config) {
  const token = {};
  config.puntoVentaRequestToken = token;
  pendientes.add(token);
  return config;
}
export function finalizarSolicitud(config) {
  const token = config?.puntoVentaRequestToken;
  if (token) setTimeout(() => pendientes.delete(token), 0);
}
export async function esperarSolicitudes(timeout = 10000) {
  const inicio = Date.now();
  do {
    await new Promise(resolve => setTimeout(resolve, 20));
    if (pendientes.size === 0) return true;
  } while (Date.now() - inicio < timeout);
  return false;
}
