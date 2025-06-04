import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchPortfolios,
  fetchPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  fetchPortfolioPositions,
  addPositionToPortfolio,
  removePositionFromPortfolio,
  updatePortfolioPosition,
  fetchPortfolioPerformance,
  fetchPortfolioTransactions,
  createTransaction,
  executeBuyOrder,
  executeSellOrder,
  analyzePortfolioRebalancing,
  executePortfolioRebalancing,
  fetchPortfolioRiskMetrics,
  fetchPortfolioAllocation,
  fetchPortfolioDividends,
  comparePortfolios,
  importPortfolio,
  exportPortfolio,
  fetchPortfolioTaxReport,
  setDefaultPortfolio,
  clonePortfolio,
  fetchPortfolioSuggestions,
  fetchAssetMarketData
} from '../store/thunks/portfolioThunks';
import {
  setActivePortfolio,
  setAssetTypeFilter,
  setSectorFilter,
  setTimeframeFilter,
  setSortBy,
  clearFilters,
  clearError,
  resetPortfolioState,
  updateAssetPrices,
  setSyncStatus
} from '../store/slices/portfolioSlice';
import { 
  Portfolio, 
  Asset, 
  Position,
  Transaction,
  TransactionType,
  AssetType,
  Sector,
  AllocationBreakdown,
  PerformanceSummary,
  RiskMetrics,
  AllocationSummary
} from '../types/portfolio.types';
import { TimePeriod, QueryParams, Currency } from '../types/index';

// Type for time range filter
type TimeframeFilter = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL';

// Type for sort configuration
interface SortConfig {
  field: 'symbol' | 'value' | 'return' | 'allocation';
  direction: 'asc' | 'desc';
}

