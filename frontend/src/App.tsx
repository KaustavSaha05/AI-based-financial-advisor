import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { checkAuthStatus } from './store/thunks/authThunks';
import Layout from './components/layout/Layout';
import Loading from './components/common/Loading';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Main pages
import Dashboard from './pages/dashboard/Dashboard';
import Portfolio from './pages/portfolio/Portfolio';
import AssetDetails from './pages/portfolio/AssetDetails';
import AIAdvisor from './pages/advisor/AIAdvisor';
import RecommendationDetails from './pages/advisor/RecommendationDetails';
import Goals from './pages/goals/Goals';
import GoalDetails from './pages/goals/GoalDetails';
import Education from './pages/education/Education';
import ArticleView from './pages/education/ArticleView';

// Higher-order component for protected routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return <Loading />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Higher-order component for public routes (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return <Loading />;
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
};

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoading: authLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check if user is already authenticated on app load
    dispatch(checkAuthStatus() as any);
  }, [dispatch]);

  // Show loading screen on initial auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Protected Routes - All wrapped in Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Portfolio */}
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="portfolio/asset/:assetId" element={<AssetDetails />} />

          {/* AI Advisor */}
          <Route path="advisor" element={<AIAdvisor />} />
          <Route path="advisor/recommendation/:recommendationId" element={<RecommendationDetails />} />

          {/* Goals */}
          <Route path="goals" element={<Goals />} />
          <Route path="goals/:goalId" element={<GoalDetails />} />

          {/* Education */}
          <Route path="education" element={<Education />} />
          <Route path="education/article/:articleId" element={<ArticleView />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Fallback for unmatched routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;