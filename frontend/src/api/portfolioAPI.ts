import apiClient from './index';
import { ApiEndpoint } from '../types/api.types';
import { 
  Portfolio, 
  Position, 
  Transaction, 
  Asset, 
  TransactionType,
  AssetType,
  MarketDataInterval,
  PerformanceSummary,
  RiskMetrics,
  AllocationSummary,
  TimeSeriesDataPoint
} from '../types/portfolio.types';
import { 
  ApiResponse, 
  PaginatedResponse, 
  QueryParams, 
  TimePeriod,
  Currency
} from '../types/index';

// Portfolio API request types
interface CreatePortfolioRequest {
  name: string;
  description?: string;
  currency?: Currency;
  initialCash?: number;
}

interface UpdatePortfolioRequest {
  name?: string;
  description?: string;
}

interface AddPositionRequest {
  portfolioId: string;
  assetId: string;
  quantity: number;
  price: number;
  transactionType?: TransactionType;
  fees?: number;
  notes?: string;
}

interface UpdatePositionRequest {
  quantity?: number;
  notes?: string;
}

interface CreateTransactionRequest {
  portfolioId: string;
  assetId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fees?: number;
  notes?: string;
  executedAt?: string;
}

interface RebalancePortfolioRequest {
  portfolioId: string;
  targetAllocations: Array<{
    assetId: string;
    targetPercentage: number;
  }>;
  rebalanceThreshold?: number; // Default 5%
  considerTaxes?: boolean;
}

interface PortfolioAnalysisRequest {
  portfolioId: string;
  benchmarkSymbol?: string;
  period?: TimePeriod;
}

// Portfolio API responses
interface PortfoliosResponse extends ApiResponse<Portfolio[]> {}
interface PortfolioResponse extends ApiResponse<Portfolio> {}
interface PositionsResponse extends ApiResponse<Position[]> {}
interface PositionResponse extends ApiResponse<Position> {}
interface TransactionsResponse extends PaginatedResponse<Transaction[]> {}
interface TransactionResponse extends ApiResponse<Transaction> {}
interface PerformanceResponse extends ApiResponse<{
  summary: PerformanceSummary;
  timeSeries: TimeSeriesDataPoint[];
  benchmarkComparison?: {
    portfolio: TimeSeriesDataPoint[];
    benchmark: TimeSeriesDataPoint[];
  };
}> {}
interface RiskMetricsResponse extends ApiResponse<RiskMetrics> {}
interface AllocationResponse extends ApiResponse<AllocationSummary> {}
interface RebalanceResponse extends ApiResponse<{
  currentAllocations: AllocationSummary;
  targetAllocations: Array<{
    assetId: string;
    currentPercentage: number;
    targetPercentage: number;
    actionRequired: 'buy' | 'sell' | 'hold';
    suggestedQuantity?: number;
  }>;
  estimatedCosts: {
    tradingFees: number;
    taxImplications?: number;
    totalCost: number;
  };
}> {}

