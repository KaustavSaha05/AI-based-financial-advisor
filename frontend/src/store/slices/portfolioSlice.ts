import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  Portfolio, 
  Position, 
  Transaction, 
  Asset,
  PerformanceSummary,
  RiskMetrics,
  AllocationSummary 
} from '../../types/portfolio.types';

// Updated Portfolio interface to match types
export interface PortfolioPerformance {
  period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL';
  data: Array<{
    date: string;
    value: number;
    return: number;
    returnPercent: number;
  }>;
}

export interface PortfolioState {
  portfolios: Portfolio[];
  activePortfolio: Portfolio | null;
  transactions: Transaction[];
  performance: PortfolioPerformance | null;
  allocation: AllocationSummary | null;
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
    fetchAllocationSuccess: (state, action: PayloadAction<AllocationSummary>) => {
      state.isLoading = false;
      state.allocation = action.payload;
      state.error = null;
    },
    fetchAllocationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Real-time updates - Updated to work with Position structure
    updateAssetPrices: (
      state,
      action: PayloadAction<{ [symbol: string]: { price: number; change: number; changePercent: number } }>
    ) => {
      const priceUpdates = action.payload;
      
      // Update active portfolio positions
      if (state.activePortfolio) {
        state.activePortfolio.positions = state.activePortfolio.positions.map(position => {
          if (priceUpdates[position.asset.symbol]) {
            const update = priceUpdates[position.asset.symbol];
            const newCurrentValue = position.quantity * update.price;
            const unrealizedPL = newCurrentValue - position.costBasis;
            const unrealizedPLPercent = position.costBasis > 0 ? (unrealizedPL / position.costBasis) * 100 : 0;
            
            return {
              ...position,
              asset: {
                ...position.asset,
                currentPrice: update.price,
                priceChange: update.change,
                priceChangePercent: update.changePercent,
                lastUpdated: new Date().toISOString(),
              },
              currentValue: newCurrentValue,
              unrealizedPL,
              unrealizedPLPercent,
              lastUpdated: new Date().toISOString(),
            };
          }
          return position;
        });

        // Update portfolio performance summary
        const totalValue = state.activePortfolio.positions.reduce((sum, pos) => sum + pos.currentValue, 0) + state.activePortfolio.cash;
        const totalCostBasis = state.activePortfolio.positions.reduce((sum, pos) => sum + pos.costBasis, 0);
        const totalUnrealizedPL = state.activePortfolio.positions.reduce((sum, pos) => sum + pos.unrealizedPL, 0);
        
        state.activePortfolio.totalValue = totalValue;
        state.activePortfolio.performanceSummary = {
          ...state.activePortfolio.performanceSummary,
          totalReturn: totalUnrealizedPL,
          totalReturnPercent: totalCostBasis > 0 ? (totalUnrealizedPL / totalCostBasis) * 100 : 0,
          // dailyChange would need to be calculated based on previous day's data
          dailyChange: 0, // Placeholder
          dailyChangePercent: 0, // Placeholder
          weeklyChange: 0,
          weeklyChangePercent: 0,
          monthlyChange: 0,
          monthlyChangePercent: 0,
          yearlyChange: 0,
          yearlyChangePercent: 0,
          allTimeChange: totalUnrealizedPL,
          allTimeChangePercent: totalCostBasis > 0 ? (totalUnrealizedPL / totalCostBasis) * 100 : 0,
        };
      }

      // Update all portfolios
      state.portfolios = state.portfolios.map(portfolio => ({
        ...portfolio,
        positions: portfolio.positions.map(position => {
          if (priceUpdates[position.asset.symbol]) {
            const update = priceUpdates[position.asset.symbol];
            const newCurrentValue = position.quantity * update.price;
            const unrealizedPL = newCurrentValue - position.costBasis;
            const unrealizedPLPercent = position.costBasis > 0 ? (unrealizedPL / position.costBasis) * 100 : 0;
            
            return {
              ...position,
              asset: {
                ...position.asset,
                currentPrice: update.price,
                priceChange: update.change,
                priceChangePercent: update.changePercent,
                lastUpdated: new Date().toISOString(),
              },
              currentValue: newCurrentValue,
              unrealizedPL,
              unrealizedPLPercent,
              lastUpdated: new Date().toISOString(),
            };
          }
          return position;
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