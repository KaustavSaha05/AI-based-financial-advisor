import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { 
  loginUser, 
  logoutUser, 
  registerUser, 
  refreshToken as refreshTokenThunk,
  updateProfile as updateProfileThunk
} from '../store/thunks/authThunks';
import { 
  logout as clearAuth, 
  loginStart,
  clearError 
} from '../store/slices/authSlice';
import { 
  LoginCredentials, 
  RegisterData, 
  UpdateProfileData 
} from '../store/thunks/authThunks';
import { User } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error
  } = useSelector((state: RootState) => state.auth);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const result = await dispatch(loginUser(credentials));
      if (loginUser.fulfilled.match(result)) {
        navigate('/dashboard');
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Login failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }, [dispatch, navigate]);

  // Register function
  const register = useCallback(async (userData: RegisterData) => {
    try {
      const result = await dispatch(registerUser(userData));
      if (registerUser.fulfilled.match(result)) {
        navigate('/dashboard');
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Registration failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }, [dispatch, navigate]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser());
      navigate('/login');
    } catch (error) {
      // Clear auth state even if logout request fails
      dispatch(clearAuth());
      navigate('/login');
    }
  }, [dispatch, navigate]);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const result = await dispatch(refreshTokenThunk());
      return refreshTokenThunk.fulfilled.match(result);
    } catch (error) {
      return false;
    }
  }, [dispatch]);

  // Check if user has specific role
  const hasRole = useCallback((role: string) => {
    // Note: The User interface in authSlice doesn't have roles property
    // You may need to add this to the User interface if needed
    return false; // Placeholder implementation
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: string[]) => {
    // Note: The User interface in authSlice doesn't have roles property
    // You may need to add this to the User interface if needed
    return false; // Placeholder implementation
  }, [user]);

  // Update user profile
  const updateProfile = useCallback(async (profileData: UpdateProfileData) => {
    dispatch(loginStart()); // Using existing loading action
    try {
      const result = await dispatch(updateProfileThunk(profileData));
      if (updateProfileThunk.fulfilled.match(result)) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.payload as string || 'Failed to update profile' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to update profile' 
      };
    }
  }, [dispatch]);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    // Decode token to get expiration time
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const expTime = tokenPayload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expTime - currentTime;
      
      // Refresh token 5 minutes before expiration
      const refreshTime = timeUntilExpiry - (5 * 60 * 1000);
      
      if (refreshTime > 0) {
        const timeoutId = setTimeout(() => {
          refreshToken();
        }, refreshTime);
        
        return () => clearTimeout(timeoutId);
      } else {
        // Token is about to expire or already expired
        refreshToken();
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }, [token, isAuthenticated, refreshToken]);

  // Clear error after a delay
  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [error, dispatch]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    
    // Utilities
    hasRole,
    hasAnyRole
  };
};