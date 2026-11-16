import axios from 'axios';
import { REQUEST_TIMEOUT } from '@/constants/requestOptions';
import { normalizeRequestError } from '@/utils/requestError';

const axiosPublic = axios.create({
    timeout: REQUEST_TIMEOUT,
    baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
    headers: {
        'Accept': 'application/json',
      
    },
});

axiosPublic.interceptors.response.use(
    response => response,
    error => Promise.reject(normalizeRequestError(error)),
);

export default axiosPublic;
