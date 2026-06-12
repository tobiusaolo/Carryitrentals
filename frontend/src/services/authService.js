import axios from 'axios';
import {
  buildKey,
  isCacheable,
  getCached,
  setCached,
  getInflight,
  setInflight,
  invalidate,
  clearCache,
  getCacheTTL,
  peekCachedData,
} from './apiCache';

import { normalizeApiBaseUrl } from '../config/api';

const API_BASE_URL = normalizeApiBaseUrl(
  process.env.REACT_APP_API_URL || 'https://carryit-backend-su8h.onrender.com/api/v1'
);

/** Collection routes are registered with a trailing slash on the backend. */
function withCollectionTrailingSlash(url = '') {
  const [path, query = ''] = url.split('?');
  if (/^\/[^/]+$/.test(path)) {
    return `${path}/${query ? `?${query}` : ''}`;
  }
  return url;
}



class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.isRefreshing = false;
    this.failedQueue = [];
    this._apiClient = null;
    this._refreshPromise = null;
    this._sessionPromise = null;
  }

  refreshTokenFromStorage() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  getTokenExpiryMs(token) {
    if (!token) return 0;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : 0;
    } catch {
      return 0;
    }
  }

  async ensureValidSession() {
    if (this._sessionPromise) {
      return this._sessionPromise;
    }

    this._sessionPromise = this._ensureValidSessionInner().finally(() => {
      this._sessionPromise = null;
    });
    return this._sessionPromise;
  }

  async _ensureValidSessionInner() {
    this.refreshTokenFromStorage();
    const token = localStorage.getItem('token');
    const refresh = localStorage.getItem('refresh_token');

    if (!token && refresh) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        this.token = newToken;
        localStorage.setItem('token', newToken);
      }
      return !!newToken;
    }

    if (!token) {
      return false;
    }

    const expiresAt = this.getTokenExpiryMs(token);
    const refreshSoon = expiresAt > 0 && expiresAt - Date.now() < 2 * 60 * 1000;
    if (refreshSoon && refresh) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        this.token = newToken;
        localStorage.setItem('token', newToken);
      }
    }

    return true;
  }

  getApiClient() {
    if (this._apiClient) {
      return this._apiClient;
    }

    const isProduction = API_BASE_URL.includes('onrender.com') || API_BASE_URL.includes('render.com');
    const timeout = isProduction ? 180000 : 120000;

    const instance = axios.create({
      baseURL: API_BASE_URL,
      timeout,
    });

    instance.interceptors.request.use(
      (config) => {
        if (config.url) {
          config.url = withCollectionTrailingSlash(config.url);
        }
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        // Only set Content-Type for non-blob requests
        if (!config.responseType || config.responseType !== 'blob') {
          config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
        }

        // Log request for debugging (only in development or for errors)
        if (process.env.NODE_ENV === 'development') {
          console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
            baseURL: config.baseURL,
            timeout: config.timeout
          });
        }

        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    instance.interceptors.response.use(
      (response) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Enhanced error logging
        if (error.response) {
          // Server responded with error status
          console.error(`❌ API Error [${error.response.status}]:`, {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            message: error.message
          });
        } else if (error.request) {
          // Request was made but no response received
          console.error('❌ Network Error - No response received:', {
            url: error.config?.url,
            method: error.config?.method,
            message: error.message,
            code: error.code,
            timeout: error.config?.timeout
          });

          // For timeout errors, provide helpful message
          if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.warn('⏱️ Request timeout - This might be due to a cold start on the deployed server');
          }
        } else {
          // Error setting up request
          console.error('❌ Request Setup Error:', error.message);
        }

        const isAuthEndpoint = originalRequest?.url?.includes('/auth/refresh')
          || originalRequest?.url?.includes('/auth/login');

        if (
          error.response?.status === 401
          && originalRequest
          && !originalRequest._authRetry
          && !isAuthEndpoint
        ) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((newToken) => {
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return instance(originalRequest);
            });
          }

          originalRequest._authRetry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              this.token = newToken;
              localStorage.setItem('token', newToken);
              this.processQueue(null, newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return instance(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        if (
          !error.response
          && originalRequest
          && originalRequest.method?.toLowerCase() === 'get'
        ) {
          originalRequest._networkRetries = (originalRequest._networkRetries || 0) + 1;
          if (originalRequest._networkRetries <= 2) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * originalRequest._networkRetries));
            await this.ensureValidSession();
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
              originalRequest.headers.Authorization = `Bearer ${currentToken}`;
            }
            return instance(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );

    const rawGet = instance.get.bind(instance);
    instance._rawGet = rawGet;
    instance.get = (url, config = {}) => this.cachedGet(url, config, rawGet);

    this._apiClient = instance;
    return instance;
  }

  createAxiosInstance() {
    return this.getApiClient();
  }

  /** Synchronous read of cached GET payload (if any). */
  peekGet(url, config = {}) {
    return peekCachedData(buildKey(url, config));
  }

  async cachedGet(url, config = {}, rawGet) {
    const getter = rawGet || this.getApiClient()._rawGet;
    const cacheEnabled = isCacheable(url, config);

    if (!cacheEnabled) {
      return getter(url, config);
    }

    const key = buildKey(url, config);
    const ttl = config.cacheTTL || getCacheTTL(url);

    if (!config.forceRefresh) {
      const cached = getCached(key);
      if (cached) {
        return Promise.resolve(cached);
      }
      const pending = getInflight(key);
      if (pending) {
        return pending;
      }
    }

    const request = getter(url, config).then((response) => {
      setCached(key, response, ttl);
      return response;
    });

    return setInflight(key, request);
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  async register(userData) {
    try {
      console.log('AuthService: Attempting registration to:', `${API_BASE_URL}/auth/register`);
      console.log('AuthService: Registration data:', userData);

      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);

      console.log('AuthService: Registration response:', response.data);

      return { success: true, data: response.data };
    } catch (error) {
      console.error('AuthService: Registration error:', error);
      console.error('AuthService: Error response:', error.response?.data);
      console.error('AuthService: Error status:', error.response?.status);
      console.error('AuthService: Error message:', error.message);

      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Registration failed'
      };
    }
  }

  async login(email, password) {
    try {
      console.log('AuthService: Attempting login to:', `${API_BASE_URL}/auth/login`);
      console.log('AuthService: Login data:', { email, password });

      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      console.log('AuthService: Login response:', response.data);

      const { access_token, refresh_token } = response.data;

      this.token = access_token;
      this.refreshToken = refresh_token;

      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      clearCache();

      return { success: true, data: response.data };
    } catch (error) {
      console.error('AuthService: Login error:', error);
      console.error('AuthService: Error response:', error.response?.data);
      console.error('AuthService: Error status:', error.response?.status);
      console.error('AuthService: Error message:', error.message);

      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Login failed'
      };
    }
  }

  async refreshAccessToken() {
    this.refreshTokenFromStorage();
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    if (this._refreshPromise) {
      return this._refreshPromise;
    }

    this._refreshPromise = axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: this.refreshToken,
    }).then((response) => {
      const { access_token, refresh_token: nextRefresh } = response.data;
      if (nextRefresh) {
        this.refreshToken = nextRefresh;
        localStorage.setItem('refresh_token', nextRefresh);
      }
      return access_token;
    }).finally(() => {
      this._refreshPromise = null;
    });

    return this._refreshPromise;
  }

  async refreshToken() {
    try {
      const access_token = await this.refreshAccessToken();
      if (!access_token) {
        return { success: false, error: 'Token refresh failed' };
      }
      this.token = access_token;
      localStorage.setItem('token', access_token);
      return { success: true, data: { access_token } };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Token refresh failed',
        status: error.response?.status,
      };
    }
  }

  async getCurrentUser() {
    try {
      await this.ensureValidSession();
      const api = this.getApiClient();
      const response = await api.get('/auth/me');
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to get user',
        status: error.response?.status,
        isNetworkError: !error.response,
      };
    }
  }

  logout() {
    // Get user role before clearing storage
    const userStr = localStorage.getItem('user');
    let userRole = null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userRole = String(user.role || '').toLowerCase();
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }

    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // Never serve a previous user's cached responses to the next session.
    clearCache();

    // Redirect to appropriate login page based on role
    const currentPath = window.location.pathname;

    if (userRole === 'agent' || currentPath.startsWith('/agent')) {
      if (currentPath !== '/agent-login') {
        window.location.href = '/agent-login';
      }
    } else if (userRole === 'admin' || currentPath.startsWith('/admin')) {
      if (currentPath !== '/admin-login') {
        window.location.href = '/admin-login';
      }
    } else {
      if (currentPath !== '/login') {
        window.location.href = '/login';
      }
    }
  }

  isAuthenticated() {
    this.refreshTokenFromStorage();
    return !!(this.token || localStorage.getItem('token'));
  }

  getToken() {
    this.refreshTokenFromStorage();
    return this.token;
  }

  getStoredUser() {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // API methods with automatic authentication
  //
  // GET requests are cached in memory by default (see apiCache.js). Per-call
  // overrides via the axios `config` object:
  //   - cache: false        -> bypass the cache entirely for this request
  //   - cacheTTL: <ms>       -> custom time-to-live for this entry
  //   - forceRefresh: true   -> ignore any cached value but store the fresh one
  async get(url, config = {}) {
    await this.ensureValidSession();
    return this.cachedGet(url, config);
  }

  async post(url, data, config = {}) {
    await this.ensureValidSession();
    const api = this.getApiClient();
    const response = await api.post(url, data, config);
    this.invalidateCache(config);
    return response;
  }

  async put(url, data, config = {}) {
    await this.ensureValidSession();
    const api = this.getApiClient();
    const response = await api.put(url, data, config);
    this.invalidateCache(config);
    return response;
  }

  async delete(url, config = {}) {
    await this.ensureValidSession();
    const api = this.getApiClient();
    const response = await api.delete(url, config);
    this.invalidateCache(config);
    return response;
  }

  async patch(url, data, config = {}) {
    await this.ensureValidSession();
    const api = this.getApiClient();
    const response = await api.patch(url, data, config);
    this.invalidateCache(config);
    return response;
  }

  // After any write, drop cached GETs so subsequent reads are fresh.
  // Pass `config.invalidate` (string/RegExp) to scope invalidation to a
  // resource; otherwise the whole cache is cleared for safety.
  invalidateCache(config = {}) {
    invalidate(config.invalidate);
  }

  // Expose cache controls for components that need explicit control.
  clearApiCache() {
    clearCache();
  }

  invalidateApiCache(matcher) {
    invalidate(matcher);
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
