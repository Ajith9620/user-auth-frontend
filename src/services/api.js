import axios from 'axios';

// Use a relative base URL so Vite dev server proxy (configured in vite.config.js)
// can forward API requests to the backend and avoid CORS during development.
const api = axios.create({
  baseURL: '/',
});

export default api;
