// Re-export all type definitions for easier imports
export * from './user.types';
export * from './portfolio.types';
export * from './api.types';

// Common types used across the application

// Common response structure for API requests
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Pagination data structure
export interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

// Response with pagination
export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationData;
}

// State status for async operations
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

// Base slice state with loading states and error handling
export interface BaseState<T> {
  data: T;
  status: LoadingState;
  error: string | null;
  lastUpdated: number | null;
}

// Theme options
export type ThemeMode = 'light' | 'dark' | 'system';

// Navigation item structure for sidebar and menus
export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon?: string;
  subItems?: NavigationItem[];
  requiresAuth?: boolean;
  permissions?: string[];
}

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Notification structure
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

// Chart data point with timestamp
export interface TimeSeriesDataPoint {
  timestamp: string | number;
  value: number;
  [key: string]: any; // Additional properties
}

// Time period options for charts and data
export type TimePeriod = '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | '5y' | 'all';

// Currency type
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF';

// Sorting direction
export type SortDirection = 'asc' | 'desc';

// Filter operation
export type FilterOperation = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';

// Filter criteria
export interface FilterCriteria {
  field: string;
  operation: FilterOperation;
  value: any;
}

// Sort criteria
export interface SortCriteria {
  field: string;
  direction: SortDirection;
}

// Query parameters for API requests
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: SortCriteria[];
  filters?: FilterCriteria[];
  search?: string;
  expand?: string[]; // Relations to expand
}

// Custom error with code and data
export class AppError extends Error {
  code: string;
  data?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', data?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.data = data;
  }
}