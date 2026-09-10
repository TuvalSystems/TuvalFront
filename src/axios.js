import axios from 'axios';
import store from './store';
import router from './router';
import { SYSTEM_USERS_API_ROUTES } from "@/constants/apiRoutes/sistema/userRoutes";

const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
    headers: {
        'Accept': 'application/json',
        // NOTA: No ponemos 'Content-Type' aquí para permitir 
        // que el navegador gestione automáticamente FormData (imágenes/archivos)
    },
    // Opcional: Establecer un tiempo máximo de espera (ej. 60 segundos)
});

// --- Interceptor de Solicitud (Request) ---
axiosClient.interceptors.request.use(config => {
    // Validamos token antes de inyectar
    if (store.state.user.token) {
        config.headers.Authorization = `Bearer ${store.state.user.token}`;
    }

    const currentRoute = router.currentRoute.value;
    const currentRouteName = currentRoute?.meta?.extends || currentRoute?.name;
    if (currentRouteName && !config.headers["X-Current-Route"]) {
        config.headers["X-Current-Route"] = currentRouteName;
    }

    return config;
}, error => {
    return Promise.reject(error);
});

// --- Interceptor de Respuesta (Response) ---
axiosClient.interceptors.response.use(
    response => response,
    error => {
        const { response } = error;

        // Caso 1: Error 503 (Mantenimiento)
        if (response && response.status === 503) {
            if (router.currentRoute.value.name !== 'Maintenance') {
                router.push({ name: 'Maintenance' });
            }
            // Promesa vacía para detener la ejecución y evitar alertas innecesarias
            return new Promise(() => { });
        }

        // Caso 2: Error 401 (No autorizado / Token vencido)
        if (response && response.status === 401) {
            if (store.state.user.token) {
                store.commit("logout");
            }

            if (router.currentRoute.value.name !== 'Login') {
                router.push({ name: 'Login' });
            }
        }

        // Caso 3: Error 403 (Forbidden / Sin permisos)
        // Redirige a la vista home si el backend revoca el acceso.

        if (response && response.status === 403) {
            if (error.config?.url === SYSTEM_USERS_API_ROUTES.OBTENER_SECCIONES_ACTIVAS) {
                return Promise.reject(error);
            }

            const homeRouteName = store.state.home || sessionStorage.getItem("HOME");

            if (homeRouteName && router.currentRoute.value.name !== homeRouteName) {
                router.push({ name: homeRouteName });
                return new Promise(() => { });
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
