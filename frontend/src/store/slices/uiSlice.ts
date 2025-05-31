import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

export interface ModalState {
  isOpen: boolean;
  type: 'confirmation' | 'form' | 'info' | 'error' | null;
  title?: string;
  content?: string;
  data?: any;
}

export interface LoadingState {
  global: boolean;
  portfolio: boolean;
  recommendations: boolean;
  transactions: boolean;
  marketData: boolean;
  userProfile: boolean;
}

export interface UIState {
  theme: 'light' | 'dark';
  sidebar: {
    isOpen: boolean;
    isMobile: boolean;
  };
  notifications: NotificationState[];
  modal: ModalState;
  loading: LoadingState;
  screenSize: 'mobile' | 'tablet' | 'desktop';
  activeTab: string;
  filters: {
    dateRange: {
      start: string | null;
      end: string | null;
    };
    assetType: string[];
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  searchQuery: string;
  isOnline: boolean;
  lastActivity: number;
}

const initialState: UIState = {
  theme: 'light',
  sidebar: {
    isOpen: true,
    isMobile: false,
  },
  notifications: [],
  modal: {
    isOpen: false,
    type: null,
  },
  loading: {
    global: false,
    portfolio: false,
    recommendations: false,
    transactions: false,
    marketData: false,
    userProfile: false,
  },
  screenSize: 'desktop',
  activeTab: 'overview',
  filters: {
    dateRange: {
      start: null,
      end: null,
    },
    assetType: [],
    sortBy: 'name',
    sortOrder: 'asc',
  },
  searchQuery: '',
  isOnline: true,
  lastActivity: Date.now(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload;
    },
    setSidebarMobile: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isMobile = action.payload;
    },

    // Notification actions
    addNotification: (state, action: PayloadAction<Omit<NotificationState, 'id' | 'timestamp'>>) => {
      const notification: NotificationState = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      state.notifications.unshift(notification);
      
      // Keep only the last 10 notifications
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(0, 10);
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Modal actions
    openModal: (state, action: PayloadAction<Omit<ModalState, 'isOpen'>>) => {
      state.modal = {
        ...action.payload,
        isOpen: true,
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        title: undefined,
        content: undefined,
        data: undefined,
      };
    },
    setModalData: (state, action: PayloadAction<any>) => {
      state.modal.data = action.payload;
    },

    // Loading actions
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setPortfolioLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.portfolio = action.payload;
    },
    setRecommendationsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.recommendations = action.payload;
    },
    setTransactionsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.transactions = action.payload;
    },
    setMarketDataLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.marketData = action.payload;
    },
    setUserProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.userProfile = action.payload;
    },
    setLoading: (state, action: PayloadAction<Partial<LoadingState>>) => {
      state.loading = { ...state.loading, ...action.payload };
    },

    // Screen size actions
    setScreenSize: (state, action: PayloadAction<'mobile' | 'tablet' | 'desktop'>) => {
      state.screenSize = action.payload;
      
      // Auto-adjust sidebar for mobile
      if (action.payload === 'mobile') {
        state.sidebar.isMobile = true;
        state.sidebar.isOpen = false;
      } else {
        state.sidebar.isMobile = false;
        state.sidebar.isOpen = true;
      }
    },

    // Tab actions
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },

    // Filter actions
    setDateRange: (state, action: PayloadAction<{ start: string | null; end: string | null }>) => {
      state.filters.dateRange = action.payload;
    },
    setAssetTypeFilter: (state, action: PayloadAction<string[]>) => {
      state.filters.assetType = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.filters.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.filters.sortOrder = action.payload;
    },
    toggleSortOrder: (state) => {
      state.filters.sortOrder = state.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Search actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
    },

    // Network status actions
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },

    // Activity tracking
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },

    // Bulk actions
    resetUIState: () => initialState,
  },
});

export const {
  // Theme actions
  setTheme,
  toggleTheme,
  
  // Sidebar actions
  toggleSidebar,
  setSidebarOpen,
  setSidebarMobile,
  
  // Notification actions
  addNotification,
  removeNotification,
  clearNotifications,
  
  // Modal actions
  openModal,
  closeModal,
  setModalData,
  
  // Loading actions
  setGlobalLoading,
  setPortfolioLoading,
  setRecommendationsLoading,
  setTransactionsLoading,
  setMarketDataLoading,
  setUserProfileLoading,
  setLoading,
  
  // Screen size actions
  setScreenSize,
  
  // Tab actions
  setActiveTab,
  
  // Filter actions
  setDateRange,
  setAssetTypeFilter,
  setSortBy,
  setSortOrder,
  toggleSortOrder,
  resetFilters,
  
  // Search actions
  setSearchQuery,
  clearSearchQuery,
  
  // Network status actions
  setOnlineStatus,
  
  // Activity tracking
  updateLastActivity,
  
  // Bulk actions
  resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;