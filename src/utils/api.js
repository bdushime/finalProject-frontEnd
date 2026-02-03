import axios from 'axios';

// 1. Create the Axios instance
const api = axios.create({
    // This points to your LIVE Render Backend
    baseURL: 'https://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Add the Interceptor (The Security Guard)
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

export default api;