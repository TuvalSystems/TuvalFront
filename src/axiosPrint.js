import { iniciarSolicitud, finalizarSolicitud } from "@/utils/puntoVentaRequests";
import axios from 'axios';
import store from './store';
import router from './router';
import { PRINT_REQUEST_TIMEOUT } from '@/constants/requestOptions';
import { normalizeRequestError } from '@/utils/requestError';

const axiosPrint = axios.create({
    timeout: PRINT_REQUEST_TIMEOUT,
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`, //http://172.30.1.7/api,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    responseType: 'blob',
})

function isPasswordChangeResponse(response) {
    const data = response?.data || {};
    const message = `${data.error || ""} ${data.message || ""}`;

    return response?.status === 403 && message.includes("Debe cambiar su contraseña");
}

function redirectToPasswordChange() {
    store.commit("setMustChangePassword", true);

    if (router.currentRoute.value.name !== 'password-change') {
        router.push({ name: 'password-change' });
    }
}

axiosPrint.interceptors.request.use(config => {
    if (store.state.user.token) {
        config.headers.Authorization = `Bearer ${store.state.user.token}`;
    }

    const currentRoute = router.currentRoute.value;
    const currentRouteName = currentRoute?.meta?.extends || currentRoute?.name;
    if (currentRouteName && !config.headers["X-Current-Route"]) {
        config.headers["X-Current-Route"] = currentRouteName;
    }

    return iniciarSolicitud(config);
}, error => {
    return Promise.reject(error);
})

axiosPrint.interceptors.response.use(
    response => {
        finalizarSolicitud(response.config);
        return response;
    },
    error => {
        finalizarSolicitud(error.config);
        normalizeRequestError(error);
        const { response } = error;

        if (response && response.status === 503 && !error.config?.skipMaintenanceRedirect) {
            if (router.currentRoute.value.name !== 'Maintenance') {
                router.push({ name: 'Maintenance' });
            }

            error.handledByRedirect = true;
            return Promise.reject(error);
        }

        if (response && response.status === 401) {
            if (store.state.user.token) {
                store.commit("logout");
            }

            if (router.currentRoute.value.name !== 'Login') {
                router.push({ name: 'Login' });
            }
        }

        if (response && response.status === 403) {
            if (isPasswordChangeResponse(response)) {
                redirectToPasswordChange();
                return Promise.reject(error);
            }

            const homeRouteName = store.state.home || sessionStorage.getItem("HOME");

            if (homeRouteName && router.currentRoute.value.name !== homeRouteName) {
                router.push({ name: homeRouteName });
                error.handledByRedirect = true;
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosPrint;
