import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import propertySlice from './slices/propertySlice';
import unitSlice from './slices/unitSlice';
import tenantSlice from './slices/tenantSlice';
import analyticsSlice from './slices/analyticsSlice';
import utilitySlice from './slices/utilitySlice';
import { paymentReducer } from './slices/otherSlices';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    properties: propertySlice,
    units: unitSlice,
    tenants: tenantSlice,
    analytics: analyticsSlice,
    utilities: utilitySlice,
    payments: paymentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
