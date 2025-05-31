import { createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api/authAPI';
import userAPI from '../../api/userAPI';
import { addNotification } from '../slices/uiSlice';
import type { RootState } from '../index';

// Types for auth requests
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceId?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  acceptTerms: boolean;
  marketingOptIn?: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    theme: 'light' | 'dark';
    currency: string;
    timezone: string;
  };
}

// Login thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    credentials: LoginCredentials,
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have successfully logged in.',
        duration: 3000,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Login Failed',
        message: errorMessage,
        duration: 5000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

// Register thunk
export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    userData: RegisterData,
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Validate passwords match
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await authAPI.register({
        ...userData,
        agreeToTerms: userData.acceptTerms,
      });
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Account Created!',
        message: 'Your account has been created successfully. Please check your email to verify your account.',
        duration: 8000,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: errorMessage,
        duration: 5000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (token) {
        await authAPI.logout();
      }
      
      // Show success notification
      dispatch(addNotification({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been successfully logged out.',
        duration: 3000,
      }));

      return null;
    } catch (error: any) {
      // Even if logout fails on server, we still clear local state
      console.warn('Logout request failed:', error);
      return null;
    }
  }
);

// Refresh token thunk
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.refreshToken(refreshToken);
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Token refresh failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Forgot password thunk
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (
    data: ForgotPasswordData,
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await authAPI.forgotPassword({ email: data.email });
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Reset Email Sent',
        message: 'Password reset instructions have been sent to your email.',
        duration: 8000,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send password reset email.';
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Password Reset Failed',
        message: errorMessage,
        duration: 5000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

// Reset password thunk
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    data: ResetPasswordData,
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await authAPI.resetPassword({ 
        token: data.token, 
        password: data.password, 
        confirmPassword: data.confirmPassword 
      });
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Password Reset Successful',
        message: 'Your password has been reset successfully. You can now log in with your new password.',
        duration: 8000,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset failed.';
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Password Reset Failed',
        message: errorMessage,
        duration: 5000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

// Change password thunk
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    data: ChangePasswordData,
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Validate passwords match
      if (data.newPassword !== data.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      const response = await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Password Changed',
        message: 'Your password has been changed successfully.',
        duration: 5000,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password change failed.';
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Password Change Failed',
        message: errorMessage,
        duration: 5000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

// Verify email thunk
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (
    token: string,
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await authAPI.verifyEmail(token);
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Email Verified',
        message: 'Your email has been verified successfully.',
        duration: 5000,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Email verification failed.';
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Verification Failed',
        message: errorMessage,
        duration: 5000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

// Resend verification email thunk
export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (
    email: string,
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Fixed method name to match authAPI
      const response = await authAPI.resendEmailVerification(email);
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Verification Email Sent',
        message: 'A new verification email has been sent to your email address.',
        duration: 8000,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send verification email.';
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Send Email Failed',
        message: errorMessage,
        duration: 5000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

// Update profile thunk
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    data: UpdateProfileData,
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await userAPI.updateProfile(data);
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully.',
        duration: 5000,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile update failed.';
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage,
        duration: 5000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

// Get user profile thunk
export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getProfile();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch user profile.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete account thunk
export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (
    password: string,
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await userAPI.deleteAccount(password);
      
      // Show success notification
      dispatch(addNotification({
        type: 'info',
        title: 'Account Deleted',
        message: 'Your account has been deleted successfully.',
        duration: 5000,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Account deletion failed.';
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: errorMessage,
        duration: 5000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

// Check authentication status thunk
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        throw new Error('No token available');
      }

      // Verify token is still valid
      const response = await userAPI.getProfile();
      return response.data;
    } catch (error: any) {
      // If token is invalid, try to refresh
      try {
        await dispatch(refreshToken()).unwrap();
        const response = await userAPI.getProfile();
        return response.data;
      } catch (refreshError) {
        // Both token validation and refresh failed
        return rejectWithValue('Authentication expired');
      }
    }
  }
);

// Enable 2FA thunk
export const enable2FA = createAsyncThunk(
  'auth/enable2FA',
  async (
    phoneNumber: string,
    { dispatch, rejectWithValue }
  ) => {
    try {
      // EnableTwoFactorRequest expects phoneNumber
      const response = await authAPI.enableTwoFactor({ phoneNumber });
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: '2FA Setup Initiated',
        message: 'Two-factor authentication setup has been initiated. Please verify with the code sent to your phone.',
        duration: 8000,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '2FA setup failed.';
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: '2FA Setup Failed',
        message: errorMessage,
        duration: 5000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

// Disable 2FA thunk
export const disable2FA = createAsyncThunk(
  'auth/disable2FA',
  async (
    password: string, // Fixed parameter type to match authAPI
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Fixed method name
      const response = await authAPI.disableTwoFactor(password);
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: '2FA Disabled',
        message: 'Two-factor authentication has been disabled for your account.',
        duration: 5000,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '2FA disable failed.';
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: '2FA Disable Failed',
        message: errorMessage,
        duration: 5000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

// Verify 2FA thunk
export const verify2FA = createAsyncThunk(
  'auth/verify2FA',
  async (
    data: { code: string; backupCode?: boolean },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await authAPI.verifyTwoFactor(data);
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: '2FA Verified',
        message: 'Two-factor authentication code verified successfully.',
        duration: 3000,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '2FA verification failed.';
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: '2FA Verification Failed',
        message: errorMessage,
        duration: 5000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

// Generate backup codes thunk
export const generateBackupCodes = createAsyncThunk(
  'auth/generateBackupCodes',
  async (
    _,
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await authAPI.generateBackupCodes();
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Backup Codes Generated',
        message: 'New backup codes have been generated. Please save them securely.',
        duration: 8000,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to generate backup codes.';
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Backup Codes Failed',
        message: errorMessage,
        duration: 5000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

// Check email availability thunk
export const checkEmailAvailability = createAsyncThunk(
  'auth/checkEmailAvailability',
  async (
    email: string,
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.checkEmailAvailability(email);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to check email availability.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get user sessions thunk
export const getUserSessions = createAsyncThunk(
  'auth/getUserSessions',
  async (
    _,
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.getSessions();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch sessions.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Revoke session thunk
export const revokeSession = createAsyncThunk(
  'auth/revokeSession',
  async (
    sessionId: string,
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await authAPI.revokeSession(sessionId);
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Session Revoked',
        message: 'The selected session has been terminated.',
        duration: 3000,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to revoke session.';
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Revoke Failed',
        message: errorMessage,
        duration: 5000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

// Revoke all other sessions thunk
export const revokeAllOtherSessions = createAsyncThunk(
  'auth/revokeAllOtherSessions',
  async (
    _,
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await authAPI.revokeAllOtherSessions();
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Sessions Revoked',
        message: 'All other sessions have been terminated.',
        duration: 3000,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to revoke sessions.';
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Revoke Failed',
        message: errorMessage,
        duration: 5000,
      }));

      return rejectWithValue(errorMessage);
    }
  }
);

// Get security overview thunk
export const getSecurityOverview = createAsyncThunk(
  'auth/getSecurityOverview',
  async (
    _,
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.getSecurityOverview();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch security overview.';
      return rejectWithValue(errorMessage);
    }
  }
);