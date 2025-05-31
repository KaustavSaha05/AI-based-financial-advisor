import { createAsyncThunk } from '@reduxjs/toolkit';
import aiRecommendationsAPI from '../../api/aiRecommendationsAPI';
import portfolioAPI from '../../api/portfolioAPI';
import investmentAPI from '../../api/investmentAPI';
import { 
  RecommendationRequest, 
  Recommendation, 
  PortfolioOptimizationRequest,
  MarketInsight,
  PortfolioOptimization,
  RiskAnalysisRequest,
  RiskAnalysis,
  RebalancingRequest,
  RebalancingPlan,
  MarketInsightRequest
} from '../../api/aiRecommendationsAPI';

// Additional types that might be missing - define them if they don't exist elsewhere
interface RecommendationFilters {
  portfolioId?: string;
  assetType?: string[];
  riskLevel?: string;
  minConfidence?: number;
  status?: string;
  limit?: number;
  offset?: number;
}

interface RiskProfile {
  tolerance: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: number;
  investmentGoals: string[];
}

interface RecommendationFeedback {
  recommendationId: string;
  rating: number;
  comment?: string;
  helpful: boolean;
}

// Fetch personalized investment recommendations
export const fetchRecommendations = createAsyncThunk<
  Recommendation[],
  RecommendationRequest,
  { rejectValue: string }
>(
  'recommendations/fetchRecommendations',
  async (request, { rejectWithValue }) => {
    try {
      const response = await aiRecommendationsAPI.getRecommendations(request);
      // Always return an array, never undefined
      return response.data ?? [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch recommendations'
      );
    }
  }
);

// Get portfolio optimization suggestions
export const fetchPortfolioOptimization = createAsyncThunk<
  PortfolioOptimization,
  PortfolioOptimizationRequest,
  { rejectValue: string }
>(
  'recommendations/fetchPortfolioOptimization',
  async (request, { rejectWithValue }) => {
    try {
      const response = await aiRecommendationsAPI.optimizePortfolio(request);
      if (!response.data) {
        return rejectWithValue('Portfolio optimization data is missing');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch portfolio optimization'
      );
    }
  }
);

// Fetch market insights and trends
export const fetchMarketInsights = createAsyncThunk<
  MarketInsight[],
  MarketInsightRequest,
  { rejectValue: string }
>(
  'recommendations/fetchMarketInsights',
  async (params, { rejectWithValue }) => {
    try {
      const response = await aiRecommendationsAPI.getMarketInsights(params);
      // Always return an array, never undefined
      return response.data ?? [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch market insights'
      );
    }
  }
);

// Get risk analysis for portfolio
export const fetchRiskAnalysis = createAsyncThunk<
  RiskAnalysis,
  RiskAnalysisRequest,
  { rejectValue: string }
>(
  'recommendations/fetchRiskAnalysis',
  async (request, { rejectWithValue }) => {
    try {
      const response = await aiRecommendationsAPI.analyzeRisk(request);
      if (!response.data) {
        return rejectWithValue('Risk analysis data is missing');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch risk analysis'
      );
    }
  }
);

// Generate rebalancing plan
export const fetchRebalancingPlan = createAsyncThunk<
  RebalancingPlan,
  RebalancingRequest,
  { rejectValue: string }
>(
  'recommendations/fetchRebalancingPlan',
  async (request, { rejectWithValue }) => {
    try {
      const response = await aiRecommendationsAPI.generateRebalancingPlan(request);
      if (!response.data) {
        return rejectWithValue('Rebalancing plan data is missing');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch rebalancing plan'
      );
    }
  }
);

// Submit feedback on recommendation
export const submitRecommendationFeedback = createAsyncThunk<
  void,
  RecommendationFeedback,
  { rejectValue: string }
>(
  'recommendations/submitFeedback',
  async (feedback, { rejectWithValue }) => {
    try {
      await aiRecommendationsAPI.submitRecommendationFeedback(
        feedback.recommendationId,
        {
          rating: feedback.rating,
          comment: feedback.comment,
          helpful: feedback.helpful
        }
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to submit feedback'
      );
    }
  }
);

// Execute a recommendation (buy/sell investment)
export const executeRecommendation = createAsyncThunk<
  { recommendationId: string; executionResult: any },
  { recommendationId: string; quantity: number; portfolioId: string },
  { rejectValue: string }
>(
  'recommendations/executeRecommendation',
  async ({ recommendationId, quantity, portfolioId }, { rejectWithValue, dispatch }) => {
    try {
      // First, get the recommendation details
      const recommendation = await aiRecommendationsAPI.getRecommendation(recommendationId);
      
      // Check if recommendation.data is defined
      if (!recommendation.data) {
        return rejectWithValue('Recommendation data is missing');
      }
      // Execute the investment transaction using portfolio API
      const executionResult = await portfolioAPI.createTransaction({
        portfolioId,
        assetId: recommendation.data.assetSymbol,
        type: recommendation.data.type === 'buy' ? 'buy' : 'sell',
        quantity,
        price: recommendation.data.currentPrice
      });

      // Mark recommendation as executed
      await aiRecommendationsAPI.updateRecommendationStatus(recommendationId, 'executed');

      // Refresh recommendations after execution
      dispatch(fetchRecommendations({ 
        portfolioId
      }));

      return {
        recommendationId,
        executionResult: executionResult
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to execute recommendation'
      );
    }
  }
);

