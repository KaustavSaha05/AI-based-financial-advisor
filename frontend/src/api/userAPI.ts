import { apiClient } from './index';
import { ApiResponse, PaginatedResponse, QueryParams } from '../types';

// User profile types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  profilePicture?: string;
}

// User preferences types
export interface UserPreferences {
  id: string;
  userId: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  investmentGoals: string[];
  timeHorizon: number; // in years
  monthlyInvestmentAmount?: number;
  preferredAssetTypes: string[];
  esgInvesting: boolean; // Environmental, Social, Governance
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  };
  privacy: {
    sharePerformance: boolean;
    allowDataAnalytics: boolean;
    marketingEmails: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencesRequest {
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  investmentExperience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  investmentGoals?: string[];
  timeHorizon?: number;
  monthlyInvestmentAmount?: number;
  preferredAssetTypes?: string[];
  esgInvesting?: boolean;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    frequency?: 'immediate' | 'daily' | 'weekly' | 'monthly';
  };
  privacy?: {
    sharePerformance?: boolean;
    allowDataAnalytics?: boolean;
    marketingEmails?: boolean;
  };
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  currency?: string;
}

// Financial profile types
export interface FinancialProfile {
  id: string;
  userId: string;
  annualIncome?: number;
  netWorth?: number;
  liquidAssets?: number;
  monthlyExpenses?: number;
  employmentStatus: 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student';
  dependents: number;
  debtToIncomeRatio?: number;
  emergencyFundMonths?: number;
  hasRetirementAccount: boolean;
  investmentObjectives: string[];
  riskCapacity: number; // 1-10 scale
  createdAt: string;
  updatedAt: string;
}

export interface UpdateFinancialProfileRequest {
  annualIncome?: number;
  netWorth?: number;
  liquidAssets?: number;
  monthlyExpenses?: number;
  employmentStatus?: 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student';
  dependents?: number;
  debtToIncomeRatio?: number;
  emergencyFundMonths?: number;
  hasRetirementAccount?: boolean;
  investmentObjectives?: string[];
  riskCapacity?: number;
}

// Activity and notification types
export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'trade' | 'deposit' | 'withdrawal' | 'profile_update' | 'recommendation_view';
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'account' | 'portfolio' | 'market' | 'recommendation' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  readAt?: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  categories: {
    account: { email: boolean; push: boolean; sms: boolean };
    portfolio: { email: boolean; push: boolean; sms: boolean };
    market: { email: boolean; push: boolean; sms: boolean };
    recommendation: { email: boolean; push: boolean; sms: boolean };
    system: { email: boolean; push: boolean; sms: boolean };
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  updatedAt: string;
}

// Security types
export interface SecuritySettings {
  id: string;
  userId: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: 'sms' | 'email' | 'authenticator';
  loginNotifications: boolean;
  sessionTimeout: number; // in minutes
  allowedIpAddresses: string[];
  lastPasswordChange: string;
  failedLoginAttempts: number;
  accountLocked: boolean;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSecurityRequest {
  twoFactorEnabled?: boolean;
  twoFactorMethod?: 'sms' | 'email' | 'authenticator';
  loginNotifications?: boolean;
  sessionTimeout?: number;
  allowedIpAddresses?: string[];
}

// Document types
export interface UserDocument {
  id: string;
  userId: string;
  type: 'identity' | 'address' | 'income' | 'tax' | 'other';
  name: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// User API class
class UserAPI {
  // Profile management
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.get('/users/profile');
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  }

  async uploadProfilePicture(file: File): Promise<ApiResponse<{ profilePicture: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/users/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async deleteProfilePicture(): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.delete('/users/profile/picture');
    return response.data;
  }

  // Preferences management
  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    const response = await apiClient.get('/users/preferences');
    return response.data;
  }

  async updatePreferences(data: UpdatePreferencesRequest): Promise<ApiResponse<UserPreferences>> {
    const response = await apiClient.put('/users/preferences', data);
    return response.data;
  }

  // Financial profile management
  async getFinancialProfile(): Promise<ApiResponse<FinancialProfile>> {
    const response = await apiClient.get('/users/financial-profile');
    return response.data;
  }

