import api from "./api";

// Use the relative api instance so the Vite dev proxy can forward requests to the backend
// and avoid CORS during local development.
const register = (user) => api.post(`/api/auth/register`, user);
const login = (credentials) => api.post(`/api/auth/login`, credentials);

export default { register, login };
