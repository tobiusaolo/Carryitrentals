import {
  SpaceDashboard,
  Apartment,
  AccountBalanceWallet,
  Bolt,
  EventAvailable,
  ReceiptLong,
  Forum,
  Summarize,
  Insights,
} from '@mui/icons-material';

export const OWNER_NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { text: 'Dashboard', icon: SpaceDashboard, path: '/owner/dashboard' },
    ],
  },
  {
    label: 'Portfolio',
    items: [
      {
        text: 'Property & listings',
        icon: Apartment,
        path: '/owner/property-hub',
        match: [
          '/owner/property-hub',
          '/owner/properties',
          '/owner/units',
          '/owner/units-for-rent',
          '/owner/airbnb',
          '/owner/tenants',
          '/owner/payments',
        ],
      },
    ],
  },
  {
    label: 'Finance',
    items: [
      { text: 'Billing & subscription', icon: ReceiptLong, path: '/owner/billing' },
      { text: 'Utilities', icon: Bolt, path: '/owner/utilities' },
      { text: 'Viewing payments', icon: ReceiptLong, path: '/owner/viewing-payments' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { text: 'Viewing bookings', icon: EventAvailable, path: '/owner/viewings' },
      { text: 'Communications', icon: Forum, path: '/owner/communications' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { text: 'Reports', icon: Summarize, path: '/owner/reports' },
      { text: 'Analytics', icon: Insights, path: '/owner/analytics' },
    ],
  },
];
