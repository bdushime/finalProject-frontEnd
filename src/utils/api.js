import axios from 'axios';
const api = axios.create({
    // baseURL: 'https://equipment-tracker-backend-dfso.onrender.com/api',
    baseURL: 'http://localhost:5001/api',

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
        const errorCode = error.response?.data?.code;

        // During first login, backend may block protected actions with 403 + PASSWORD_RESET_REQUIRED.
        // Keep the user authenticated so the profile-completion modal can finish.
        if (status === 403 && errorCode === "PASSWORD_RESET_REQUIRED") {
            return Promise.reject(error);
        }

        if (status === 401 || status === 403) {
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