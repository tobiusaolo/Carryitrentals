import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsAPI } from '../../services/api/analyticsAPI';

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'analytics/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getDashboardData();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchPropertyAnalytics = createAsyncThunk(
  'analytics/fetchPropertyAnalytics',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getPropertyAnalytics(propertyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch property analytics');
    }
  }
);

export const fetchRentalStats = createAsyncThunk(
  'analytics/fetchRentalStats',
  async ({ type, id }, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getRentalStats(type, id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch rental stats');
    }
  }
);

const initialState = {
  dashboardData: null,
  propertyAnalytics: null,
  rentalStats: null,
  isLoading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAnalytics: (state) => {
      state.dashboardData = null;
      state.propertyAnalytics = null;
      state.rentalStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Property Analytics
      .addCase(fetchPropertyAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPropertyAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.propertyAnalytics = action.payload;
      })
      .addCase(fetchPropertyAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Rental Stats
      .addCase(fetchRentalStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRentalStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rentalStats = action.payload;
      })
      .addCase(fetchRentalStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;










