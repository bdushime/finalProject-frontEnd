import axios from 'axios';
const api = axios.create({
    baseURL: 'https://equipment-tracker-backend-dfso.onrender.com/api',
    // baseURL: 'http://localhost:5001/api',

    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        // Only 401 means the session/token is invalid or missing. 403 means "authenticated but
        // not allowed for this resource" — clearing storage here logged IT staff out when e.g.
        // /analytics/dashboard returned 403 while their JWT was still valid.
        if (status === 401) {
            console.warn("Session expired or unauthorized. Redirecting to login...");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
