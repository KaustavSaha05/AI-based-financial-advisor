import { BaseState, Currency } from './index';

// User roles
export type UserRole = 'user' | 'advisor' | 'admin';

// Risk tolerance levels
export type RiskTolerance = 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high';

// Investment experience levels
export type InvestmentExperience = 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Investment horizon
export type InvestmentHorizon = 'short' | 'medium' | 'long';

// User profile interface
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  birthDate?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  profileImage?: string;
  preferredCurrency: Currency;
  prefersDarkMode?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

// User investment profile
export interface UserInvestmentProfile {
  riskTolerance: RiskTolerance;
  investmentExperience: InvestmentExperience;
  investmentHorizon: InvestmentHorizon;
  initialInvestment?: number;
  monthlyContribution?: number;
  financialGoals?: string[];
  preferredSectors?: string[];
  preferredAssetClasses?: string[];
  excludedSectors?: string[];
  taxBracket?: string;
  retirementAge?: number;
  hasChildren?: boolean;
  hasHomeOwnership?: boolean;
  hasMortgage?: boolean;
  hasStudentLoans?: boolean;
  createdAt: string;
  updatedAt: string;
}

// User authentication data
export interface UserAuth {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  lastLogin?: string;
  accessToken?: string;
  refreshToken?: string;
}

// Complete user data
export interface User {
  auth: UserAuth;
  profile: UserProfile;
  investmentProfile?: UserInvestmentProfile;
}

// User state in Redux store
export interface UserState extends BaseState<User | null> {
  isAuthenticated: boolean;
  isLoading: boolean;
  accountVerified: boolean;
  profileComplete: boolean;
  investmentProfileComplete: boolean;
}

// Login request data
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Registration request data
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  preferredCurrency?: Currency;
  agreeToTerms: boolean;
}

// Password reset request
export interface PasswordResetRequest {
  email: string;
}

// New password submit
export interface NewPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// Update profile request
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  birthDate?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferredCurrency?: Currency;
  prefersDarkMode?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

// Update investment profile request
export interface UpdateInvestmentProfileRequest {
  riskTolerance?: RiskTolerance;
  investmentExperience?: InvestmentExperience;
  investmentHorizon?: InvestmentHorizon;
  initialInvestment?: number;
  monthlyContribution?: number;
  financialGoals?: string[];
  preferredSectors?: string[];
  preferredAssetClasses?: string[];
  excludedSectors?: string[];
  taxBracket?: string;
  retirementAge?: number;
  hasChildren?: boolean;
  hasHomeOwnership?: boolean;
  hasMortgage?: boolean;
  hasStudentLoans?: boolean;
}

// Change password request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Enable two-factor authentication request
export interface EnableTwoFactorRequest {
  phoneNumber: string;
}

// Verify two-factor code
export interface VerifyTwoFactorRequest {
  code: string;
}

// User notification preferences
export interface NotificationPreferences {
  email: {
    marketing: boolean;
    portfolioAlerts: boolean;
    priceAlerts: boolean;
    securityAlerts: boolean;
    newsDigest: boolean;
  };
  push: {
    marketing: boolean;
    portfolioAlerts: boolean;
    priceAlerts: boolean;
    securityAlerts: boolean;
    newsDigest: boolean;
  };
}

// Risk assessment question
export interface RiskAssessmentQuestion {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    score: number;
  }>;
}

// Risk assessment answer
export interface RiskAssessmentAnswer {
  questionId: string;
  selectedOptionId: string;
}

// Risk assessment submission
export interface RiskAssessmentSubmission {
  answers: RiskAssessmentAnswer[];
}

// Risk assessment result
export interface RiskAssessmentResult {
  riskTolerance: RiskTolerance;
  score: number;
  maxScore: number;
  recommendation: string;
}