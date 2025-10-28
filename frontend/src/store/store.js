import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import propertySlice from './slices/propertySlice';
import unitSlice from './slices/unitSlice';
import tenantSlice from './slices/tenantSlice';
import inspectionSlice from './slices/inspectionSlice';
import analyticsSlice from './slices/analyticsSlice';
import utilitySlice from './slices/utilitySlice';
import { leaseReducer, paymentReducer, maintenanceReducer } from './slices/otherSlices';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    properties: propertySlice,
    units: unitSlice,
    tenants: tenantSlice,
    inspections: inspectionSlice,
    analytics: analyticsSlice,
    utilities: utilitySlice,
    leases: leaseReducer,
    payments: paymentReducer,
    maintenance: maintenanceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
