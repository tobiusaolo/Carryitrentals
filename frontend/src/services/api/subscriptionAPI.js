import api from './api';

export const subscriptionAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getMySubscription: () => api.get('/subscriptions/me'),
  subscribePesapal: (planSlug) => api.post('/subscriptions/me/subscribe/pesapal', { plan_slug: planSlug }),
  activateTrial: () => api.post('/subscriptions/me/activate-trial'),
};

export const walletAPI = {
  getMyWallet: () => api.get('/wallet/me'),
};

export const paymentIntentAPI = {
  submitManual: (payload) => api.post('/payment-intents/manual', payload),
  listPending: () => api.get('/payment-intents/pending'),
  approve: (intentId) => api.post(`/payment-intents/${intentId}/approve`),
  reject: (intentId, reason) => api.post(`/payment-intents/${intentId}/reject`, { reason }),
};
