import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tenantAPI } from '../../services/api/tenantAPI';

// Tenant async thunks
export const fetchTenants = createAsyncThunk(
  'tenants/fetchTenants',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await tenantAPI.getAllTenants(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch tenants');
    }
  }
);

export const fetchTenantById = createAsyncThunk(
  'tenants/fetchTenantById',
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await tenantAPI.getTenantById(tenantId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch tenant');
    }
  }
);

export const createTenant = createAsyncThunk(
  'tenants/createTenant',
  async (tenantData, { rejectWithValue }) => {
    try {
      const response = await tenantAPI.createTenant(tenantData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create tenant');
    }
  }
);

export const updateTenant = createAsyncThunk(
  'tenants/updateTenant',
  async ({ tenantId, tenantData }, { rejectWithValue }) => {
    try {
      const response = await tenantAPI.updateTenant(tenantId, tenantData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update tenant');
    }
  }
);

export const deleteTenant = createAsyncThunk(
  'tenants/deleteTenant',
  async (tenantId, { rejectWithValue }) => {
    try {
      await tenantAPI.deleteTenant(tenantId);
      return tenantId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete tenant');
    }
  }
);

export const updateTenantPaymentStatus = createAsyncThunk(
  'tenants/updateTenantPaymentStatus',
  async ({ tenantId, status, paymentDate }, { rejectWithValue }) => {
    try {
      const response = await tenantAPI.updateTenantPaymentStatus(tenantId, status, paymentDate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update payment status');
    }
  }
);

export const moveOutTenant = createAsyncThunk(
  'tenants/moveOutTenant',
  async ({ tenantId, moveOutDate }, { rejectWithValue }) => {
    try {
      const response = await tenantAPI.moveOutTenant(tenantId, moveOutDate);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to move out tenant');
    }
  }
);

export const fetchOverdueTenants = createAsyncThunk(
  'tenants/fetchOverdueTenants',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tenantAPI.getOverdueTenants();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch overdue tenants');
    }
  }
);

export const fetchTenantsPaymentStatus = createAsyncThunk(
  'tenants/fetchTenantsPaymentStatus',
  async (propertyId = null, { rejectWithValue }) => {
    try {
      const response = await tenantAPI.getTenantsPaymentStatus(propertyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch payment status');
    }
  }
);

export const uploadNationalIdImages = createAsyncThunk(
  'tenants/uploadNationalIdImages',
  async ({ tenantId, frontImage, backImage }, { rejectWithValue }) => {
    try {
      const response = await tenantAPI.uploadNationalIdImages(tenantId, frontImage, backImage);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to upload images');
    }
  }
);

export const searchTenants = createAsyncThunk(
  'tenants/searchTenants',
  async ({ query, skip = 0, limit = 100 }, { rejectWithValue }) => {
    try {
      const response = await tenantAPI.searchTenants(query, skip, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to search tenants');
    }
  }
);

const tenantSlice = createSlice({
  name: 'tenants',
  initialState: {
    tenants: [],
    currentTenant: null,
    overdueTenants: [],
    paymentStatus: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTenant: (state) => {
      state.currentTenant = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tenants
      .addCase(fetchTenants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tenants = action.payload;
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Tenant by ID
      .addCase(fetchTenantById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTenantById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTenant = action.payload;
      })
      .addCase(fetchTenantById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Tenant
      .addCase(createTenant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTenant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tenants.push(action.payload);
      })
      .addCase(createTenant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Tenant
      .addCase(updateTenant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTenant.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tenants.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tenants[index] = action.payload;
        }
        if (state.currentTenant?.id === action.payload.id) {
          state.currentTenant = action.payload;
        }
      })
      .addCase(updateTenant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Tenant
      .addCase(deleteTenant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTenant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tenants = state.tenants.filter(t => t.id !== action.payload);
        if (state.currentTenant?.id === action.payload) {
          state.currentTenant = null;
        }
      })
      .addCase(deleteTenant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Payment Status
      .addCase(updateTenantPaymentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTenantPaymentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const tenant = action.payload.tenant;
        const index = state.tenants.findIndex(t => t.id === tenant.id);
        if (index !== -1) {
          state.tenants[index] = tenant;
        }
        if (state.currentTenant?.id === tenant.id) {
          state.currentTenant = tenant;
        }
      })
      .addCase(updateTenantPaymentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Move Out Tenant
      .addCase(moveOutTenant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(moveOutTenant.fulfilled, (state, action) => {
        state.isLoading = false;
        const tenant = action.payload.tenant;
        const index = state.tenants.findIndex(t => t.id === tenant.id);
        if (index !== -1) {
          state.tenants[index] = tenant;
        }
        if (state.currentTenant?.id === tenant.id) {
          state.currentTenant = tenant;
        }
      })
      .addCase(moveOutTenant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Overdue Tenants
      .addCase(fetchOverdueTenants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOverdueTenants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overdueTenants = action.payload;
      })
      .addCase(fetchOverdueTenants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Payment Status
      .addCase(fetchTenantsPaymentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTenantsPaymentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentStatus = action.payload;
      })
      .addCase(fetchTenantsPaymentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Upload Images
      .addCase(uploadNationalIdImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadNationalIdImages.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update tenant with new image paths
        const { tenantId, front_image, back_image } = action.payload;
        const index = state.tenants.findIndex(t => t.id === tenantId);
        if (index !== -1) {
          state.tenants[index].national_id_front_image = front_image;
          state.tenants[index].national_id_back_image = back_image;
        }
        if (state.currentTenant?.id === tenantId) {
          state.currentTenant.national_id_front_image = front_image;
          state.currentTenant.national_id_back_image = back_image;
        }
      })
      .addCase(uploadNationalIdImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search Tenants
      .addCase(searchTenants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchTenants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tenants = action.payload;
      })
      .addCase(searchTenants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentTenant } = tenantSlice.actions;
export default tenantSlice.reducer;
