import { apiClient, mlClient } from './index';
import { ApiResponse, PaginatedResponse, QueryParams } from '../types';

// Recommendation request types
export interface RecommendationRequest {
  portfolioId: string;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals?: string[];
  timeHorizon?: number; // in years
  includeAlternatives?: boolean;
}

export interface PortfolioOptimizationRequest {
  portfolioId: string;
  targetReturn?: number;
  maxRisk?: number;
  constraints?: {
    minWeights?: Record<string, number>;
    maxWeights?: Record<string, number>;
    excludeAssets?: string[];
  };
}

export interface RiskAnalysisRequest {
  portfolioId: string;
  timeHorizon?: number;
  confidenceLevel?: number; // 0.95, 0.99, etc.
}

export interface RebalancingRequest {
  portfolioId: string;
  targetAllocation?: Record<string, number>;
  threshold?: number; // rebalancing threshold percentage
}

export interface MarketInsightRequest {
  assetTypes?: string[];
  sectors?: string[];
  timeframe?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
}

// Recommendation response types
export interface Recommendation {
  id: string;
  type: 'buy' | 'sell' | 'hold' | 'rebalance';
  assetSymbol: string;
  assetName: string;
  assetType: 'stock' | 'bond' | 'etf' | 'crypto' | 'commodity';
  action: string;
  quantity?: number;
  targetPrice?: number;
  currentPrice: number;
  reasoning: string;
  confidence: number; // 0-1
  expectedReturn?: number;
  riskScore: number; // 0-10
  timeHorizon: string;
  tags: string[];
  createdAt: string;
  expiresAt?: string;
  status: 'active' | 'executed' | 'expired' | 'dismissed';
}

export interface PortfolioOptimization {
  id: string;
  portfolioId: string;
  optimizedAllocation: Record<string, number>;
  expectedReturn: number;
  expectedRisk: number;
  sharpeRatio: number;
  recommendations: {
    assetSymbol: string;
    currentWeight: number;
    targetWeight: number;
    action: 'buy' | 'sell' | 'hold';
    amount: number;
  }[];
  createdAt: string;
  backtestResults?: {
    returns: number[];
    volatility: number;
    maxDrawdown: number;
    winRate: number;
  };
}

export interface RiskAnalysis {
  portfolioId: string;
  overallRisk: number; // 0-10
  valueAtRisk: number;
  expectedShortfall: number;
  volatility: number;
  beta: number;
  correlationMatrix: Record<string, Record<string, number>>;
  riskContribution: Record<string, number>;
  diversificationRatio: number;
  stressTestResults: {
    scenario: string;
    impact: number;
    probability: number;
  }[];
  recommendations: string[];
  createdAt: string;
}

export interface RebalancingPlan {
  portfolioId: string;
  currentAllocation: Record<string, number>;
  targetAllocation: Record<string, number>;
  rebalancingActions: {
    assetSymbol: string;
    action: 'buy' | 'sell';
    amount: number;
    currentValue: number;
    targetValue: number;
  }[];
  totalCost: number;
  taxImplications?: {
    capitalGains: number;
    taxLiability: number;
  };
  createdAt: string;
}

export interface MarketInsight {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'market_trend' | 'sector_analysis' | 'economic_indicator' | 'news_impact';
  relevanceScore: number; // 0-1
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  affectedAssets: string[];
  keyMetrics: Record<string, number>;
  sources: string[];
  createdAt: string;
  expiresAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    recommendations?: string[];
    charts?: any[];
    relatedInsights?: string[];
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
}

// AI Recommendations API class
class AIRecommendationsAPI {
  // Get personalized recommendations
  async getRecommendations(
    params: RecommendationRequest & QueryParams
  ): Promise<PaginatedResponse<Recommendation[]>> {
    const response = await mlClient.get('/recommendations', { params });
    return response.data;
  }

  // Get recommendation by ID
  async getRecommendation(id: string): Promise<ApiResponse<Recommendation>> {
    const response = await mlClient.get(`/recommendations/${id}`);
    return response.data;
  }