export const usePortfolio = () => {
  const dispatch: AppDispatch = useDispatch();
  
  const {
    portfolios,
    activePortfolio,
    transactions,
    performance,
    allocation,
    isLoading,
    error,
    syncStatus,
    lastSyncTime,
    filters,
    sortBy
  } = useSelector((state: RootState) => state.portfolio);

  // Fetch all portfolios
  const fetchAllPortfolios = useCallback(async () => {
    try {
      const result = await dispatch(fetchPortfolios());
      return fetchPortfolios.fulfilled.match(result);
    } catch (error) {
      return false;
    }
  }, [dispatch]);

  // Fetch specific portfolio by ID
  const fetchPortfolio = useCallback(async (portfolioId: string) => {
    try {
      const result = await dispatch(fetchPortfolioById(portfolioId));
      return fetchPortfolioById.fulfilled.match(result);
    } catch (error) {
      return false;
    }
  }, [dispatch]);

  // Create new portfolio
  const createNewPortfolio = useCallback(async (portfolioData: {
    name: string;
    description?: string;
    currency?: Currency;
    initialCash?: number;
  }) => {
    try {
      const result = await dispatch(createPortfolio(portfolioData));
      if (createPortfolio.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Failed to create portfolio' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }, [dispatch]);

  // Update portfolio
  const updatePortfolioData = useCallback(async (id: string, updates: {
    name?: string;
    description?: string;
  }) => {
    try {
      const result = await dispatch(updatePortfolio({ id, data: updates }));
      if (updatePortfolio.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Failed to update portfolio' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }, [dispatch]);

  // Delete portfolio
  const deletePortfolioById = useCallback(async (portfolioId: string) => {
    try {
      const result = await dispatch(deletePortfolio(portfolioId));
      if (deletePortfolio.fulfilled.match(result)) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Failed to delete portfolio' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }, [dispatch]);

  // Add position to portfolio
  const addPosition = useCallback(async (portfolioId: string, positionData: {
    assetId: string;
    quantity: number;
    price: number;
    transactionType?: TransactionType;
    fees?: number;
    notes?: string;
  }) => {
    try {
      const result = await dispatch(addPositionToPortfolio({ 
        portfolioId, 
        positionData: { portfolioId, ...positionData }
      }));
      if (addPositionToPortfolio.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Failed to add position' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }, [dispatch]);

  // Remove position from portfolio
  const removePosition = useCallback(async (portfolioId: string, positionId: string) => {
    try {
      const result = await dispatch(removePositionFromPortfolio({ portfolioId, positionId }));
      if (removePositionFromPortfolio.fulfilled.match(result)) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Failed to remove position' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }, [dispatch]);

  // Update position
  const updatePosition = useCallback(async (portfolioId: string, positionId: string, data: Partial<Position>) => {
    try {
      const result = await dispatch(updatePortfolioPosition({ portfolioId, positionId, data }));
      if (updatePortfolioPosition.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Failed to update position' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }, [dispatch]);

  // Execute buy order
  const buyAsset = useCallback(async (portfolioId: string, assetId: string, quantity: number, price?: number) => {
    try {
      const result = await dispatch(executeBuyOrder({ portfolioId, assetId, quantity, price }));
      if (executeBuyOrder.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Failed to execute buy order' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }, [dispatch]);

  // Execute sell order
  const sellAsset = useCallback(async (portfolioId: string, assetId: string, quantity: number, price?: number) => {
    try {
      const result = await dispatch(executeSellOrder({ portfolioId, assetId, quantity, price }));
      if (executeSellOrder.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Failed to execute sell order' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }, [dispatch]);

  // Analyze rebalancing
  const analyzeRebalancing = useCallback(async (portfolioId: string, targetAllocations: Array<{
    assetId: string;
    targetPercentage: number;
  }>) => {
    try {
      const result = await dispatch(analyzePortfolioRebalancing({ 
        portfolioId, 
        targetAllocations 
      }));
      if (analyzePortfolioRebalancing.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Failed to analyze rebalancing' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }, [dispatch]);

  // Execute rebalancing
  const executeRebalancing = useCallback(async (portfolioId: string, targetAllocations: Array<{
    assetId: string;
    targetPercentage: number;
  }>) => {
    try {
      const result = await dispatch(executePortfolioRebalancing({ 
        portfolioId, 
        targetAllocations 
      }));
      if (executePortfolioRebalancing.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Failed to execute rebalancing' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }, [dispatch]);

  // Fetch portfolio performance
  const fetchPerformance = useCallback(async (portfolioId: string, period?: TimePeriod, benchmarkSymbol?: string) => {
    try {
      const result = await dispatch(fetchPortfolioPerformance({ portfolioId, period, benchmarkSymbol }));
      return fetchPortfolioPerformance.fulfilled.match(result);
    } catch (error) {
      return false;
    }
  }, [dispatch]);

  // Fetch portfolio allocation
  const fetchAllocation = useCallback(async (portfolioId: string) => {
    try {
      const result = await dispatch(fetchPortfolioAllocation(portfolioId));
      return fetchPortfolioAllocation.fulfilled.match(result);
    } catch (error) {
      return false;
    }
  }, [dispatch]);

  // Fetch transactions
  const fetchTransactions = useCallback(async (portfolioId: string, params?: QueryParams) => {
    try {
      const result = await dispatch(fetchPortfolioTransactions({ portfolioId, params }));
      return fetchPortfolioTransactions.fulfilled.match(result);
    } catch (error) {
      return false;
    }
  }, [dispatch]);

  // Set active portfolio
  const selectPortfolio = useCallback((portfolioId: string) => {
    dispatch(setActivePortfolio(portfolioId));
  }, [dispatch]);

  // Update asset prices
  const updatePrices = useCallback((priceUpdates: { [symbol: string]: { price: number; change: number; changePercent: number } }) => {
    dispatch(updateAssetPrices(priceUpdates));
  }, [dispatch]);

  // Set filters
  const setAssetFilter = useCallback((assetType: AssetType | null) => {
    dispatch(setAssetTypeFilter(assetType));
  }, [dispatch]);

  const setSectorFilterValue = useCallback((sector: Sector | null) => {
    dispatch(setSectorFilter(sector));
  }, [dispatch]);

  const setTimeframe = useCallback((timeframe: TimeframeFilter) => {
    dispatch(setTimeframeFilter(timeframe));
  }, [dispatch]);

  const setSortConfig = useCallback((sortConfig: SortConfig) => {
    dispatch(setSortBy(sortConfig));
  }, [dispatch]);

  // Clear filters and errors
  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const clearPortfolioError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const resetState = useCallback(() => {
    dispatch(resetPortfolioState());
  }, [dispatch]);

  // Calculate portfolio summary metrics
  const portfolioSummary = useMemo(() => {
    if (!activePortfolio) {
      return {
        totalValue: 0,
        totalGain: 0,
        totalGainPercent: 0,
        dayChange: 0,
        dayChangePercent: 0,
        positionCount: 0
      };
    }

    const totalValue = activePortfolio.totalValue || 0;
    const performanceSummary = activePortfolio.performanceSummary;
    const positions = activePortfolio.positions || [];
    
    return {
      totalValue,
      totalGain: performanceSummary?.totalReturn || 0,
      totalGainPercent: performanceSummary?.totalReturnPercent || 0,
      dayChange: performanceSummary?.dailyChange || 0,
      dayChangePercent: performanceSummary?.dailyChangePercent || 0,
      positionCount: positions.length
    };
  }, [activePortfolio]);

  // Get asset allocation data for charts
  const assetAllocation = useMemo(() => {
    if (!allocation?.byAsset) return [];

    return allocation.byAsset.map(allocationItem => ({
      name: allocationItem.name,
      value: allocationItem.value,
      percentage: allocationItem.percentage,
      color: allocationItem.color || '#8884d8'
    }));
  }, [allocation]);

  // Get top performers
  const topPerformers = useMemo(() => {
    if (!activePortfolio?.positions) return [];

    return [...activePortfolio.positions]
      .sort((a, b) => b.unrealizedPLPercent - a.unrealizedPLPercent)
      .slice(0, 5);
  }, [activePortfolio]);

  // Get worst performers
  const worstPerformers = useMemo(() => {
    if (!activePortfolio?.positions) return [];

    return [...activePortfolio.positions]
      .sort((a, b) => a.unrealizedPLPercent - b.unrealizedPLPercent)
      .slice(0, 5);
  }, [activePortfolio]);

    // Check if portfolio needs rebalancing
    const needsRebalancing = useMemo(() => {
      if (!activePortfolio?.positions) return false;
  
      // This would require target allocations to be defined
      // For now, return false as a placeholder
      return false;
    }, [activePortfolio]);
  
    // Auto-refresh portfolio data
    // (You can implement auto-refresh logic here if needed, or remove this comment if not used)
  
    return {
      portfolios,
      activePortfolio,
      transactions,
      performance,
      allocation,
      isLoading,
      error,
      syncStatus,
      lastSyncTime,
      filters,
      sortBy,
      fetchAllPortfolios,
      fetchPortfolio,
      createNewPortfolio,
      updatePortfolioData,
      deletePortfolioById,
      addPosition,
      removePosition,
      updatePosition,
      buyAsset,
      sellAsset,
      analyzeRebalancing,
      executeRebalancing,
      fetchPerformance,
      fetchAllocation,
      fetchTransactions,
      selectPortfolio,
      updatePrices,
      setAssetFilter,
      setSectorFilterValue,
      setTimeframe,
      setSortConfig,
      resetFilters,
      clearPortfolioError,
      resetState,
      portfolioSummary,
      assetAllocation,
      topPerformers,
      worstPerformers,
      needsRebalancing
    };
  };