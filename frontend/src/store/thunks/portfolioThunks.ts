import { createAsyncThunk } from '@reduxjs/toolkit';
import { portfolioAPI } from '../../api/portfolioAPI';
import { investmentAPI } from '../../api/investmentAPI';
import { 
  Portfolio, 
  Position,
  Transaction,
  Asset,
  TransactionType
} from '../../types/portfolio.types';
import { 
  QueryParams,
  TimePeriod,
  Currency
} from '../../types/index';

// Additional interfaces for API requests/responses
interface PortfolioSummary {
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  dayChange: number;
  dayChangePercent: number;
  portfolioCount: number;
  topPerformer?: Position;
  worstPerformer?: Position;
}

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

interface RebalanceRequest {
  portfolioId: string;
  targetAllocations: Array<{
    assetId: string;
    targetPercentage: number;
  }>;
  rebalanceThreshold?: number;
  considerTaxes?: boolean;
}

// Fetch user's portfolios
export const fetchPortfolios = createAsyncThunk(
  'portfolio/fetchPortfolios',
  async (_, { rejectWithValue }) => {
    try {
      const portfolios = await portfolioAPI.getPortfolios();
      return portfolios;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch portfolios'
      );
    }
  }
);

// Fetch specific portfolio by ID
export const fetchPortfolioById = createAsyncThunk(
  'portfolio/fetchPortfolioById',
  async (portfolioId: string, { rejectWithValue }) => {
    try {
      const portfolio = await portfolioAPI.getPortfolio(portfolioId);
      return portfolio;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch portfolio'
      );
    }
  }
);

// Create new portfolio
export const createPortfolio = createAsyncThunk(
  'portfolio/createPortfolio',
  async (portfolioData: CreatePortfolioRequest, { rejectWithValue }) => {
    try {
      const portfolio = await portfolioAPI.createPortfolio(portfolioData);
      return portfolio;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create portfolio'
      );
    }
  }
);

// Update portfolio
export const updatePortfolio = createAsyncThunk(
  'portfolio/updatePortfolio',
  async ({ id, data }: { id: string; data: UpdatePortfolioRequest }, { rejectWithValue }) => {
    try {
      const portfolio = await portfolioAPI.updatePortfolio(id, data);
      return portfolio;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update portfolio'
      );
    }
  }
);

// Delete portfolio
export const deletePortfolio = createAsyncThunk(
  'portfolio/deletePortfolio',
  async (portfolioId: string, { rejectWithValue }) => {
    try {
      await portfolioAPI.deletePortfolio(portfolioId);
      return portfolioId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete portfolio'
      );
    }
  }
);

// Fetch portfolio positions
export const fetchPortfolioPositions = createAsyncThunk(
  'portfolio/fetchPortfolioPositions',
  async (portfolioId: string, { rejectWithValue }) => {
    try {
      const positions = await portfolioAPI.getPositions(portfolioId);
      return { portfolioId, positions };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch portfolio positions'
      );
    }
  }
);

// Add position to portfolio
export const addPositionToPortfolio = createAsyncThunk(
  'portfolio/addPositionToPortfolio',
  async ({ portfolioId, positionData }: { portfolioId: string; positionData: AddPositionRequest }, { rejectWithValue }) => {
    try {
      const position = await portfolioAPI.addPosition(positionData);
      return { portfolioId, position };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add position to portfolio'
      );
    }
  }
);

// Remove position from portfolio
export const removePositionFromPortfolio = createAsyncThunk(
  'portfolio/removePositionFromPortfolio',
  async ({ portfolioId, positionId }: { portfolioId: string; positionId: string }, { rejectWithValue }) => {
    try {
      await portfolioAPI.removePosition(portfolioId, positionId);
      return { portfolioId, positionId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove position from portfolio'
      );
    }
  }
);

// Update position in portfolio
export const updatePortfolioPosition = createAsyncThunk(
  'portfolio/updatePortfolioPosition',
  async ({ portfolioId, positionId, data }: { portfolioId: string; positionId: string; data: Partial<Position> }, { rejectWithValue }) => {
    try {
      const position = await portfolioAPI.updatePosition(portfolioId, positionId, data);
      return { portfolioId, position };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update portfolio position'
      );
    }
  }
);

