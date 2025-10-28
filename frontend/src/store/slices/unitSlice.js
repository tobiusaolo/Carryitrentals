import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { unitAPI } from '../../services/api/unitAPI';

// Async thunks
export const fetchUnits = createAsyncThunk(
  'units/fetchUnits',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await unitAPI.getAllUnits(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch units');
    }
  }
);

export const fetchUnitById = createAsyncThunk(
  'units/fetchUnitById',
  async (unitId, { rejectWithValue }) => {
    try {
      const response = await unitAPI.getUnitById(unitId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch unit');
    }
  }
);

export const createUnit = createAsyncThunk(
  'units/createUnit',
  async (unitData, { rejectWithValue }) => {
    try {
      const response = await unitAPI.createUnit(unitData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create unit');
    }
  }
);

export const updateUnit = createAsyncThunk(
  'units/updateUnit',
  async ({ unitId, unitData }, { rejectWithValue }) => {
    try {
      const response = await unitAPI.updateUnit(unitId, unitData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update unit');
    }
  }
);

export const updateUnitStatus = createAsyncThunk(
  'units/updateUnitStatus',
  async ({ unitId, status }, { rejectWithValue }) => {
    try {
      const response = await unitAPI.updateUnitStatus(unitId, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update unit status');
    }
  }
);

export const deleteUnit = createAsyncThunk(
  'units/deleteUnit',
  async (unitId, { rejectWithValue }) => {
    try {
      await unitAPI.deleteUnit(unitId);
      return unitId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete unit');
    }
  }
);

export const uploadUnitImages = createAsyncThunk(
  'units/uploadUnitImages',
  async ({ unitId, images }, { rejectWithValue }) => {
    try {
      const response = await unitAPI.uploadUnitImages(unitId, images);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to upload images');
    }
  }
);

const initialState = {
  units: [],
  currentUnit: null,
  isLoading: false,
  error: null,
};

const unitSlice = createSlice({
  name: 'units',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUnit: (state) => {
      state.currentUnit = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Units
      .addCase(fetchUnits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.units = action.payload;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Unit by ID
      .addCase(fetchUnitById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnitById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUnit = action.payload;
      })
      .addCase(fetchUnitById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Unit
      .addCase(createUnit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.units.push(action.payload);
      })
      .addCase(createUnit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Unit
      .addCase(updateUnit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUnit.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.units.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.units[index] = action.payload;
        }
        if (state.currentUnit?.id === action.payload.id) {
          state.currentUnit = action.payload;
        }
      })
      .addCase(updateUnit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Unit Status
      .addCase(updateUnitStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUnitStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.units.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.units[index] = action.payload;
        }
        if (state.currentUnit?.id === action.payload.id) {
          state.currentUnit = action.payload;
        }
      })
      .addCase(updateUnitStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Unit
      .addCase(deleteUnit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUnit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.units = state.units.filter(u => u.id !== action.payload);
        if (state.currentUnit?.id === action.payload) {
          state.currentUnit = null;
        }
      })
      .addCase(deleteUnit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Upload Unit Images
      .addCase(uploadUnitImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadUnitImages.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.units.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.units[index] = action.payload;
        }
        if (state.currentUnit?.id === action.payload.id) {
          state.currentUnit = action.payload;
        }
      })
      .addCase(uploadUnitImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentUnit } = unitSlice.actions;
export default unitSlice.reducer;