  async updateFinancialProfile(data: UpdateFinancialProfileRequest): Promise<ApiResponse<FinancialProfile>> {
    const response = await apiClient.put('/users/financial-profile', data);
    return response.data;
  }

  // Activity tracking
  async getActivity(params?: QueryParams & {
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<UserActivity[]>> {
    const response = await apiClient.get('/users/activity', { params });
    return response.data;
  }

  // Notifications
  async getNotifications(params?: QueryParams & {
    category?: string;
    read?: boolean;
    priority?: string;
  }): Promise<PaginatedResponse<Notification[]>> {
    const response = await apiClient.get('/users/notifications', { params });
    return response.data;
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.patch(`/users/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.patch('/users/notifications/read-all');
    return response.data;
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.delete(`/users/notifications/${notificationId}`);
    return response.data;
  }

  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    const response = await apiClient.get('/users/notification-settings');
    return response.data;
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
    const response = await apiClient.put('/users/notification-settings', settings);
    return response.data;
  }

  // Security settings
  async getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    const response = await apiClient.get('/users/security');
    return response.data;
  }

  async updateSecuritySettings(data: UpdateSecurityRequest): Promise<ApiResponse<SecuritySettings>> {
    const response = await apiClient.put('/users/security', data);
    return response.data;
  }

  async enableTwoFactor(method: 'sms' | 'email' | 'authenticator'): Promise<ApiResponse<{
    secret?: string;
    qrCode?: string;
    backupCodes?: string[];
  }>> {
    const response = await apiClient.post('/users/security/2fa/enable', { method });
    return response.data;
  }

  async verifyTwoFactor(code: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.post('/users/security/2fa/verify', { code });
    return response.data;
  }

  async disableTwoFactor(password: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.post('/users/security/2fa/disable', { password });
    return response.data;
  }

  async generateBackupCodes(): Promise<ApiResponse<{ backupCodes: string[] }>> {
    const response = await apiClient.post('/users/security/backup-codes');
    return response.data;
  }

  // Document management
  async getDocuments(params?: QueryParams & {
    type?: string;
    verified?: boolean;
  }): Promise<PaginatedResponse<UserDocument[]>> {
    const response = await apiClient.get('/users/documents', { params });
    return response.data;
  }

  async uploadDocument(
    file: File,
    type: 'identity' | 'address' | 'income' | 'tax' | 'other',
    name: string
  ): Promise<ApiResponse<UserDocument>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('name', name);
    
    const response = await apiClient.post('/users/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async deleteDocument(documentId: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.delete(`/users/documents/${documentId}`);
    return response.data;
  }

  // Account management
  async requestAccountVerification(): Promise<ApiResponse<{ success: boolean; verificationId: string }>> {
    const response = await apiClient.post('/users/verify-account');
    return response.data;
  }

  async requestEmailVerification(): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.post('/users/verify-email');
    return response.data;
  }

  async verifyEmail(token: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.post('/users/verify-email/confirm', { token });
    return response.data;
  }

  async requestPhoneVerification(): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.post('/users/verify-phone');
    return response.data;
  }

  async verifyPhone(code: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.post('/users/verify-phone/confirm', { code });
    return response.data;
  }

  async deactivateAccount(password: string, reason?: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.post('/users/deactivate', { password, reason });
    return response.data;
  }

  async deleteAccount(password: string, reason?: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.post('/users/delete', { password, reason });
    return response.data;
  }

  // Data export
  async requestDataExport(): Promise<ApiResponse<{ exportId: string; estimatedTime: string }>> {
    const response = await apiClient.post('/users/data-export');
    return response.data;
  }

  async getDataExportStatus(exportId: string): Promise<ApiResponse<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    downloadUrl?: string;
    expiresAt?: string;
  }>> {
    const response = await apiClient.get(`/users/data-export/${exportId}`);
    return response.data;
  }

  // User statistics
  async getUserStats(): Promise<ApiResponse<{
    accountAge: number;
    totalLogins: number;
    lastLoginAt: string;
    portfolioCount: number;
    totalInvestments: number;
    recommendationsReceived: number;
    recommendationsExecuted: number;
    documentsUploaded: number;
  }>> {
    const response = await apiClient.get('/users/stats');
    return response.data;
  }
}

export default new UserAPI();