export const portfolioAPI = {
  // Get all portfolios for current user
  getPortfolios: async (): Promise<Portfolio[]> => {
    const response = await apiClient.get<PortfoliosResponse>(ApiEndpoint.PORTFOLIOS);
    return response.data.data!;
  },

  // Get portfolio by ID
  getPortfolio: async (portfolioId: string): Promise<Portfolio> => {
    const url = ApiEndpoint.PORTFOLIO_BY_ID.replace(':id', portfolioId);
    const response = await apiClient.get<PortfolioResponse>(url);
    return response.data.data!;
  },

  // Create new portfolio
  createPortfolio: async (data: CreatePortfolioRequest): Promise<Portfolio> => {
    const response = await apiClient.post<PortfolioResponse>(ApiEndpoint.PORTFOLIOS, data);
    return response.data.data!;
  },

  // Update portfolio
  updatePortfolio: async (portfolioId: string, data: UpdatePortfolioRequest): Promise<Portfolio> => {
    const url = ApiEndpoint.PORTFOLIO_BY_ID.replace(':id', portfolioId);
    const response = await apiClient.put<PortfolioResponse>(url, data);
    return response.data.data!;
  },

  // Delete portfolio
  deletePortfolio: async (portfolioId: string): Promise<void> => {
    const url = ApiEndpoint.PORTFOLIO_BY_ID.replace(':id', portfolioId);
    await apiClient.delete(url);
  },

  // Get portfolio positions
  getPositions: async (portfolioId: string): Promise<Position[]> => {
    const url = ApiEndpoint.POSITIONS.replace(':id', portfolioId);
    const response = await apiClient.get<PositionsResponse>(url);
    return response.data.data!;
  },

  // Get specific position
  getPosition: async (portfolioId: string, positionId: string): Promise<Position> => {
    const response = await apiClient.get<PositionResponse>(`/portfolios/${portfolioId}/positions/${positionId}`);
    return response.data.data!;
  },

  // Add position to portfolio
  addPosition: async (data: AddPositionRequest): Promise<Position> => {
    const url = ApiEndpoint.POSITIONS.replace(':id', data.portfolioId);
    const response = await apiClient.post<PositionResponse>(url, data);
    return response.data.data!;
  },

  // Update position
  updatePosition: async (portfolioId: string, positionId: string, data: UpdatePositionRequest): Promise<Position> => {
    const response = await apiClient.put<PositionResponse>(
      `/portfolios/${portfolioId}/positions/${positionId}`, 
      data
    );
    return response.data.data!;
  },

  // Remove position from portfolio
  removePosition: async (portfolioId: string, positionId: string): Promise<void> => {
    await apiClient.delete(`/portfolios/${portfolioId}/positions/${positionId}`);
  },

  // Get portfolio transactions
  getTransactions: async (portfolioId: string, params?: QueryParams): Promise<PaginatedResponse<Transaction[]>> => {
    const url = ApiEndpoint.TRANSACTIONS.replace(':id', portfolioId);
    const response = await apiClient.get<TransactionsResponse>(url, { params });
    return response.data;
  },

  // Get specific transaction
  getTransaction: async (transactionId: string): Promise<Transaction> => {
    const url = ApiEndpoint.TRANSACTION_BY_ID.replace(':id', transactionId);
    const response = await apiClient.get<TransactionResponse>(url);
    return response.data.data!;
  },

  // Create transaction
  createTransaction: async (data: CreateTransactionRequest): Promise<Transaction> => {
    const url = ApiEndpoint.TRANSACTIONS.replace(':id', data.portfolioId);
    const response = await apiClient.post<TransactionResponse>(url, data);
    return response.data.data!;
  },

  // Update transaction
  updateTransaction: async (transactionId: string, data: Partial<CreateTransactionRequest>): Promise<Transaction> => {
    const url = ApiEndpoint.TRANSACTION_BY_ID.replace(':id', transactionId);
    const response = await apiClient.put<TransactionResponse>(url, data);
    return response.data.data!;
  },

  // Delete transaction
  deleteTransaction: async (transactionId: string): Promise<void> => {
    const url = ApiEndpoint.TRANSACTION_BY_ID.replace(':id', transactionId);
    await apiClient.delete(url);
  },

  // Get portfolio performance
  getPerformance: async (portfolioId: string, period: TimePeriod = '1y', benchmarkSymbol?: string): Promise<PerformanceResponse['data']> => {
    const url = ApiEndpoint.PORTFOLIO_PERFORMANCE.replace(':id', portfolioId);
    const response = await apiClient.get<PerformanceResponse>(url, {
      params: { period, benchmark: benchmarkSymbol }
    });
    return response.data.data!;
  },

  // Get portfolio risk metrics
  getRiskMetrics: async (portfolioId: string, period: TimePeriod = '1y'): Promise<RiskMetrics> => {
    const response = await apiClient.get<RiskMetricsResponse>(
      `/portfolios/${portfolioId}/risk-metrics`,
      { params: { period } }
    );
    return response.data.data!;
  },

  // Get portfolio allocation summary
  getAllocation: async (portfolioId: string): Promise<AllocationSummary> => {
    const response = await apiClient.get<AllocationResponse>(`/portfolios/${portfolioId}/allocation`);
    return response.data.data!;
  },

  // Get portfolio dividends
  getDividends: async (portfolioId: string, params?: QueryParams): Promise<PaginatedResponse<Transaction[]>> => {
    const url = ApiEndpoint.DIVIDENDS.replace(':id', portfolioId);
    const response = await apiClient.get<TransactionsResponse>(url, { params });
    return response.data;
  },

  // Analyze portfolio for rebalancing
  analyzeRebalancing: async (data: RebalancePortfolioRequest): Promise<RebalanceResponse['data']> => {
    const url = ApiEndpoint.PORTFOLIO_REBALANCE.replace(':id', data.portfolioId);
    const response = await apiClient.post<RebalanceResponse>(`${url}/analyze`, data);
    return response.data.data!;
  },

  // Execute portfolio rebalancing
  executeRebalancing: async (data: RebalancePortfolioRequest): Promise<Transaction[]> => {
    const url = ApiEndpoint.PORTFOLIO_REBALANCE.replace(':id', data.portfolioId);
    const response = await apiClient.post<ApiResponse<Transaction[]>>(`${url}/execute`, data);
    return response.data.data!;
  },

  // Get portfolio comparison
  comparePortfolios: async (portfolioIds: string[], period: TimePeriod = '1y'): Promise<ApiResponse<{
    portfolios: Array<{
      id: string;
      name: string;
      performance: PerformanceSummary;
      riskMetrics: RiskMetrics;
    }>;
    comparison: {
      bestPerformer: string;
      worstPerformer: string;
      averageReturn: number;
      correlationMatrix?: number[][];
    };
  }>['data']> => {
    const response = await apiClient.post<ApiResponse<{
      portfolios: Array<{
        id: string;
        name: string;
        performance: PerformanceSummary;
        riskMetrics: RiskMetrics;
      }>;
      comparison: {
        bestPerformer: string;
        worstPerformer: string;
        averageReturn: number;
        correlationMatrix?: number[][];
      };
    }>>('/portfolios/compare', {
      portfolioIds,
      period
    });
    return response.data.data!;
  },

  // Import portfolio from CSV/broker
  importPortfolio: async (file: File, brokerFormat?: string): Promise<ApiResponse<{
    portfolioId: string;
    importSummary: {
      totalTransactions: number;
      successfulImports: number;
      failedImports: number;
      errors?: string[];
    };
  }>['data']> => {
    const formData = new FormData();
    formData.append('file', file);
    if (brokerFormat) {
      formData.append('brokerFormat', brokerFormat);
    }

    const response = await apiClient.post<ApiResponse<{
      portfolioId: string;
      importSummary: {
        totalTransactions: number;
        successfulImports: number;
        failedImports: number;
        errors?: string[];
      };
    }>>('/portfolios/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!;
  },

  // Export portfolio data
  exportPortfolio: async (portfolioId: string, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> => {
    const response = await apiClient.get(`/portfolios/${portfolioId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Get portfolio tax report
  getTaxReport: async (portfolioId: string, taxYear: number): Promise<ApiResponse<{
    capitalGains: {
      shortTerm: Transaction[];
      longTerm: Transaction[];
      totalShortTermGains: number;
      totalLongTermGains: number;
    };
    dividends: {
      qualified: Transaction[];
      nonQualified: Transaction[];
      totalQualified: number;
      totalNonQualified: number;
    };
    summary: {
      totalTaxableGains: number;
      totalTaxableDividends: number;
      estimatedTaxLiability: number;
    };
  }>['data']> => {
    const response = await apiClient.get<ApiResponse<{
      capitalGains: {
        shortTerm: Transaction[];
        longTerm: Transaction[];
        totalShortTermGains: number;
        totalLongTermGains: number;
      };
      dividends: {
        qualified: Transaction[];
        nonQualified: Transaction[];
        totalQualified: number;
        totalNonQualified: number;
      };
      summary: {
        totalTaxableGains: number;
        totalTaxableDividends: number;
        estimatedTaxLiability: number;
      };
    }>>(`/portfolios/${portfolioId}/tax-report`, {
      params: { taxYear }
    });
    return response.data.data!;
  },

  // Set portfolio as default
  setDefaultPortfolio: async (portfolioId: string): Promise<void> => {
    await apiClient.post(`/portfolios/${portfolioId}/set-default`);
  },

  // Clone portfolio
  clonePortfolio: async (portfolioId: string, newName: string): Promise<Portfolio> => {
    const response = await apiClient.post<PortfolioResponse>(`/portfolios/${portfolioId}/clone`, {
      name: newName
    });
    return response.data.data!;
  },

  // Get portfolio suggestions
  getPortfolioSuggestions: async (portfolioId: string): Promise<ApiResponse<{
    diversificationSuggestions: Array<{
      type: 'add_asset_class' | 'add_sector' | 'reduce_concentration';
      description: string;
      suggestedAssets?: Asset[];
      priority: 'high' | 'medium' | 'low';
    }>;
    rebalancingSuggestions: Array<{
      assetId: string;
      currentWeight: number;
      suggestedWeight: number;
      action: 'buy' | 'sell';
      reason: string;
    }>;
    riskSuggestions: Array<{
      type: 'reduce_risk' | 'increase_diversification' | 'adjust_allocation';
      description: string;
      impact: string;
    }>;
  }>['data']> => {
    const response = await apiClient.get<ApiResponse<{
      diversificationSuggestions: Array<{
        type: 'add_asset_class' | 'add_sector' | 'reduce_concentration';
        description: string;
        suggestedAssets?: Asset[];
        priority: 'high' | 'medium' | 'low';
      }>;
      rebalancingSuggestions: Array<{
        assetId: string;
        currentWeight: number;
        suggestedWeight: number;
        action: 'buy' | 'sell';
        reason: string;
      }>;
      riskSuggestions: Array<{
        type: 'reduce_risk' | 'increase_diversification' | 'adjust_allocation';
        description: string;
        impact: string;
      }>;
    }>>(`/portfolios/${portfolioId}/suggestions`);
    return response.data.data!;
  }
};

export default portfolioAPI;