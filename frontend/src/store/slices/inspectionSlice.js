import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inspectionAPI } from '../../services/api/inspectionAPI';

// Async thunks
export const fetchInspections = createAsyncThunk(
  'inspections/fetchInspections',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await inspectionAPI.getAllInspections(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch inspections');
    }
  }
);

export const fetchInspectionById = createAsyncThunk(
  'inspections/fetchInspectionById',
  async (inspectionId, { rejectWithValue }) => {
    try {
      const response = await inspectionAPI.getInspectionById(inspectionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch inspection');
    }
  }
);

export const bookInspection = createAsyncThunk(
  'inspections/bookInspection',
  async ({ unitId, inspectionData }, { rejectWithValue }) => {
    try {
      const response = await inspectionAPI.bookInspection(unitId, inspectionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to book inspection');
    }
  }
);

export const updateInspection = createAsyncThunk(
  'inspections/updateInspection',
  async ({ inspectionId, inspectionData }, { rejectWithValue }) => {
    try {
      const response = await inspectionAPI.updateInspection(inspectionId, inspectionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update inspection');
    }
  }
);

export const cancelInspection = createAsyncThunk(
  'inspections/cancelInspection',
  async (inspectionId, { rejectWithValue }) => {
    try {
      const response = await inspectionAPI.cancelInspection(inspectionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to cancel inspection');
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'inspections/fetchMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inspectionAPI.getMyBookings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch bookings');
    }
  }
);

export const fetchPendingInspections = createAsyncThunk(
  'inspections/fetchPendingInspections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inspectionAPI.getPendingInspections();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch pending inspections');
    }
  }
);

const initialState = {
  inspections: [],
  myBookings: [],
  pendingInspections: [],
  currentInspection: null,
  isLoading: false,
  error: null,
};

const inspectionSlice = createSlice({
  name: 'inspections',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentInspection: (state) => {
      state.currentInspection = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inspections
      .addCase(fetchInspections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInspections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inspections = action.payload;
      })
      .addCase(fetchInspections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Inspection by ID
      .addCase(fetchInspectionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInspectionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInspection = action.payload;
      })
      .addCase(fetchInspectionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Book Inspection
      .addCase(bookInspection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bookInspection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inspections.push(action.payload);
        state.myBookings.push(action.payload);
      })
      .addCase(bookInspection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Inspection
      .addCase(updateInspection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateInspection.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.inspections.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.inspections[index] = action.payload;
        }
        if (state.currentInspection?.id === action.payload.id) {
          state.currentInspection = action.payload;
        }
      })
      .addCase(updateInspection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Cancel Inspection
      .addCase(cancelInspection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelInspection.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.inspections.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.inspections[index] = action.payload;
        }
      })
      .addCase(cancelInspection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch My Bookings
      .addCase(fetchMyBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myBookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Pending Inspections
      .addCase(fetchPendingInspections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingInspections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingInspections = action.payload;
      })
      .addCase(fetchPendingInspections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentInspection } = inspectionSlice.actions;
export default inspectionSlice.reducer;










