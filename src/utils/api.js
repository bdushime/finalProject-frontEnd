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

// Guard so a flurry of failing requests doesn't fire the logout multiple times.
let forceLogoutInFlight = false;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        // Only 401 means the session/token is invalid or missing. 403 means "authenticated but
        // not allowed for this resource" — clearing storage here logged IT staff out when e.g.
        // /analytics/dashboard returned 403 while their JWT was still valid.
        if (status === 401 && !forceLogoutInFlight) {
            forceLogoutInFlight = true;
            console.warn("Session expired or unauthorized. Redirecting to login...");

            if (typeof window !== 'undefined') {
                // Hand control to AuthContext so the toast + redirect flow stays in one place.
                // If AuthContext isn't mounted (rare), fall back to a hard redirect.
                const dispatched = window.dispatchEvent(new CustomEvent('auth:force-logout', {
                    detail: { reason: 'Your session is invalid. Please log in again.' }
                }));
                if (!dispatched) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
