import apiClient from './index';
import { ApiEndpoint } from '../types/api.types';
import { 
  Asset, 
  AssetType, 
  AssetClass,
  Sector,
  MarketDataInterval,
  TransactionType,
  TimeSeriesDataPoint
} from '../types/portfolio.types';
import { 
  ApiResponse, 
  PaginatedResponse, 
  QueryParams, 
  TimePeriod,
  Currency,
  FilterCriteria,
  SortCriteria
} from '../types/index';

// Investment API request types
interface SearchAssetsRequest extends QueryParams {
  query?: string;
  assetType?: AssetType;
  assetClass?: AssetClass;
  sector?: Sector;
  country?: string;
  exchange?: string;
  minPrice?: number;
  maxPrice?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  minVolume?: number;
  currency?: Currency;
}

interface AssetScreenerRequest extends QueryParams {
  assetType?: AssetType[];
  assetClass?: AssetClass[];
  sectors?: Sector[];
  countries?: string[];
  exchanges?: string[];
  priceRange?: { min: number; max: number };
  marketCapRange?: { min: number; max: number };
  volumeRange?: { min: number; max: number };
  peRatioRange?: { min: number; max: number };
  dividendYieldRange?: { min: number; max: number };
  betaRange?: { min: number; max: number };
  riskLevelRange?: { min: 1; max: 5 };
  performanceFilters?: {
    period: TimePeriod;
    minReturn?: number;
    maxReturn?: number;
  };
  fundamentalFilters?: {
    profitMargin?: { min?: number; max?: number };
    debtToEquity?: { min?: number; max?: number };
    roe?: { min?: number; max?: number };
    currentRatio?: { min?: number; max?: number };
  };
}

interface WatchlistRequest {
  name: string;
  description?: string;
  assetIds?: string[];
  isPublic?: boolean;
}

interface PriceAlertRequest {
  assetId: string;
  alertType: 'price_above' | 'price_below' | 'price_change_percent' | 'volume_spike';
  targetValue: number;
  condition?: 'once' | 'recurring';
  expiresAt?: string;
  notificationMethods: ('email' | 'push' | 'sms')[];
}

interface MarketOrderRequest {
  portfolioId: string;
  assetId: string;
  orderType: 'buy' | 'sell';
  orderMethod: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  limitPrice?: number;
  stopPrice?: number;
  timeInForce?: 'day' | 'gtc' | 'ioc' | 'fok'; // Good Till Canceled, Immediate or Cancel, Fill or Kill
  notes?: string;
}

// Market data types
interface MarketDataPoint {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  lastTradeTime: string;
  marketStatus: 'open' | 'closed' | 'pre_market' | 'after_hours';
  dayHigh: number;
  dayLow: number;
  week52High: number;
  week52Low: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
}

