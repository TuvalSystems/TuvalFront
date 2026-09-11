import axios from 'axios';

// En desarrollo Vite reenvía ambas rutas al backend bajo el mismo origen.
const sessionClient = axios.create({
  baseURL: import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
});

export function prepareCsrf() {
  return sessionClient.get('/sanctum/csrf-cookie');
}
