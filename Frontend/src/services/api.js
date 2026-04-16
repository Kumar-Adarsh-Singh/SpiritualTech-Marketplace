import axios from 'axios';

const api = axios.create({
  baseURL: '/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const tokens = localStorage.getItem('tokens');
    if (tokens) {
      const { access } = JSON.parse(tokens);
      if (access) {
        config.headers.Authorization = `Bearer ${access}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const tokens = localStorage.getItem('tokens');
      if (tokens) {
        const { refresh } = JSON.parse(tokens);
        if (refresh) {
          try {
            const res = await axios.post('/api/auth/token/refresh/', { refresh });
            const newTokens = {
              access: res.data.access,
              refresh: res.data.refresh,
            };
            localStorage.setItem('tokens', JSON.stringify(newTokens));
            originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
            return api(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('tokens');
            localStorage.removeItem('user');
            window.location.href = '/';
            return Promise.reject(refreshError);
          }
        }
      }

      localStorage.removeItem('tokens');
      localStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

export default api;
