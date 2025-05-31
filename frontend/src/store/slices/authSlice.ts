import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  riskTolerance: 'low' | 'medium' | 'high';
  investmentExperience: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginAttempts: number;
  lockoutEndTime: number | null;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lockoutEndTime: null,
  twoFactorEnabled: false,
  emailVerified: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken: string;
      }>
    ) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
      state.loginAttempts = 0;
      state.lockoutEndTime = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.loginAttempts += 1;
      
      // Lock account after 5 failed attempts for 15 minutes
      if (state.loginAttempts >= 5) {
        state.lockoutEndTime = Date.now() + 15 * 60 * 1000;
      }
    },

    // Registration actions
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken: string;
      }>
    ) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      state.loginAttempts = 0;
      state.lockoutEndTime = null;
    },

    // Token refresh
    refreshTokenStart: (state) => {
      state.isLoading = true;
    },
    refreshTokenSuccess: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string }>
    ) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
    },
    refreshTokenFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },

    // Profile updates
    updateProfileStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action: PayloadAction<Partial<User>>) => {
      state.isLoading = false;
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
      state.error = null;
    },
    updateProfileFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Password reset
    passwordResetStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    passwordResetSuccess: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    passwordResetFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Two-factor authentication
    toggleTwoFactor: (state, action: PayloadAction<boolean>) => {
      state.twoFactorEnabled = action.payload;
    },

    // Email verification
    setEmailVerified: (state, action: PayloadAction<boolean>) => {
      state.emailVerified = action.payload;
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
    },

    // Clear lockout
    clearLockout: (state) => {
      state.loginAttempts = 0;
      state.lockoutEndTime = null;
    },

    // Hydrate from storage
    hydrateAuth: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  passwordResetStart,
  passwordResetSuccess,
  passwordResetFailure,
  toggleTwoFactor,
  setEmailVerified,
  clearError,
  clearLockout,
  hydrateAuth,
} = authSlice.actions;

export default authSlice.reducer;