// Investment API response types
interface AssetsResponse extends PaginatedResponse<Asset[]> {}
interface AssetResponse extends ApiResponse<Asset> {}
interface AssetDetailsResponse extends ApiResponse<Asset & {
  fundamentals?: {
    marketCap: number;
    peRatio: number;
    pegRatio: number;
    priceToBook: number;
    priceToSales: number;
    enterpriseValue: number;
    evToRevenue: number;
    evToEbitda: number;
    profitMargin: number;
    operatingMargin: number;
    returnOnEquity: number;
    returnOnAssets: number;
    debtToEquity: number;
    currentRatio: number;
    quickRatio: number;
    earningsPerShare: number;
    bookValuePerShare: number;
    tangibleBookValuePerShare: number;
    sharesOutstanding: number;
    floatShares: number;
    sharesShort: number;
    shortRatio: number;
    institutionalOwnership: number;
    beta: number;
    analystTargetPrice: number;
    analystRecommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  };
  technicals?: {
    sma20: number;
    sma50: number;
    sma200: number;
    ema12: number;
    ema26: number;
    rsi: number;
    macd: number;
    macdSignal: number;
    macdHistogram: number;
    bollingerUpper: number;
    bollingerLower: number;
    stochasticK: number;
    stochasticD: number;
    williamsR: number;
    adx: number;
    cci: number;
    support: number[];
    resistance: number[];
  };
  news?: Array<{
    id: string;
    title: string;
    summary: string;
    url: string;
    source: string;
    publishedAt: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
}> {}

interface PriceHistoryResponse extends ApiResponse<{
  symbol: string;
  interval: MarketDataInterval;
  data: TimeSeriesDataPoint[];
  adjustedForDividends: boolean;
  adjustedForSplits: boolean;
}> {}

interface MarketOverviewResponse extends ApiResponse<{
  indices: Array<{
    symbol: string;
    name: string;
    value: number;
    change: number;
    changePercent: number;
  }>;
  topGainers: Asset[];
  topLosers: Asset[];
  mostActive: Asset[];
  sectorPerformance: Array<{
    sector: Sector;
    change: number;
    changePercent: number;
    topPerformer: Asset;
  }>;
  marketStats: {
    advancingStocks: number;
    decliningStocks: number;
    unchangedStocks: number;
    newHighs: number;
    newLows: number;
    totalVolume: number;
    marketCap: number;
  };
}> {}

interface WatchlistResponse extends ApiResponse<{
  id: string;
  name: string;
  description?: string;
  assets: Asset[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}> {}

interface PriceAlertResponse extends ApiResponse<{
  id: string;
  assetId: string;
  asset: Asset;
  alertType: string;
  targetValue: number;
  currentValue: number;
  isTriggered: boolean;
  triggeredAt?: string;
  condition: string;
  expiresAt?: string;
  notificationMethods: string[];
  createdAt: string;
}> {}

interface MarketOrderResponse extends ApiResponse<{
  orderId: string;
  portfolioId: string;
  asset: Asset;
  orderType: string;
  orderMethod: string;
  quantity: number;
  limitPrice?: number;
  stopPrice?: number;
  status: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected';
  filledQuantity: number;
  averageFillPrice?: number;
  estimatedCost: number;
  fees: number;
  timeInForce: string;
  placedAt: string;
  updatedAt: string;
}> {}

export const investmentAPI = {
  // Search assets
  searchAssets: async (params: SearchAssetsRequest): Promise<PaginatedResponse<Asset[]>> => {
    const response = await apiClient.get<AssetsResponse>(ApiEndpoint.ASSETS, { params });
    return response.data;
  },

  // Get asset by ID or symbol
  getAsset: async (assetId: string): Promise<Asset> => {
    const url = ApiEndpoint.ASSET_BY_ID.replace(':id', assetId);
    const response = await apiClient.get<AssetResponse>(url);
    return response.data.data!;
  },

  // Get detailed asset information
  getAssetDetails: async (assetId: string): Promise<AssetDetailsResponse['data']> => {
    const url = ApiEndpoint.ASSET_BY_ID.replace(':id', assetId);
    const response = await apiClient.get<AssetDetailsResponse>(`${url}/details`);
    return response.data.data!;
  },

  // Get asset price history
  getPriceHistory: async (
    assetId: string, 
    period: TimePeriod = '1y', 
    interval: MarketDataInterval = '1d'
  ): Promise<PriceHistoryResponse['data']> => {
    const url = ApiEndpoint.ASSET_HISTORY.replace(':id', assetId);
    const response = await apiClient.get<PriceHistoryResponse>(url, {
      params: { period, interval }
    });
    return response.data.data!;
  },

  // Get current asset price
  getAssetPrice: async (assetId: string): Promise<ApiResponse<{
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    bid: number;
    ask: number;
    bidSize: number;
    askSize: number;
    lastTradeTime: string;
    marketStatus: 'open' | 'closed' | 'pre_market' | 'after_hours';
  }>['data']> => {
    const url = ApiEndpoint.ASSET_PRICE.replace(':id', assetId);
    const response = await apiClient.get<ApiResponse<{
      symbol: string;
      price: number;
      change: number;
      changePercent: number;
      volume: number;
      bid: number;
      ask: number;
      bidSize: number;
      askSize: number;
      lastTradeTime: string;
      marketStatus: 'open' | 'closed' | 'pre_market' | 'after_hours';
    }>>(url);
    return response.data.data!;
  },

  // Get market data for multiple symbols
  getMarketData: async (symbols: string[]): Promise<MarketDataPoint[]> => {
    const response = await apiClient.post<ApiResponse<MarketDataPoint[]>>('/market/data', {
      symbols
    });
    return response.data.data!;
  },

  // Asset screener
  screenAssets: async (criteria: AssetScreenerRequest): Promise<PaginatedResponse<Asset[]>> => {
    const response = await apiClient.post<AssetsResponse>(ApiEndpoint.SCREENER, criteria);
    return response.data;
  },

  // Get market overview
  getMarketOverview: async (): Promise<MarketOverviewResponse['data']> => {
    const response = await apiClient.get<MarketOverviewResponse>(ApiEndpoint.MARKET_OVERVIEW);
    return response.data.data!;
  },

  // Get trending assets
  getTrendingAssets: async (period: TimePeriod = '1d', limit: number = 20): Promise<Asset[]> => {
    const response = await apiClient.get<ApiResponse<Asset[]>>('/market/trending', {
      params: { period, limit }
    });
    return response.data.data!;
  },

  // Get similar assets
  getSimilarAssets: async (assetId: string, limit: number = 10): Promise<Asset[]> => {
    const response = await apiClient.get<ApiResponse<Asset[]>>(`/market/assets/${assetId}/similar`, {
      params: { limit }
    });
    return response.data.data!;
  },

  // Get sector analysis
  getSectorAnalysis: async (sector: Sector, period: TimePeriod = '1y'): Promise<ApiResponse<{
    sector: Sector;
    performance: {
      return: number;
      returnPercent: number;
      volatility: number;
      sharpeRatio: number;
    };
    topPerformers: Asset[];
    worstPerformers: Asset[];
    avgPeRatio: number;
    avgDividendYield: number;
    totalMarketCap: number;
    news: Array<{
      title: string;
      summary: string;
      url: string;
      publishedAt: string;
    }>;
  }>['data']> => {
    const response = await apiClient.get<ApiResponse<{
      sector: Sector;
      performance: {
        return: number;
        returnPercent: number;
        volatility: number;
        sharpeRatio: number;
      };
      topPerformers: Asset[];
      worstPerformers: Asset[];
      avgPeRatio: number;
      avgDividendYield: number;
      totalMarketCap: number;
      news: Array<{
        title: string;
        summary: string;
        url: string;
        publishedAt: string;
      }>;
    }>>(`/market/sectors/${sector}/analysis`, {
      params: { period }
    });
    return response.data.data!;
  },

  // Watchlist management
  getWatchlists: async (): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description?: string;
    assetCount: number;
    isPublic: boolean;
    createdAt: string;
  }>>['data']> => {
    const response = await apiClient.get<ApiResponse<Array<{
      id: string;
      name: string;
      description?: string;
      assetCount: number;
      isPublic: boolean;
      createdAt: string;
    }>>>('/watchlists');
    return response.data.data!;
  },

