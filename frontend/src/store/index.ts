import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

// Import slice reducers
import authReducer from './slices/authSlice';
import portfolioReducer from './slices/portfolioSlice';
import recommendationsReducer from './slices/recommendationsSlice';
import uiReducer from './slices/uiSlice';

// Root reducer combining all slices
const rootReducer = combineReducers({
  auth: authReducer,
  portfolio: portfolioReducer,
  recommendations: recommendationsReducer,
  ui: uiReducer,
});

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'], // Only persist auth and ui state
  blacklist: ['portfolio', 'recommendations'], // Don't persist sensitive/dynamic data
  version: 1,
  migrate: (state: any) => {
    // Handle state migrations if needed
    return Promise.resolve(state);
  },
};

// UI persist configuration (separate for more granular control)
const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['theme', 'sidebar', 'filters'], // Only persist specific UI state
  blacklist: ['notifications', 'modal', 'loading'], // Don't persist temporary state
};

// Auth persist configuration
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'refreshToken', 'user'], // Persist auth tokens and user info
  blacklist: ['isLoading', 'error'], // Don't persist loading/error states
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedUiReducer = persistReducer(uiPersistConfig, uiReducer);

// Combined reducer with selective persistence
const combinedReducer = combineReducers({
  auth: persistedAuthReducer,
  portfolio: portfolioReducer, // Not persisted
  recommendations: recommendationsReducer, // Not persisted
  ui: persistedUiReducer,
});

// Wrap the combined reducer with persistReducer to add _persist to root state
const persistedRootReducer = persistReducer(persistConfig, combinedReducer);

// Configure store
export const store = configureStore({
  reducer: persistedRootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['register', 'rehydrate'],
      },
      immutableCheck: {
        // Ignore these paths for performance
        ignoredPaths: ['portfolio.marketData', 'recommendations.cache'],
      },
    }).concat([
      // Add custom middleware here if needed
      // logger middleware for development
      ...(process.env.NODE_ENV === 'development' ? [] : []),
    ]),
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState: undefined,
});

// Create persistor
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => ReturnType;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectPortfolio = (state: RootState) => state.portfolio;
export const selectRecommendations = (state: RootState) => state.recommendations;
export const selectUI = (state: RootState) => state.ui;

// Derived selectors
export const selectIsAuthenticated = (state: RootState) => 
  Boolean(state.auth.token && state.auth.user);

export const selectCurrentUser = (state: RootState) => state.auth.user;

export const selectIsLoading = (state: RootState) => 
  state.auth.isLoading || 
  state.portfolio.isLoading || 
  state.recommendations.isLoading ||
  state.ui.loading.global;

export const selectHasError = (state: RootState) =>
  Boolean(state.auth.error || state.portfolio.error || state.recommendations.error);

export const selectPortfolioSummary = (state: RootState) => ({
  totalValue: state.portfolio.activePortfolio?.totalValue ?? 0,
  totalGainLoss: state.portfolio.activePortfolio?.totalReturn ?? 0,
  totalGainLossPercentage: state.portfolio.activePortfolio?.totalReturnPercent ?? 0,
  assetCount: state.portfolio.activePortfolio?.assets?.length ?? 0,
});

export const selectActiveNotifications = (state: RootState) =>
  state.ui.notifications.filter(n => 
    !n.duration || (Date.now() - n.timestamp) < n.duration
  );

export const selectIsMobile = (state: RootState) => 
  state.ui.screenSize === 'mobile';

export const selectIsTablet = (state: RootState) => 
  state.ui.screenSize === 'tablet';

export const selectIsDesktop = (state: RootState) => 
  state.ui.screenSize === 'desktop';

// Action creators for common combinations
export const createAppAsyncThunk = <T>(
  type: string,
  payloadCreator: (arg: T, { dispatch, getState }: { dispatch: AppDispatch; getState: () => RootState }) => Promise<any>
) => {
  return (arg: T) => async (dispatch: AppDispatch, getState: () => RootState) => {
    return payloadCreator(arg, { dispatch, getState });
  };
};

// Store utilities
export const resetStore = () => {
  return {
    type: 'RESET_STORE',
  };
};

// Hydration utilities
export const waitForRehydration = (): Promise<void> => {
  return new Promise((resolve) => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      if (state._persist?.rehydrated) {
        unsubscribe();
        resolve();
      }
    });
  });
};

// Performance monitoring
let lastStateUpdate = Date.now();
export const getStateUpdatePerformance = () => {
  const now = Date.now();
  const timeSinceLastUpdate = now - lastStateUpdate;
  lastStateUpdate = now;
  return timeSinceLastUpdate;
};

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Log state changes in development
  store.subscribe(() => {
    const performance = getStateUpdatePerformance();
    if (performance > 100) {
      console.warn(`Slow state update detected: ${performance}ms`);
    }
  });
}

export default store;

