import axios from 'axios';
const api = axios.create({
    baseURL: 'https://equipment-tracker-backend-dfso.onrender.com/api',
    //baseURL: 'http://localhost:5001/api',

    headers: {
        'Content-Type': 'application/json',
    },
});

// Decode JWT exp without depending on AuthContext — keeps this module standalone.
const isJwtExpired = (token) => {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload?.exp) return false;
        return payload.exp * 1000 < Date.now();
    } catch {
        return false; // can't decode — let the server be the authority
    }
};

// Guard so a flurry of failing requests doesn't fire the logout multiple times.
let forceLogoutInFlight = false;

const triggerForceLogout = (reason) => {
    if (forceLogoutInFlight) return;
    forceLogoutInFlight = true;
    console.warn("Session ended — forcing logout:", reason);
    if (typeof window === 'undefined') return;
    const dispatched = window.dispatchEvent(new CustomEvent('auth:force-logout', {
        detail: { reason },
    }));
    if (!dispatched) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && isJwtExpired(token)) {
        // Token already dead — don't bother round-tripping. Kick off logout and
        // reject locally so the caller's catch still runs.
        triggerForceLogout('Your session has expired. Please log in again.');
        return Promise.reject(new axios.Cancel('Token expired'));
    }
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
        if (axios.isCancel(error)) return Promise.reject(error);
        const status = error.response?.status;

        // 401 means the session/token is invalid, missing, or expired.
        // 403 stays "authenticated but not allowed for this resource" — don't logout there.
        if (status === 401) {
            triggerForceLogout('Your session has expired. Please log in again.');
        }
        return Promise.reject(error);
    }
);

export default api;