  getWatchlist: async (watchlistId: string): Promise<WatchlistResponse['data']> => {
    const response = await apiClient.get<WatchlistResponse>(`/watchlists/${watchlistId}`);
    return response.data.data!;
  },

  createWatchlist: async (data: WatchlistRequest): Promise<WatchlistResponse['data']> => {
    const response = await apiClient.post<WatchlistResponse>('/watchlists', data);
    return response.data.data!;
  },

  updateWatchlist: async (watchlistId: string, data: Partial<WatchlistRequest>): Promise<WatchlistResponse['data']> => {
    const response = await apiClient.put<WatchlistResponse>(`/watchlists/${watchlistId}`, data);
    return response.data.data!;
  },

  deleteWatchlist: async (watchlistId: string): Promise<void> => {
    await apiClient.delete(`/watchlists/${watchlistId}`);
  },

  addToWatchlist: async (watchlistId: string, assetId: string): Promise<void> => {
    await apiClient.post(`/watchlists/${watchlistId}/assets`, { assetId });
  },

  removeFromWatchlist: async (watchlistId: string, assetId: string): Promise<void> => {
    await apiClient.delete(`/watchlists/${watchlistId}/assets/${assetId}`);
  },

  // Price alerts
  getPriceAlerts: async (): Promise<PriceAlertResponse['data'][]> => {
    const response = await apiClient.get<ApiResponse<PriceAlertResponse['data'][]>>('/price-alerts');
    return response.data.data!;
  },

