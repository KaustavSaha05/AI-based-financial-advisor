import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Recommendation {
  id: string;
  userId: string;
  portfolioId: string;
  type: 'buy' | 'sell' | 'rebalance' | 'diversify' | 'tax_loss_harvest';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  title: string;
  description: string;
  rationale: string;
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeHorizon: 'short' | 'medium' | 'long';
  confidence: number; // 0-100
  category: 'portfolio_optimization' | 'risk_management' | 'tax_efficiency' | 'market_opportunity' | 'goal_alignment';
  assetSymbol?: string;
  assetName?: string;
  quantity?: number;
  targetPrice?: number;
  currentPrice?: number;
  action: {
    type: 'buy' | 'sell' | 'rebalance';
    details: any;
  };
  tags: string[];
  createdAt: string;
  expiresAt: string;
  viewedAt?: string;
  actionTakenAt?: string;
}

export interface MarketInsight {
  id: string;
  type: 'trend' | 'news' | 'analysis' | 'alert';
  title: string;
  summary: string;
  content: string;
  impact: 'positive' | 'negative' | 'neutral';
  relevance: number; // 0-100
  sectors: string[];
  assets: string[];
  source: string;
  publishedAt: string;
  createdAt: string;
}

export interface AIAnalysis {
  id: string;
  portfolioId: string;
  type: 'risk' | 'performance' | 'allocation' | 'goal_progress';
  analysis: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  metrics: {
    sharpeRatio: number;
    beta: number;
    alpha: number;
    volatility: number;
    diversificationScore: number;
    riskScore: number;
  };
  recommendations: string[];
  generatedAt: string;
}

export interface RecommendationFilters {
  type: string | null;
  priority: string | null;
  status: string | null;
  category: string | null;
  timeframe: 'today' | 'week' | 'month' | 'all';
}

export interface RecommendationsState {
  recommendations: Recommendation[];
  marketInsights: MarketInsight[];
  aiAnalysis: AIAnalysis[];
  activeRecommendation: Recommendation | null;
  isLoading: boolean;
  error: string | null;
  filters: RecommendationFilters;
  sortBy: {
    field: 'created' | 'priority' | 'confidence' | 'expected_return';
    direction: 'asc' | 'desc';
  };
  lastUpdated: string | null;
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  unreadCount: number;
  notificationSettings: {
    highPriority: boolean;
    marketAlerts: boolean;
    portfolioUpdates: boolean;
    goalProgress: boolean;
  };
}

const initialState: RecommendationsState = {
  recommendations: [],
  marketInsights: [],
  aiAnalysis: [],
  activeRecommendation: null,
  isLoading: false,
  error: null,
  filters: {
    type: null,
    priority: null,
    status: null,
    category: null,
    timeframe: 'all',
  },
  sortBy: {
    field: 'created',
    direction: 'desc',
  },
  lastUpdated: null,
  autoRefresh: true,
  refreshInterval: 15, // 15 minutes
  unreadCount: 0,
  notificationSettings: {
    highPriority: true,
    marketAlerts: true,
    portfolioUpdates: true,
    goalProgress: true,
  },
};

