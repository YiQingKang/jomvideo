import axios from 'axios';

const api = axios.create({
  baseURL: "",
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          return new Promise((resolve, reject) => {
            axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, {
              refreshToken,
            })
            .then(res => {
              localStorage.setItem('token', res.data.token);
              localStorage.setItem('refreshToken', res.data.refreshToken);
              api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
              processQueue(null, res.data.token);
              resolve(api(originalRequest));
            })
            .catch(err => {
              processQueue(err, null);
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              // No redirect here
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
          });
        }

        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      } else {
        // No refresh token, do not redirect here
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }

    return Promise.reject(error);
  }
);

export default api;