// Fetch portfolio performance
export const fetchPortfolioPerformance = createAsyncThunk(
  'portfolio/fetchPortfolioPerformance',
  async ({ portfolioId, period, benchmarkSymbol }: { portfolioId: string; period?: TimePeriod; benchmarkSymbol?: string }, { rejectWithValue }) => {
    try {
      const performance = await portfolioAPI.getPerformance(portfolioId, period, benchmarkSymbol);
      return { portfolioId, performance };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch portfolio performance'
      );
    }
  }
);

// Fetch portfolio transactions
export const fetchPortfolioTransactions = createAsyncThunk(
  'portfolio/fetchPortfolioTransactions',
  async ({ portfolioId, params }: { portfolioId: string; params?: QueryParams }, { rejectWithValue }) => {
    try {
      const transactionsResponse = await portfolioAPI.getTransactions(portfolioId, params);
      return { portfolioId, transactions: transactionsResponse };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch portfolio transactions'
      );
    }
  }
);

// Create transaction (buy/sell)
export const createTransaction = createAsyncThunk(
  'portfolio/createTransaction',
  async (transactionData: CreateTransactionRequest, { rejectWithValue }) => {
    try {
      const transaction = await portfolioAPI.createTransaction(transactionData);
      return transaction;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create transaction'
      );
    }
  }
);

// Execute buy order (wrapper around createTransaction)
export const executeBuyOrder = createAsyncThunk(
  'portfolio/executeBuyOrder',
  async ({ portfolioId, assetId, quantity, price }: { portfolioId: string; assetId: string; quantity: number; price?: number }, { rejectWithValue }) => {
    try {
      const transactionData: CreateTransactionRequest = {
        portfolioId,
        assetId,
        type: 'buy',
        quantity,
        price: price || 0, // Price should be fetched from market data if not provided
      };
      const transaction = await portfolioAPI.createTransaction(transactionData);
      return transaction;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to execute buy order'
      );
    }
  }
);

// Execute sell order (wrapper around createTransaction)
export const executeSellOrder = createAsyncThunk(
  'portfolio/executeSellOrder',
  async ({ portfolioId, assetId, quantity, price }: { portfolioId: string; assetId: string; quantity: number; price?: number }, { rejectWithValue }) => {
    try {
      const transactionData: CreateTransactionRequest = {
        portfolioId,
        assetId,
        type: 'sell',
        quantity,
        price: price || 0, // Price should be fetched from market data if not provided
      };
      const transaction = await portfolioAPI.createTransaction(transactionData);
      return transaction;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to execute sell order'
      );
    }
  }
);

// Analyze portfolio rebalancing
export const analyzePortfolioRebalancing = createAsyncThunk(
  'portfolio/analyzePortfolioRebalancing',
  async (rebalanceData: RebalanceRequest, { rejectWithValue }) => {
    try {
      const rebalanceAnalysis = await portfolioAPI.analyzeRebalancing(rebalanceData);
      return { portfolioId: rebalanceData.portfolioId, rebalanceAnalysis };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to analyze portfolio rebalancing'
      );
    }
  }
);

// Execute portfolio rebalancing
export const executePortfolioRebalancing = createAsyncThunk(
  'portfolio/executePortfolioRebalancing',
  async (rebalanceData: RebalanceRequest, { rejectWithValue }) => {
    try {
      const transactions = await portfolioAPI.executeRebalancing(rebalanceData);
      return { portfolioId: rebalanceData.portfolioId, transactions };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to execute portfolio rebalancing'
      );
    }
  }
);

// Fetch portfolio risk metrics
export const fetchPortfolioRiskMetrics = createAsyncThunk(
  'portfolio/fetchPortfolioRiskMetrics',
  async ({ portfolioId, period }: { portfolioId: string; period?: TimePeriod }, { rejectWithValue }) => {
    try {
      const riskMetrics = await portfolioAPI.getRiskMetrics(portfolioId, period);
      return { portfolioId, riskMetrics };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch portfolio risk metrics'
      );
    }
  }
);

