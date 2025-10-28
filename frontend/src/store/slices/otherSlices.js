import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentAPI } from '../../services/api/paymentAPI';

// Payment async thunks
export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getAllPayments(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch payments');
    }
  }
);

export const fetchPaymentById = createAsyncThunk(
  'payments/fetchPaymentById',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getPaymentById(paymentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch payment');
    }
  }
);

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.createPayment(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create payment');
    }
  }
);

export const updatePayment = createAsyncThunk(
  'payments/updatePayment',
  async ({ paymentId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.updatePayment(paymentId, paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update payment');
    }
  }
);

export const markPaymentAsPaid = createAsyncThunk(
  'payments/markPaymentAsPaid',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.markPaymentAsPaid(paymentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to mark payment as paid');
    }
  }
);

export const deletePayment = createAsyncThunk(
  'payments/deletePayment',
  async (paymentId, { rejectWithValue }) => {
    try {
      await paymentAPI.deletePayment(paymentId);
      return paymentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete payment');
    }
  }
);

// Placeholder slices for other features
const leaseSlice = createSlice({
  name: 'leases',
  initialState: {
    leases: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

const paymentSlice = createSlice({
  name: 'payments',
  initialState: {
    payments: [],
    currentPayment: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payments
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Payment by ID
      .addCase(fetchPaymentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Payment
      .addCase(createPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments.push(action.payload);
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Payment
      .addCase(updatePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.payments.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        if (state.currentPayment?.id === action.payload.id) {
          state.currentPayment = action.payload;
        }
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark Payment as Paid
      .addCase(markPaymentAsPaid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markPaymentAsPaid.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.payments.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        if (state.currentPayment?.id === action.payload.id) {
          state.currentPayment = action.payload;
        }
      })
      .addCase(markPaymentAsPaid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Payment
      .addCase(deletePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = state.payments.filter(p => p.id !== action.payload);
        if (state.currentPayment?.id === action.payload) {
          state.currentPayment = null;
        }
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState: {
    maintenanceRequests: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError: clearLeaseError } = leaseSlice.actions;
export const { clearError: clearPaymentError, clearCurrentPayment } = paymentSlice.actions;
export const { clearError: clearMaintenanceError } = maintenanceSlice.actions;

export const leaseReducer = leaseSlice.reducer;
export const paymentReducer = paymentSlice.reducer;
export const maintenanceReducer = maintenanceSlice.reducer;

