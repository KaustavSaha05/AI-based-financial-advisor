import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'bond' | 'etf' | 'mutual_fund' | 'crypto' | 'commodity';
  quantity: number;
  avgCostBasis: number;
  currentPrice: number;
  marketValue: number;
  dayChange: number;
  dayChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  sector?: string;
  allocation: number; // Percentage of portfolio
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  portfolioId: string;
  assetId: string;
  type: 'buy' | 'sell' | 'dividend' | 'split';
  symbol: string;
  quantity: number;
  price: number;
  totalAmount: number;
  fees: number;
  date: string;
  notes?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  userId: string;
  totalValue: number;
  totalCost: number;
  totalReturn: number;
  totalReturnPercent: number;
  dayChange: number;
  dayChangePercent: number;
  cashBalance: number;
  assets: Asset[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioPerformance {
  period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL';
  data: Array<{
    date: string;
    value: number;
    return: number;
    returnPercent: number;
  }>;
}

export interface AssetAllocation {
  byType: Array<{
    type: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  bySector: Array<{
    sector: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  byRisk: Array<{
    riskLevel: 'low' | 'medium' | 'high';
    value: number;
    percentage: number;
    color: string;
  }>;
}

export interface PortfolioState {
  portfolios: Portfolio[];
  activePortfolio: Portfolio | null;
  transactions: Transaction[];
  performance: PortfolioPerformance | null;
  allocation: AssetAllocation | null;
  isLoading: boolean;
  error: string | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncTime: string | null;
  filters: {
    assetType: string | null;
    sector: string | null;
    timeframe: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL';
  };
  sortBy: {
    field: 'symbol' | 'value' | 'return' | 'allocation';
    direction: 'asc' | 'desc';
  };
}

const initialState: PortfolioState = {
  portfolios: [],
  activePortfolio: null,
  transactions: [],
  performance: null,
  allocation: null,
  isLoading: false,
  error: null,
  syncStatus: 'idle',
  lastSyncTime: null,
  filters: {
    assetType: null,
    sector: null,
    timeframe: '1M',
  },
  sortBy: {
    field: 'value',
    direction: 'desc',
  },
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    // Portfolio loading
    fetchPortfoliosStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPortfoliosSuccess: (state, action: PayloadAction<Portfolio[]>) => {
      state.isLoading = false;
      state.portfolios = action.payload;
      state.error = null;
      
      // Set active portfolio if none selected
      if (!state.activePortfolio && action.payload.length > 0) {
        state.activePortfolio = action.payload[0];
      }
    },
    fetchPortfoliosFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Active portfolio management
    setActivePortfolio: (state, action: PayloadAction<string>) => {
      const portfolio = state.portfolios.find(p => p.id === action.payload);
      if (portfolio) {
        state.activePortfolio = portfolio;
      }
    },

    // Portfolio creation
    createPortfolioStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createPortfolioSuccess: (state, action: PayloadAction<Portfolio>) => {
      state.isLoading = false;
      state.portfolios.push(action.payload);
      state.activePortfolio = action.payload;
      state.error = null;
    },
    createPortfolioFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Portfolio updates
    updatePortfolioStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updatePortfolioSuccess: (state, action: PayloadAction<Portfolio>) => {
      state.isLoading = false;
      const index = state.portfolios.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.portfolios[index] = action.payload;
        if (state.activePortfolio?.id === action.payload.id) {
          state.activePortfolio = action.payload;
        }
      }
      state.error = null;
    },
    updatePortfolioFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Portfolio deletion
    deletePortfolioStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    deletePortfolioSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.portfolios = state.portfolios.filter(p => p.id !== action.payload);
      
      // Reset active portfolio if deleted
      if (state.activePortfolio?.id === action.payload) {
        state.activePortfolio = state.portfolios.length > 0 ? state.portfolios[0] : null;
      }
      state.error = null;
    },
    deletePortfolioFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Transactions
    fetchTransactionsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchTransactionsSuccess: (state, action: PayloadAction<Transaction[]>) => {
      state.isLoading = false;
      state.transactions = action.payload;
      state.error = null;
    },
    fetchTransactionsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Add transaction
    addTransactionStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    addTransactionSuccess: (state, action: PayloadAction<Transaction>) => {
      state.isLoading = false;
      state.transactions.unshift(action.payload);
      state.error = null;
    },
    addTransactionFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Performance data
    fetchPerformanceStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPerformanceSuccess: (state, action: PayloadAction<PortfolioPerformance>) => {
      state.isLoading = false;
      state.performance = action.payload;
      state.error = null;
    },
    fetchPerformanceFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Asset allocation
    fetchAllocationStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchAllocationSuccess: (state, action: PayloadAction<AssetAllocation>) => {
      state.isLoading = false;
      state.allocation = action.payload;
      state.error = null;
    },
    fetchAllocationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Real-time updates
    updateAssetPrices: (
      state,
      action: PayloadAction<{ [symbol: string]: { price: number; change: number; changePercent: number } }>
    ) => {
      const priceUpdates = action.payload;
      
      // Update active portfolio assets
      if (state.activePortfolio) {
        state.activePortfolio.assets = state.activePortfolio.assets.map(asset => {
          if (priceUpdates[asset.symbol]) {
            const update = priceUpdates[asset.symbol];
            return {
              ...asset,
              currentPrice: update.price,
              dayChange: update.change,
              dayChangePercent: update.changePercent,
              marketValue: asset.quantity * update.price,
              totalReturn: (asset.quantity * update.price) - (asset.quantity * asset.avgCostBasis),
              totalReturnPercent: ((update.price - asset.avgCostBasis) / asset.avgCostBasis) * 100,
              lastUpdated: new Date().toISOString(),
            };
          }
          return asset;
        });
      }

      // Update all portfolios
      state.portfolios = state.portfolios.map(portfolio => ({
        ...portfolio,
        assets: portfolio.assets.map(asset => {
          if (priceUpdates[asset.symbol]) {
            const update = priceUpdates[asset.symbol];
            return {
              ...asset,
              currentPrice: update.price,
              dayChange: update.change,
              dayChangePercent: update.changePercent,
              marketValue: asset.quantity * update.price,
              totalReturn: (asset.quantity * update.price) - (asset.quantity * asset.avgCostBasis),
              totalReturnPercent: ((update.price - asset.avgCostBasis) / asset.avgCostBasis) * 100,
              lastUpdated: new Date().toISOString(),
            };
          }
          return asset;
        }),
      }));
    },

    // Sync status
    setSyncStatus: (state, action: PayloadAction<'idle' | 'syncing' | 'success' | 'error'>) => {
      state.syncStatus = action.payload;
      if (action.payload === 'success') {
        state.lastSyncTime = new Date().toISOString();
      }
    },

    // Filters and sorting
    setAssetTypeFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.assetType = action.payload;
    },
    setSectorFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.sector = action.payload;
    },
    setTimeframeFilter: (state, action: PayloadAction<'1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL'>) => {
      state.filters.timeframe = action.payload;
    },
    setSortBy: (
      state,
      action: PayloadAction<{
        field: 'symbol' | 'value' | 'return' | 'allocation';
        direction: 'asc' | 'desc';
      }>
    ) => {
      state.sortBy = action.payload;
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        assetType: null,
        sector: null,
        timeframe: '1M',
      };
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetPortfolioState: (state) => {
      return { ...initialState };
    },
  },
});

export const {
  fetchPortfoliosStart,
  fetchPortfoliosSuccess,
  fetchPortfoliosFailure,
  setActivePortfolio,
  createPortfolioStart,
  createPortfolioSuccess,
  createPortfolioFailure,
  updatePortfolioStart,
  updatePortfolioSuccess,
  updatePortfolioFailure,
  deletePortfolioStart,
  deletePortfolioSuccess,
  deletePortfolioFailure,
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
  addTransactionStart,
  addTransactionSuccess,
  addTransactionFailure,
  fetchPerformanceStart,
  fetchPerformanceSuccess,
  fetchPerformanceFailure,
  fetchAllocationStart,
  fetchAllocationSuccess,
  fetchAllocationFailure,
  updateAssetPrices,
  setSyncStatus,
  setAssetTypeFilter,
  setSectorFilter,
  setTimeframeFilter,
  setSortBy,
  clearFilters,
  clearError,
  resetPortfolioState,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;