  // Update recommendation status
  async updateRecommendationStatus(
    id: string,
    status: 'executed' | 'dismissed'
  ): Promise<ApiResponse<Recommendation>> {
    const response = await apiClient.patch(`/recommendations/${id}/status`, { status });
    return response.data;
  }

  // Generate portfolio optimization
  async optimizePortfolio(
    request: PortfolioOptimizationRequest
  ): Promise<ApiResponse<PortfolioOptimization>> {
    const response = await mlClient.post('/optimization/portfolio', request);
    return response.data;
  }

  // Get portfolio optimization history
  async getOptimizationHistory(
    portfolioId: string,
    params?: QueryParams
  ): Promise<PaginatedResponse<PortfolioOptimization[]>> {
    const response = await mlClient.get(`/optimization/portfolio/${portfolioId}/history`, { params });
    return response.data;
  }

  // Analyze portfolio risk
  async analyzeRisk(request: RiskAnalysisRequest): Promise<ApiResponse<RiskAnalysis>> {
    const response = await mlClient.post('/analysis/risk', request);
    return response.data;
  }

  // Generate rebalancing plan
  async generateRebalancingPlan(
    request: RebalancingRequest
  ): Promise<ApiResponse<RebalancingPlan>> {
    const response = await mlClient.post('/rebalancing/plan', request);
    return response.data;
  }

  // Execute rebalancing plan
  async executeRebalancing(planId: string): Promise<ApiResponse<{ success: boolean; executedTrades: any[] }>> {
    const response = await apiClient.post(`/rebalancing/${planId}/execute`);
    return response.data;
  }

  // Get market insights
  async getMarketInsights(
    request?: MarketInsightRequest & QueryParams
  ): Promise<PaginatedResponse<MarketInsight[]>> {
    const response = await mlClient.get('/insights/market', { params: request });
    return response.data;
  }

  // Get market insight by ID
  async getMarketInsight(id: string): Promise<ApiResponse<MarketInsight>> {
    const response = await mlClient.get(`/insights/market/${id}`);
    return response.data;
  }

  // Start AI chat session
  async createChatSession(): Promise<ApiResponse<ChatSession>> {
    const response = await mlClient.post('/chat/sessions');
    return response.data;
  }

  // Get chat sessions
  async getChatSessions(params?: QueryParams): Promise<PaginatedResponse<ChatSession[]>> {
    const response = await apiClient.get('/chat/sessions', { params });
    return response.data;
  }

  // Get chat session by ID
  async getChatSession(sessionId: string): Promise<ApiResponse<ChatSession>> {
    const response = await apiClient.get(`/chat/sessions/${sessionId}`);
    return response.data;
  }

  // Send message to AI advisor
  async sendChatMessage(
    sessionId: string,
    message: string,
    context?: {
      portfolioId?: string;
      includeRecommendations?: boolean;
      includeAnalysis?: boolean;
    }
  ): Promise<ApiResponse<ChatMessage>> {
    const response = await mlClient.post(`/chat/sessions/${sessionId}/messages`, {
      message,
      context
    });
    return response.data;
  }

  // Archive chat session
  async archiveChatSession(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.patch(`/chat/sessions/${sessionId}/archive`);
    return response.data;
  }

  // Get recommendation performance metrics
  async getRecommendationPerformance(
    params?: {
      startDate?: string;
      endDate?: string;
      type?: string;
    }
  ): Promise<ApiResponse<{
    totalRecommendations: number;
    executedRecommendations: number;
    averageReturn: number;
    successRate: number;
    performanceByType: Record<string, any>;
  }>> {
    const response = await mlClient.get('/recommendations/performance', { params });
    return response.data;
  }

  // Get AI model insights
  async getModelInsights(): Promise<ApiResponse<{
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
  }>> {
    const response = await mlClient.get('/models/insights');
    return response.data;
  }

  // Feedback on recommendations
  async submitRecommendationFeedback(
    recommendationId: string,
    feedback: {
      rating: number; // 1-5
      comment?: string;
      helpful: boolean;
    }
  ): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.post(`/recommendations/${recommendationId}/feedback`, feedback);
    return response.data;
  }
}

export default new AIRecommendationsAPI();