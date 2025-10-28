import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { utilityAPI } from '../../services/api/utilityAPI';

// Async thunks for property-level utilities
export const fetchUtilities = createAsyncThunk(
  'utilities/fetchUtilities',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await utilityAPI.getUtilities(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch utilities');
    }
  }
);

export const fetchUtilityById = createAsyncThunk(
  'utilities/fetchUtilityById',
  async (utilityId, { rejectWithValue }) => {
    try {
      const response = await utilityAPI.getUtilityById(utilityId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch utility');
    }
  }
);

export const createUtility = createAsyncThunk(
  'utilities/createUtility',
  async (utilityData, { rejectWithValue }) => {
    try {
      const response = await utilityAPI.createUtility(utilityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create utility');
    }
  }
);

export const updateUtility = createAsyncThunk(
  'utilities/updateUtility',
  async ({ utilityId, utilityData }, { rejectWithValue }) => {
    try {
      const response = await utilityAPI.updateUtility(utilityId, utilityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update utility');
    }
  }
);

export const deleteUtility = createAsyncThunk(
  'utilities/deleteUtility',
  async (utilityId, { rejectWithValue }) => {
    try {
      await utilityAPI.deleteUtility(utilityId);
      return utilityId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete utility');
    }
  }
);

// Async thunks for unit-level utilities
export const fetchUnitUtilities = createAsyncThunk(
  'utilities/fetchUnitUtilities',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await utilityAPI.getUnitUtilities(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch unit utilities');
    }
  }
);

export const fetchUnitUtilityById = createAsyncThunk(
  'utilities/fetchUnitUtilityById',
  async (utilityId, { rejectWithValue }) => {
    try {
      const response = await utilityAPI.getUnitUtilityById(utilityId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch unit utility');
    }
  }
);

export const createUnitUtility = createAsyncThunk(
  'utilities/createUnitUtility',
  async (utilityData, { rejectWithValue }) => {
    try {
      const response = await utilityAPI.createUnitUtility(utilityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create unit utility');
    }
  }
);

export const updateUnitUtility = createAsyncThunk(
  'utilities/updateUnitUtility',
  async ({ utilityId, utilityData }, { rejectWithValue }) => {
    try {
      const response = await utilityAPI.updateUnitUtility(utilityId, utilityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update unit utility');
    }
  }
);

export const deleteUnitUtility = createAsyncThunk(
  'utilities/deleteUnitUtility',
  async (utilityId, { rejectWithValue }) => {
    try {
      await utilityAPI.deleteUnitUtility(utilityId);
      return utilityId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete unit utility');
    }
  }
);

// Helper thunks
export const fetchUtilitiesForProperty = createAsyncThunk(
  'utilities/fetchUtilitiesForProperty',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await utilityAPI.getUtilitiesForProperty(propertyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch property utilities');
    }
  }
);

export const fetchUtilitiesForUnit = createAsyncThunk(
  'utilities/fetchUtilitiesForUnit',
  async (unitId, { rejectWithValue }) => {
    try {
      const response = await utilityAPI.getUtilitiesForUnit(unitId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch unit utilities');
    }
  }
);

const initialState = {
  // Property-level utilities
  utilities: [],
  utility: null,
  
  // Unit-level utilities
  unitUtilities: [],
  unitUtility: null,
  
  // Loading states
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  
  // Error state
  error: null,
};

const utilitySlice = createSlice({
  name: 'utilities',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUtility: (state) => {
      state.utility = null;
    },
    clearUnitUtility: (state) => {
      state.unitUtility = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Property utilities
      .addCase(fetchUtilities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUtilities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.utilities = action.payload;
      })
      .addCase(fetchUtilities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchUtilityById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUtilityById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.utility = action.payload;
      })
      .addCase(fetchUtilityById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(createUtility.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createUtility.fulfilled, (state, action) => {
        state.isCreating = false;
        state.utilities.push(action.payload);
      })
      .addCase(createUtility.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      .addCase(updateUtility.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUtility.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.utilities.findIndex(util => util.id === action.payload.id);
        if (index !== -1) {
          state.utilities[index] = action.payload;
        }
      })
      .addCase(updateUtility.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      .addCase(deleteUtility.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteUtility.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.utilities = state.utilities.filter(util => util.id !== action.payload);
      })
      .addCase(deleteUtility.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      // Unit utilities
      .addCase(fetchUnitUtilities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnitUtilities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.unitUtilities = action.payload;
      })
      .addCase(fetchUnitUtilities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchUnitUtilityById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnitUtilityById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.unitUtility = action.payload;
      })
      .addCase(fetchUnitUtilityById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(createUnitUtility.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createUnitUtility.fulfilled, (state, action) => {
        state.isCreating = false;
        state.unitUtilities.push(action.payload);
      })
      .addCase(createUnitUtility.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      .addCase(updateUnitUtility.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUnitUtility.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.unitUtilities.findIndex(util => util.id === action.payload.id);
        if (index !== -1) {
          state.unitUtilities[index] = action.payload;
        }
      })
      .addCase(updateUnitUtility.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      .addCase(deleteUnitUtility.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteUnitUtility.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.unitUtilities = state.unitUtilities.filter(util => util.id !== action.payload);
      })
      .addCase(deleteUnitUtility.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      // Helper thunks
      .addCase(fetchUtilitiesForProperty.fulfilled, (state, action) => {
        // This will be handled by the component that calls it
      })
      .addCase(fetchUtilitiesForUnit.fulfilled, (state, action) => {
        // This will be handled by the component that calls it
      });
  },
});

export const { clearError, clearUtility, clearUnitUtility } = utilitySlice.actions;
export default utilitySlice.reducer;









