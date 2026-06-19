import api from './api';

export const ownerPortfolioAPI = {
  getArrears: () => api.get('/owner-portfolio/arrears'),
  getMonthlyLedger: (year, month) =>
    api.get('/owner-portfolio/monthly-ledger', { params: { year, month } }),
  downloadMonthlyLedgerCsv: (year, month) =>
    api.get('/owner-portfolio/monthly-ledger/csv', {
      params: { year, month },
      responseType: 'blob',
    }),
};
