import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://carryit-backend.onrender.com/api/v1';



class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // Method to refresh token from localStorage
  refreshTokenFromStorage() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refresh_token');
    console.log('🔄 AuthService token refreshed from storage:', this.token ? 'EXISTS' : 'MISSING');
  }

  // Create axios instance with proper configuration
  createAxiosInstance() {
    // Increase timeout for deployed API (Render.com can be slow on cold starts)
    const isProduction = API_BASE_URL.includes('onrender.com') || API_BASE_URL.includes('render.com');
    const timeout = isProduction ? 180000 : 120000; // 3 minutes for production, 2 minutes for local
    
    const instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: timeout,
    });

    // Request interceptor
    instance.interceptors.request.use(
      (config) => {
        // Always get fresh token from localStorage
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
          console.log('🔑 Token attached to request:', currentToken.substring(0, 20) + '...');
        } else {
          console.warn('⚠️ No token found in localStorage');
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

        // Handle 401 Unauthorized - token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return instance(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              this.token = newToken;
              localStorage.setItem('token', newToken);
              
              // Process failed queue
              this.processQueue(null, newToken);
              
              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              console.log('🔄 Retrying request after token refresh');
              return instance(originalRequest);
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            this.processQueue(refreshError, null);
            this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // For network errors or timeouts, add retry logic for GET requests
        if (
          (!error.response && originalRequest && !originalRequest._retryCount) &&
          originalRequest.method?.toLowerCase() === 'get'
        ) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          if (originalRequest._retryCount <= 2) {
            console.log(`🔄 Retrying request (attempt ${originalRequest._retryCount}/2)...`);
            // Wait a bit before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retryCount));
            return instance(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );

    return instance;
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
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: this.refreshToken
      });

      const { access_token } = response.data;
      return access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const api = this.createAxiosInstance();
      const response = await api.get('/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get current user error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get user' 
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
    return !!this.token;
  }

  getToken() {
    return this.token;
  }

  // API methods with automatic authentication
  async get(url, config = {}) {
    const api = this.createAxiosInstance();
    return api.get(url, config);
  }

  async post(url, data, config = {}) {
    const api = this.createAxiosInstance();
    return api.post(url, data, config);
  }

  async put(url, data, config = {}) {
    const api = this.createAxiosInstance();
    return api.put(url, data, config);
  }

  async delete(url, config = {}) {
    const api = this.createAxiosInstance();
    return api.delete(url, config);
  }

  async patch(url, data, config = {}) {
    const api = this.createAxiosInstance();
    return api.patch(url, data, config);
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
