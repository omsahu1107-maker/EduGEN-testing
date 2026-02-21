import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('edugen_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401s globally — but NOT for auth endpoints (login/register/me)
// otherwise login failures would cause an infinite redirect loop
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/me'];

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const url = err.config?.url || '';
        const isAuthEndpoint = AUTH_ENDPOINTS.some(ep => url.includes(ep));

        if (err.response?.status === 401 && !isAuthEndpoint) {
            // Clear everything
            localStorage.clear();

            // Redirect to login only if not already on an auth page
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                window.location.href = '/login?expired=true';
            }
        }
        return Promise.reject(err);
    }
);

export default api;
