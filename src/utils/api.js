import axios from 'axios';

// 1. Create the Axios instance
const api = axios.create({
    // This points to your LOCAL LAN Backend (IoT Device)

    // This points to your LIVE Render Backend
    baseURL: 'https://equipment-tracker-backend-dfso.onrender.com/api',

    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Add the Request Interceptor (The Security Guard)
// This automatically grabs the token from storage and attaches it to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 3. Add Response Interceptor (Handle Token Expiration/403)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn("Session expired or unauthorized. Redirecting to login...");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login if window is available
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;