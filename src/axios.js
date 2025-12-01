import axios from 'axios';
import store from './store';
import router from './router';


const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`, //http://172.30.1.7/api,
    headers: {
        // "Access-Control-Allow-Origin": "*",
        'Content-Type': 'application/json',
    }
})

axiosClient.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${store.state.user.token}`;
    return config;
})


axiosClient.interceptors.response.use(
    response => response,
    error => {
        // Si la API devuelve 503 (Service Unavailable / Mantenimiento)
        if (error.response && error.response.status === 503) {

            // Verificamos si ya estamos en la página de mantenimiento para evitar loops
            if (router.currentRoute.value.name !== 'Maintenance') {
                router.push({ name: 'Maintenance' });
            }

            // Retornamos una promesa vacía ("pendiente para siempre")
            // Esto sirve para detener la cadena de errores. Así tus componentes
            // (ej. el formulario de login) NO mostrarán alertas rojas de "Error"
            // justo antes de cambiar de página.
            return new Promise(() => { });
        }

        // Para cualquier otro error (401, 422, 500), dejamos que fluya normal
        return Promise.reject(error);
    }
);

export default axiosClient;