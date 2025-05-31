import apiClient from './index';
import { ApiEndpoint, AuthTokens } from '../types/api.types';
import { 
  LoginRequest, 
  RegisterRequest, 
  PasswordResetRequest, 
  NewPasswordRequest,
  ChangePasswordRequest,
  EnableTwoFactorRequest,
  VerifyTwoFactorRequest,
  User,
  UserAuth
} from '../types/user.types';
import { ApiResponse } from '../types/index';

// Authentication API responses
interface LoginResponse extends ApiResponse<AuthTokens & { user: User }> {}
interface RegisterResponse extends ApiResponse<{ user: User; message: string }> {}
interface UserResponse extends ApiResponse<User> {}

// Authentication API endpoints
export const authAPI = {
  // User login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(ApiEndpoint.LOGIN, credentials);
    
    // Store tokens in localStorage if login successful
    if (response.data.status === 'success' && response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    
    return response.data;
  },

  // User registration
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(ApiEndpoint.REGISTER, userData);
    return response.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(ApiEndpoint.REFRESH_TOKEN, {
      refreshToken
    });
    
    // Update tokens in localStorage if refresh successful
    if (response.data.status === 'success' && response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    
    return response.data.data!;
  },

  // User logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(ApiEndpoint.LOGOUT);
    } finally {
      // Always clear tokens from localStorage, even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // Forgot password
  forgotPassword: async (data: PasswordResetRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(ApiEndpoint.FORGOT_PASSWORD, data);
    return response.data;
  },

  // Reset password with token
  resetPassword: async (data: NewPasswordRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(ApiEndpoint.RESET_PASSWORD, data);
    return response.data;
  },

  // Change password (authenticated user)
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(ApiEndpoint.CHANGE_PASSWORD, data);
    return response.data;
  },

  // Verify email address
  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(ApiEndpoint.VERIFY_EMAIL, { token });
    return response.data;
  },

  // Resend email verification
  resendEmailVerification: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/resend-verification', { email });
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<UserResponse>(ApiEndpoint.CURRENT_USER);
    return response.data.data!;
  },

  // Check if user is authenticated
  checkAuth: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/auth/verify-token');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },

  // Enable two-factor authentication
  enableTwoFactor: async (data: EnableTwoFactorRequest): Promise<ApiResponse<{ qrCode: string; backupCodes: string[] }>> => {
    const response = await apiClient.post<ApiResponse<{ qrCode: string; backupCodes: string[] }>>(
      `${ApiEndpoint.TWO_FACTOR}/enable`, 
      data
    );
    return response.data;
  },

  // Disable two-factor authentication
  disableTwoFactor: async (password: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(`${ApiEndpoint.TWO_FACTOR}/disable`, { password });
    return response.data;
  },

  // Verify two-factor authentication code
  verifyTwoFactor: async (data: VerifyTwoFactorRequest): Promise<ApiResponse<{ verified: boolean }>> => {
    const response = await apiClient.post<ApiResponse<{ verified: boolean }>>(
      `${ApiEndpoint.TWO_FACTOR}/verify`, 
      data
    );
    return response.data;
  },

  // Generate new backup codes for 2FA
  generateBackupCodes: async (): Promise<ApiResponse<{ backupCodes: string[] }>> => {
    const response = await apiClient.post<ApiResponse<{ backupCodes: string[] }>>(
      `${ApiEndpoint.TWO_FACTOR}/backup-codes`
    );
    return response.data;
  },

  // OAuth login (Google, Facebook, etc.)
  oauthLogin: async (provider: string, code: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(`/auth/oauth/${provider}`, { code });
    
    // Store tokens if login successful
    if (response.data.status === 'success' && response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    
    return response.data;
  },

  // Link OAuth account to existing account
  linkOAuthAccount: async (provider: string, code: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(`/auth/oauth/link/${provider}`, { code });
    return response.data;
  },

  // Unlink OAuth account
  unlinkOAuthAccount: async (provider: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/auth/oauth/unlink/${provider}`);
    return response.data;
  },

  // Check email availability during registration
  checkEmailAvailability: async (email: string): Promise<ApiResponse<{ available: boolean }>> => {
    const response = await apiClient.post<ApiResponse<{ available: boolean }>>(
      '/auth/check-email', 
      { email }
    );
    return response.data;
  },

  // Get user sessions
  getSessions: async (): Promise<ApiResponse<Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>>> => {
    const response = await apiClient.get<ApiResponse<Array<{
      id: string;
      device: string;
      location: string;
      lastActive: string;
      current: boolean;
    }>>>('/auth/sessions');
    return response.data;
  },

  // Revoke specific session
  revokeSession: async (sessionId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  // Revoke all other sessions (keep current)
  revokeAllOtherSessions: async (): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/sessions/revoke-others');
    return response.data;
  },

  // Update user email (requires verification)
  updateEmail: async (newEmail: string, password: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/update-email', {
      newEmail,
      password
    });
    return response.data;
  },

  // Confirm email update with token
  confirmEmailUpdate: async (token: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/confirm-email-update', { token });
    return response.data;
  },

  // Request account deletion
  requestAccountDeletion: async (password: string, reason?: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/request-deletion', {
      password,
      reason
    });
    return response.data;
  },

  // Confirm account deletion with token
  confirmAccountDeletion: async (token: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/confirm-deletion', { token });
    return response.data;
  },

  // Cancel pending account deletion
  cancelAccountDeletion: async (): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/cancel-deletion');
    return response.data;
  },

  // Get account security overview
  getSecurityOverview: async (): Promise<ApiResponse<{
    lastPasswordChange: string;
    twoFactorEnabled: boolean;
    recentLoginAttempts: number;
    activeSessions: number;
    linkedAccounts: string[];
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      lastPasswordChange: string;
      twoFactorEnabled: boolean;
      recentLoginAttempts: number;
      activeSessions: number;
      linkedAccounts: string[];
    }>>('/auth/security-overview');
    return response.data;
  }
};

export default authAPI;