  createPriceAlert: async (data: PriceAlertRequest): Promise<PriceAlertResponse['data']> => {
    const response = await apiClient.post<PriceAlertResponse>('/price-alerts', data);
    return response.data.data!;
  },

  updatePriceAlert: async (alertId: string, data: Partial<PriceAlertRequest>): Promise<PriceAlertResponse['data']> => {
    const response = await apiClient.put<PriceAlertResponse>(`/price-alerts/${alertId}`, data);
    return response.data.data!;
  },

  deletePriceAlert: async (alertId: string): Promise<void> => {
    await apiClient.delete(`/price-alerts/${alertId}`);
  },

  // Market orders (paper trading or real if connected to broker)
  placeOrder: async (data: MarketOrderRequest): Promise<MarketOrderResponse['data']> => {
    const response = await apiClient.post<MarketOrderResponse>('/orders', data);
    return response.data.data!;
  },

  getOrders: async (portfolioId?: string, status?: string): Promise<MarketOrderResponse['data'][]> => {
    const response = await apiClient.get<ApiResponse<MarketOrderResponse['data'][]>>('/orders', {
      params: { portfolioId, status }
    });
    return response.data.data!;
  },

  getOrder: async (orderId: string): Promise<MarketOrderResponse['data']> => {
    const response = await apiClient.get<MarketOrderResponse>(`/orders/${orderId}`);
    return response.data.data!;
  },

  cancelOrder: async (orderId: string): Promise<void> => {
    await apiClient.delete(`/orders/${orderId}`);
  },

  // Market data subscriptions (for real-time updates)
  subscribeToAsset: async (assetId: string): Promise<ApiResponse<{ subscriptionId: string }>['data']> => {
    const response = await apiClient.post<ApiResponse<{ subscriptionId: string }>>('/market/subscribe', {
      assetId,
      dataTypes: ['price', 'volume', 'bid_ask']
    });
    return response.data.data!;
  },

  unsubscribeFromAsset: async (subscriptionId: string): Promise<void> => {
    await apiClient.delete(`/market/subscriptions/${subscriptionId}`);
  },

  // Economic indicators
  getEconomicIndicators: async (): Promise<ApiResponse<Array<{
    indicator: string;
    name: string;
    value: number;
    change: number;
    changePercent: number;
    lastUpdated: string;
    impact: 'high' | 'medium' | 'low';
  }>>['data']> => {
    const response = await apiClient.get<ApiResponse<Array<{
      indicator: string;
      name: string;
      value: number;
      change: number;
      changePercent: number;
      lastUpdated: string;
      impact: 'high' | 'medium' | 'low';
    }>>>('/market/economic-indicators');
    return response.data.data!;
  },

  // Market calendar (earnings, dividends, splits, etc.)
  getMarketCalendar: async (
    startDate: string, 
    endDate: string, 
    eventTypes?: ('earnings' | 'dividends' | 'splits' | 'ipos')[]
  ): Promise<ApiResponse<Array<{
    date: string;
    events: Array<{
      type: 'earnings' | 'dividends' | 'splits' | 'ipos';
      assetId: string;
      asset: Asset;
      details: Record<string, any>;
      importance: 'high' | 'medium' | 'low';
    }>;
  }>>['data']> => {
    const response = await apiClient.get<ApiResponse<Array<{
      date: string;
      events: Array<{
        type: 'earnings' | 'dividends' | 'splits' | 'ipos';
        assetId: string;
        asset: Asset;
        details: Record<string, any>;
        importance: 'high' | 'medium' | 'low';
      }>;
    }>>>('/market/calendar', {
      params: { startDate, endDate, eventTypes: eventTypes?.join(',') }
    });
    return response.data.data!;
  },

  // Get asset correlation matrix
  getAssetCorrelations: async (assetIds: string[], period: TimePeriod = '1y'): Promise<ApiResponse<{
    assets: Asset[];
    correlationMatrix: number[][];
    period: TimePeriod;
    calculatedAt: string;
  }>['data']> => {
    const response = await apiClient.post<ApiResponse<{
      assets: Asset[];
      correlationMatrix: number[][];
      period: TimePeriod;
      calculatedAt: string;
    }>>('/market/correlations', {
      assetIds,
      period
    });
    return response.data.data!;
  }
};

export default investmentAPI;