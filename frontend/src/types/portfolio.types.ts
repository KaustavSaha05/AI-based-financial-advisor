import { BaseState, Currency, TimeSeriesDataPoint } from './index';

// Asset types
export type AssetType = 'stock' | 'etf' | 'bond' | 'crypto' | 'mutual_fund' | 'real_estate' | 'cash' | 'commodity' | 'other';

// Asset classes
export type AssetClass = 'equity' | 'fixed_income' | 'cash' | 'alternative' | 'real_estate' | 'commodity';

// Sectors
export type Sector = 
  'technology' | 'healthcare' | 'financial' | 'consumer_discretionary' | 'consumer_staples' | 
  'industrial' | 'energy' | 'utility' | 'telecom' | 'materials' | 'real_estate' | 'other';

// Market data intervals
export type MarketDataInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1mo';

// Transaction types
export type TransactionType = 'buy' | 'sell' | 'dividend' | 'interest' | 'deposit' | 'withdrawal' | 'fee' | 'transfer_in' | 'transfer_out';

// Asset interface
export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  assetClass: AssetClass;
  sector?: Sector;
  industry?: string;
  currentPrice: number;
  currency: Currency;
  priceChange: number;
  priceChangePercent: number;
  marketCap?: number;
  volume?: number;
  high52Week?: number;
  low52Week?: number;
  beta?: number;
  dividend?: number;
  dividendYield?: number;
  peRatio?: number;
  description?: string;
  logoUrl?: string;
  riskLevel?: 1 | 2 | 3 | 4 | 5; // 1 = lowest risk, 5 = highest risk
  country?: string;
  exchange?: string;
  lastUpdated: string;
}

// Portfolio interface
export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  totalValue: number;
  initialInvestment: number;
  currency: Currency;
  cash: number;
  positions: Position[];
  performanceSummary: PerformanceSummary;
  riskMetrics: RiskMetrics;
  allocationSummary: AllocationSummary;
}

// Position interface (holdings in a portfolio)
export interface Position {
  id: string;
  portfolioId: string;
  asset: Asset;
  quantity: number;
  averagePrice: number;
  currentValue: number;
  costBasis: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  weight: number; // % of portfolio
  lastUpdated: string;
}

// Performance summary
export interface PerformanceSummary {
  totalReturn: number;
  totalReturnPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  weeklyChange: number;
  weeklyChangePercent: number;
  monthlyChange: number;
  monthlyChangePercent: number;
  yearlyChange: number;
  yearlyChangePercent: number;
  allTimeChange: number;
  allTimeChangePercent: number;
}

// Risk metrics
export interface RiskMetrics {
  sharpeRatio?: number;
  volatility?: number;
  alpha?: number;
  beta?: number;
  riskScore?: number; // 1-100 score
  maxDrawdown?: number;
  drawdownPeriod?: {
    start: string;
    end: string;
  };
  diversificationScore?: number; // 1-100 score
}

// Asset allocation summary
export interface AllocationSummary {
  byAssetClass: AllocationBreakdown[];
  bySector: AllocationBreakdown[];
  byAsset: AllocationBreakdown[];
  byRegion?: AllocationBreakdown[];
  byRiskLevel?: AllocationBreakdown[];
}

// Allocation breakdown
export interface AllocationBreakdown {
  name: string;
  value: number;
  percentage: number;
  color?: string; // For charts
}

// Transaction interface
export interface Transaction {
  id: string;
  portfolioId: string;
  assetId: string;
  asset?: Asset; // Populated when retrieved
  type: TransactionType;
  quantity: number;
  price: number;
  amount: number;
  currency: Currency;
  date: string;
  notes?: string;
  fee?: number;
  createdAt: string;
  updatedAt: string;
}

export { TimeSeriesDataPoint, Currency };