const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    // Fetch recommendations
    fetchRecommendationsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchRecommendationsSuccess: (state, action: PayloadAction<Recommendation[]>) => {
      state.isLoading = false;
      state.recommendations = action.payload;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
      
      // Update unread count
      state.unreadCount = action.payload.filter(r => r.status === 'pending').length;
    },
    fetchRecommendationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Generate new recommendations
    generateRecommendationsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    generateRecommendationsSuccess: (state, action: PayloadAction<Recommendation[]>) => {
      state.isLoading = false;
      
      // Add new recommendations
      const newRecs = action.payload.filter(
        newRec => !state.recommendations.some(existing => existing.id === newRec.id)
      );
      state.recommendations = [...newRecs, ...state.recommendations];
      
      state.error = null;
      state.lastUpdated = new Date().toISOString();
      state.unreadCount += newRecs.length;
    },
    generateRecommendationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Market insights
    fetchMarketInsightsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMarketInsightsSuccess: (state, action: PayloadAction<MarketInsight[]>) => {
      state.isLoading = false;
      state.marketInsights = action.payload;
      state.error = null;
    },
    fetchMarketInsightsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // AI Analysis
    fetchAIAnalysisStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchAIAnalysisSuccess: (state, action: PayloadAction<AIAnalysis[]>) => {
      state.isLoading = false;
      state.aiAnalysis = action.payload;
      state.error = null;
    },
    fetchAIAnalysisFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Recommendation actions
    setActiveRecommendation: (state, action: PayloadAction<string | null>) => {
      if (action.payload) {
        const rec = state.recommendations.find(r => r.id === action.payload);
        state.activeRecommendation = rec || null;
      } else {
        state.activeRecommendation = null;
      }
    },

    markRecommendationViewed: (state, action: PayloadAction<string>) => {
      const recommendation = state.recommendations.find(r => r.id === action.payload);
      if (recommendation && recommendation.status === 'pending') {
        recommendation.status = 'viewed';
        recommendation.viewedAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    acceptRecommendation: (state, action: PayloadAction<string>) => {
      const recommendation = state.recommendations.find(r => r.id === action.payload);
      if (recommendation) {
        const wasPending = recommendation.status === 'pending';
        recommendation.status = 'accepted';
        recommendation.actionTakenAt = new Date().toISOString();
        if (wasPending) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },

    rejectRecommendation: (state, action: PayloadAction<string>) => {
      const recommendation = state.recommendations.find(r => r.id === action.payload);
      if (recommendation) {
        const wasPending = recommendation.status === 'pending';
        recommendation.status = 'rejected';
        recommendation.actionTakenAt = new Date().toISOString();
        if (wasPending) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },

    dismissRecommendation: (state, action: PayloadAction<string>) => {
      const recommendation = state.recommendations.find(r => r.id === action.payload);
      if (recommendation && recommendation.status === 'pending') {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.recommendations = state.recommendations.filter(r => r.id !== action.payload);
    },

    // Bulk actions
    markAllViewed: (state) => {
      state.recommendations = state.recommendations.map(rec => {
        if (rec.status === 'pending') {
          return {
            ...rec,
            status: 'viewed' as const,
            viewedAt: new Date().toISOString(),
          };
        }
        return rec;
      });
      state.unreadCount = 0;
    },

    dismissExpiredRecommendations: (state) => {
      const now = new Date().toISOString();
      const expiredIds = state.recommendations
        .filter(r => r.expiresAt < now && r.status === 'pending')
        .map(r => r.id);
      
      state.recommendations = state.recommendations.map(rec => {
        if (expiredIds.includes(rec.id)) {
          return { ...rec, status: 'expired' as const };
        }
        return rec;
      });
      
      state.unreadCount = state.recommendations.filter(r => r.status === 'pending').length;
    },

    // Filters and sorting
    setRecommendationTypeFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.type = action.payload;
    },
    setPriorityFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.priority = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.status = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.category = action.payload;
    },
    setTimeframeFilter: (state, action: PayloadAction<'today' | 'week' | 'month' | 'all'>) => {
      state.filters.timeframe = action.payload;
    },
    setSortBy: (
      state,
      action: PayloadAction<{
        field: 'created' | 'priority' | 'confidence' | 'expected_return';
        direction: 'asc' | 'desc';
      }>
    ) => {
      state.sortBy = action.payload;
    },

    // Clear filters
    clearRecommendationFilters: (state) => {
      state.filters = {
        type: null,
        priority: null,
        status: null,
        category: null,
        timeframe: 'all',
      };
    },

    // Auto-refresh settings
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },

    // Notification settings
    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<{
        highPriority: boolean;
        marketAlerts: boolean;
        portfolioUpdates: boolean;
        goalProgress: boolean;
      }>>
    ) => {
      state.notificationSettings = {
        ...state.notificationSettings,
        ...action.payload,
      };
    },

    // Real-time updates
    addNewRecommendation: (state, action: PayloadAction<Recommendation>) => {
      state.recommendations.unshift(action.payload);
      if (action.payload.status === 'pending') {
        state.unreadCount += 1;
      }
    },

    updateRecommendation: (state, action: PayloadAction<Recommendation>) => {
      const index = state.recommendations.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        const oldRec = state.recommendations[index];
        state.recommendations[index] = action.payload;
        
        // Update unread count if status changed
        if (oldRec.status === 'pending' && action.payload.status !== 'pending') {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (oldRec.status !== 'pending' && action.payload.status === 'pending') {
          state.unreadCount += 1;
        }
      }
    },

    addMarketInsight: (state, action: PayloadAction<MarketInsight>) => {
      state.marketInsights.unshift(action.payload);
      
      // Keep only the latest 50 insights
      if (state.marketInsights.length > 50) {
        state.marketInsights = state.marketInsights.slice(0, 50);
      }
    },

    // Performance tracking
    trackRecommendationPerformance: (
      state,
      action: PayloadAction<{
        recommendationId: string;
        actualReturn: number;
        timeToAction: number;
      }>
    ) => {
      const recommendation = state.recommendations.find(r => r.id === action.payload.recommendationId);
      if (recommendation) {
        // This could be extended to store performance metrics
        // For now, we'll just update the recommendation with performance data
        (recommendation as any).performanceData = {
          actualReturn: action.payload.actualReturn,
          expectedReturn: recommendation.expectedReturn,
          accuracy: Math.abs(action.payload.actualReturn - recommendation.expectedReturn) < 0.05,
          timeToAction: action.payload.timeToAction,
          trackedAt: new Date().toISOString(),
        };
      }
    },

    // Clear errors
    clearRecommendationError: (state) => {
      state.error = null;
    },

    // Reset state
    resetRecommendationsState: (state) => {
      return { ...initialState };
    },

    // Update last updated timestamp
    updateLastUpdated: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const {
  fetchRecommendationsStart,
  fetchRecommendationsSuccess,
  fetchRecommendationsFailure,
  generateRecommendationsStart,
  generateRecommendationsSuccess,
  generateRecommendationsFailure,
  fetchMarketInsightsStart,
  fetchMarketInsightsSuccess,
  fetchMarketInsightsFailure,
  fetchAIAnalysisStart,
  fetchAIAnalysisSuccess,
  fetchAIAnalysisFailure,
  setActiveRecommendation,
  markRecommendationViewed,
  acceptRecommendation,
  rejectRecommendation,
  dismissRecommendation,
  markAllViewed,
  dismissExpiredRecommendations,
  setRecommendationTypeFilter,
  setPriorityFilter,
  setStatusFilter,
  setCategoryFilter,
  setTimeframeFilter,
  setSortBy,
  clearRecommendationFilters,
  setAutoRefresh,
  setRefreshInterval,
  updateNotificationSettings,
  addNewRecommendation,
  updateRecommendation,
  addMarketInsight,
  trackRecommendationPerformance,
  clearRecommendationError,
  resetRecommendationsState,
  updateLastUpdated,
} = recommendationsSlice.actions;

export default recommendationsSlice.reducer;