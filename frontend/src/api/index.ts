import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';
const ML_SERVICE_URL = process.env.REACT_APP_ML_SERVICE_URL || 'http://localhost:8001/api/v1';

// Create axios instances
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const mlClient: AxiosInstance = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 30000, // ML operations might take longer
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

mlClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Handle unauthorized access
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
  
  if (error.response?.status === 429) {
    // Handle rate limiting
    console.warn('Rate limit exceeded. Please try again later.');
  }
  
  return Promise.reject(error);
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  handleApiError
);

mlClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  handleApiError
);

// Generic API response type
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

// Generic error response type
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}

export default apiClient;