// Fetch portfolio allocation
export const fetchPortfolioAllocation = createAsyncThunk(
  'portfolio/fetchPortfolioAllocation',
  async (portfolioId: string, { rejectWithValue }) => {
    try {
      const allocation = await portfolioAPI.getAllocation(portfolioId);
      return { portfolioId, allocation };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch portfolio allocation'
      );
    }
  }
);

// Fetch portfolio dividends
export const fetchPortfolioDividends = createAsyncThunk(
  'portfolio/fetchPortfolioDividends',
  async ({ portfolioId, params }: { portfolioId: string; params?: QueryParams }, { rejectWithValue }) => {
    try {
      const dividendsResponse = await portfolioAPI.getDividends(portfolioId, params);
      return { portfolioId, dividends: dividendsResponse };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch portfolio dividends'
      );
    }
  }
);

// Compare portfolios
export const comparePortfolios = createAsyncThunk(
  'portfolio/comparePortfolios',
  async ({ portfolioIds, period }: { portfolioIds: string[]; period?: TimePeriod }, { rejectWithValue }) => {
    try {
      const comparison = await portfolioAPI.comparePortfolios(portfolioIds, period);
      return comparison;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to compare portfolios'
      );
    }
  }
);

// Import portfolio from file
export const importPortfolio = createAsyncThunk(
  'portfolio/importPortfolio',
  async ({ file, brokerFormat }: { file: File; brokerFormat?: string }, { rejectWithValue }) => {
    try {
      const importResult = await portfolioAPI.importPortfolio(file, brokerFormat);
      return importResult;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to import portfolio'
      );
    }
  }
);

// Export portfolio
export const exportPortfolio = createAsyncThunk(
  'portfolio/exportPortfolio',
  async ({ portfolioId, format }: { portfolioId: string; format?: 'csv' | 'excel' | 'pdf' }, { rejectWithValue }) => {
    try {
      const blob = await portfolioAPI.exportPortfolio(portfolioId, format);
      return { portfolioId, blob };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to export portfolio'
      );
    }
  }
);

// Get tax report
export const fetchPortfolioTaxReport = createAsyncThunk(
  'portfolio/fetchPortfolioTaxReport',
  async ({ portfolioId, taxYear }: { portfolioId: string; taxYear: number }, { rejectWithValue }) => {
    try {
      const taxReport = await portfolioAPI.getTaxReport(portfolioId, taxYear);
      return { portfolioId, taxReport };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch tax report'
      );
    }
  }
);

// Set default portfolio
export const setDefaultPortfolio = createAsyncThunk(
  'portfolio/setDefaultPortfolio',
  async (portfolioId: string, { rejectWithValue }) => {
    try {
      await portfolioAPI.setDefaultPortfolio(portfolioId);
      return portfolioId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to set default portfolio'
      );
    }
  }
);

// Clone portfolio
export const clonePortfolio = createAsyncThunk(
  'portfolio/clonePortfolio',
  async ({ portfolioId, newName }: { portfolioId: string; newName: string }, { rejectWithValue }) => {
    try {
      const clonedPortfolio = await portfolioAPI.clonePortfolio(portfolioId, newName);
      return clonedPortfolio;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to clone portfolio'
      );
    }
  }
);

// Get portfolio suggestions
export const fetchPortfolioSuggestions = createAsyncThunk(
  'portfolio/fetchPortfolioSuggestions',
   async (portfolioId: string, { rejectWithValue }) => {
    try {
      const suggestions = await portfolioAPI.getPortfolioSuggestions(portfolioId);
      return { portfolioId, suggestions };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch portfolio suggestions'
      );
    }
  }
);

// Fetch market data for assets
export const fetchAssetMarketData = createAsyncThunk(
  'portfolio/fetchAssetMarketData',
  async (symbols: string[], { rejectWithValue }) => {
    try {
      // Check if investmentAPI has getMarketData method, otherwise use alternative approach
      if (typeof investmentAPI.getMarketData === 'function') {
        const response = await investmentAPI.getMarketData(symbols);
        return response;
      } else {
        // Fallback: fetch market data individually or return mock data
        // You may need to implement this based on your API structure
        throw new Error('getMarketData method not implemented in investmentAPI');
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch market data'
      );
    }
  }
);