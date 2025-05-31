import { ApiResponse, PaginatedResponse, QueryParams } from './index';

// API error codes
export enum ApiErrorCode {
  // Authentication errors (1xx)
  INVALID_CREDENTIALS = '101',
  UNAUTHORIZED = '102',
  FORBIDDEN = '103',
  TOKEN_EXPIRED = '104',
  INVALID_TOKEN = '105',
  ACCOUNT_LOCKED = '106',
  EMAIL_NOT_VERIFIED = '107',
  TWO_FACTOR_REQUIRED = '108',
  
  // Validation errors (2xx)
  VALIDATION_ERROR = '201',
  INVALID_INPUT = '202',
  DUPLICATE_ENTITY = '203',
  ENTITY_NOT_FOUND = '204',
  INVALID_OPERATION = '205',
  
  // Server errors (3xx)
  SERVER_ERROR = '301',
  SERVICE_UNAVAILABLE = '302',
  DATABASE_ERROR = '303',
  EXTERNAL_API_ERROR = '304',
  
  // Business logic errors (4xx)
  INSUFFICIENT_FUNDS = '401',
  MARKET_CLOSED = '402',
  TRADING_RESTRICTED = '403',
  EXCEEDS_LIMIT = '404',
  PORTFOLIO_LOCKED = '405',
  
  // External service errors (5xx)
  MARKET_DATA_UNAVAILABLE = '501',
  PAYMENT_PROCESSING_ERROR = '502',
  AI_SERVICE_ERROR = '503'
}

// Common API endpoints
export enum ApiEndpoint {
  // Auth endpoints
  LOGIN = '/auth/login',
  REGISTER = '/auth/register',
  LOGOUT = '/auth/logout',
  REFRESH_TOKEN = '/auth/refresh',
  FORGOT_PASSWORD = '/auth/forgot-password',
  RESET_PASSWORD = '/auth/reset-password',
  VERIFY_EMAIL = '/auth/verify-email',
  TWO_FACTOR = '/auth/two-factor',
  
  // User endpoints
  CURRENT_USER = '/users/me',
  UPDATE_PROFILE = '/users/profile',
  UPDATE_INVESTMENT_PROFILE = '/users/investment-profile',
  CHANGE_PASSWORD = '/users/password',
  NOTIFICATIONS = '/users/notifications',
  PREFERENCES = '/users/preferences',
  RISK_ASSESSMENT = '/users/risk-assessment',
  
  // Portfolio endpoints
  PORTFOLIOS = '/portfolios',
  PORTFOLIO_BY_ID = '/portfolios/:id',
  PORTFOLIO_PERFORMANCE = '/portfolios/:id/performance',
  PORTFOLIO_REBALANCE = '/portfolios/:id/rebalance',
  POSITIONS = '/portfolios/:id/positions',
  TRANSACTIONS = '/portfolios/:id/transactions',
  TRANSACTION_BY_ID = '/transactions/:id',
  DIVIDENDS = '/portfolios/:id/dividends',
  
  // Market data endpoints
  ASSETS = '/market/assets',
  ASSET_BY_ID = '/market/assets/:id',
  ASSET_PRICE = '/market/assets/:id/price',
  ASSET_HISTORY = '/market/assets/:id/history',
  MARKET_OVERVIEW = '/market/overview',
  SCREENER = '/market/screener',
  
  // AI Advisor endpoints
  RECOMMENDATIONS = '/advisor/recommendations',
  RECOMMENDATION_BY_ID = '/advisor/recommendations/:id',
  INSIGHTS = '/advisor/insights',
  PORTFOLIO_ANALYSIS = '/advisor/analysis/:portfolioId',
  CHAT = '/advisor/chat',
  
  // Goals endpoints
  GOALS = '/goals',
  GOAL_BY_ID = '/goals/:id',
  GOAL_PROGRESS = '/goals/:id/progress',
  
  // Education endpoints
  EDUCATIONAL_CONTENT = '/education/content',
  EDUCATIONAL_ARTICLE = '/education/content/:id',
  EDUCATIONAL_CATEGORIES = '/education/categories'
}

// API request options
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: QueryParams;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

// API error response
export interface ApiErrorResponse {
  status: 'error';
  message: string;
  code: ApiErrorCode | string;
  errors?: Record<string, string[]>;
  timestamp?: string;
  path?: string;
}

// Common interfaces for GraphQL if used
export interface GraphQLRequest<T = any> {
  query: string;
  variables?: T;
  operationName?: string;
}

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
}

// API Authentication tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
  tokenType: 'Bearer';
}

// Market data API response
export interface MarketDataResponse {
  assetId: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  timestamp: string;
}

// Websocket message types
export enum WebsocketMessageType {
  PRICE_UPDATE = 'price_update',
  MARKET_UPDATE = 'market_update',
  PORTFOLIO_UPDATE = 'portfolio_update',
  NOTIFICATION = 'notification',
  RECOMMENDATION = 'recommendation',
  ERROR = 'error',
  CONNECTION_STATUS = 'connection_status'
}

// Websocket message interface
export interface WebsocketMessage<T = any> {
  type: WebsocketMessageType;
  data: T;
  timestamp: string;
}

// Websocket subscription request
export interface WebsocketSubscription {
  channel: string;
  params?: Record<string, any>;
}

// Upload file response
export interface FileUploadResponse {
  filename: string;
  url: string;
  fileSize: number;
  mimeType: string;
  uploadTimestamp: string;
}

// API health check response
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  timestamp: string;
  services: {
    database: 'ok' | 'degraded' | 'down';
    redis?: 'ok' | 'degraded' | 'down';
    marketData?: 'ok' | 'degraded' | 'down';
    mlService?: 'ok' | 'degraded' | 'down';
  };
  uptime: number; // seconds
}

// API rate limit response
export interface RateLimitResponse {
  limit: number;
  remaining: number;
  reset: number; // timestamp when the limit resets
}

// External API services (for market data, etc.)
export enum ExternalApiService {
  MARKET_DATA = 'market_data',
  NEWS = 'news',
  FINANCIAL_STATEMENTS = 'financial_statements',
  RESEARCH = 'research',
  PAYMENT_PROCESSOR = 'payment_processor'
}

// External API config (API keys, URLs, etc. - for development only)
export interface ExternalApiConfig {
  service: ExternalApiService;
  baseUrl: string;
  apiKey?: string;
  apiKeyHeaderName?: string;
  timeout?: number;
  rateLimit?: {
    requestsPerMinute: number;
    perEndpoint: boolean;
  };
}