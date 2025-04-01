import axios from 'axios';
import store from './store';

const axiosPrint = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`, //http://172.30.1.7/api,
    headers: {
        "Access-Control-Allow-Origin": "*",
        'Content-Type': 'application/json',
    },
    responseType: 'blob',
})

axiosPrint.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${store.state.user.token}`;
    return config;
})

export default axiosPrint;