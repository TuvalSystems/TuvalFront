import axios from 'axios';

const axiosPublic = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
    headers: {
        'Accept': 'application/json',
      
    },
});

export default axiosPublic;