// Dismiss a recommendation
export const dismissRecommendation = createAsyncThunk<
  string,
  { recommendationId: string; reason?: string },
  { rejectValue: string }
>(
  'recommendations/dismissRecommendation',
  async ({ recommendationId }, { rejectWithValue }) => {
    try {
      await aiRecommendationsAPI.updateRecommendationStatus(recommendationId, 'dismissed');
      return recommendationId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to dismiss recommendation'
      );
    }
  }
);

// Get recommendations with filters (using existing getRecommendations with params)
export const fetchFilteredRecommendations = createAsyncThunk<
  Recommendation[],
  RecommendationFilters,
  { rejectValue: string }
>(
  'recommendations/fetchFilteredRecommendations',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await aiRecommendationsAPI.getRecommendations({
        portfolioId: filters.portfolioId || '',
        ...filters
      });
      // Always return an array, never undefined
      return response.data ?? [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch filtered recommendations'
      );
    }
  }
);

// Refresh recommendations (get fresh recommendations)
export const refreshRecommendations = createAsyncThunk<
  Recommendation[],
  { portfolioId: string; forceRefresh?: boolean },
  { rejectValue: string }
>(
  'recommendations/refreshRecommendations',
  async ({ portfolioId }, { rejectWithValue }) => {
    try {
      const response = await aiRecommendationsAPI.getRecommendations({
        portfolioId
      });
      // Always return an array, never undefined
      return response.data ?? [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to refresh recommendations'
      );
    }
  }
);

// Get sector-specific recommendations
export const fetchSectorRecommendations = createAsyncThunk<
  Recommendation[],
  { sectors: string[]; portfolioId: string; limit?: number },
  { rejectValue: string }
>(
  'recommendations/fetchSectorRecommendations',
  async ({ sectors, portfolioId, limit }, { rejectWithValue }) => {
    try {
      // Pass only known parameters to the API
      const response = await aiRecommendationsAPI.getRecommendations({
        portfolioId,
        limit
      });
      // Always return an array, never undefined
      return response.data ?? [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch sector recommendations'
      );
    }
  }
);

// Get recommendation performance analytics
export const fetchRecommendationAnalytics = createAsyncThunk<
  {
    totalRecommendations: number;
    executedRecommendations: number;
    averageReturn: number;
    successRate: number;
    performanceByType: Record<string, any>;
  },
  { portfolioId: string; timeRange: string },
  { rejectValue: string }
>(
  'recommendations/fetchRecommendationAnalytics',
  async ({ portfolioId, timeRange }, { rejectWithValue }) => {
    try {
      const response = await aiRecommendationsAPI.getRecommendationPerformance({
        startDate: timeRange,
        endDate: new Date().toISOString().split('T')[0]
      });
      if (!response.data) {
        return rejectWithValue('Recommendation analytics data is missing');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch recommendation analytics'
      );
    }
  }
);

// Execute rebalancing plan
export const executeRebalancingPlan = createAsyncThunk<
  { success: boolean; executedTrades: any[] },
  string,
  { rejectValue: string }
>(
  'recommendations/executeRebalancingPlan',
  async (planId, { rejectWithValue }) => {
    try {
      const response = await aiRecommendationsAPI.executeRebalancing(planId);
      if (!response.data) {
        return rejectWithValue('Rebalancing execution data is missing');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to execute rebalancing plan'
      );
    }
  }
);

// Get model insights
export const fetchModelInsights = createAsyncThunk<
  {
    models: {
      name: string;
      version: string;
      accuracy: number;
      lastTrained: string;
      status: 'active' | 'training' | 'deprecated';
    }[];
    systemHealth: {
      uptime: number;
      responseTime: number;
      errorRate: number;
    };
  },
  void,
  { rejectValue: string }
>(
  'recommendations/fetchModelInsights',
  async (_, { rejectWithValue }) => {
    try {
      const response = await aiRecommendationsAPI.getModelInsights();
      if (!response.data) {
        return rejectWithValue('Model insights data is missing');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch model insights'
      );
    }
  }
);

// Export all thunks for easy importing
export const recommendationThunks = {
  fetchRecommendations,
  fetchPortfolioOptimization,
  fetchMarketInsights,
  fetchRiskAnalysis,
  fetchRebalancingPlan,
  submitRecommendationFeedback,
  executeRecommendation,
  dismissRecommendation,
  fetchFilteredRecommendations,
  refreshRecommendations,
  fetchSectorRecommendations,
  fetchRecommendationAnalytics,
  executeRebalancingPlan,
  fetchModelInsights
};