/** Shared visual language — public, owner, and admin portals */
export const colors = {
  text: '#1a1a1a',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  borderStrong: '#d1d5db',
  surface: '#ffffff',
  surfaceMuted: '#f9fafb',
  surfaceElevated: '#ffffff',
  brand: '#ff385c',
  brandHover: '#e31c5f',
  brandSoft: 'rgba(255, 56, 92, 0.08)',
  adminAccent: '#111827',
  adminSoft: 'rgba(17, 24, 39, 0.06)',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
};

export const typography = {
  fontBody: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  fontDisplay: '"Outfit", "Inter", sans-serif',
};

/** Owner portal — accent, dark, muted */
export const ownerPalette = {
  accent: colors.brand,
  primary: colors.text,
  secondary: colors.textMuted,
};

export const getOwnerStatColor = (index = 0) => {
  const keys = ['accent', 'primary', 'secondary'];
  return ownerPalette[keys[index % 3]];
};

export const layout = {
  publicMaxWidth: 'xl',
  adminMaxWidth: 1320,
  adminSidebarWidth: 252,
  headerHeight: 56,
  radius: {
    sm: 8,
    md: 10,
    lg: 12,
  },
};

/** Primary CTA — owner (brand) */
export const ownerPrimaryButtonSx = {
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.8125rem',
  borderRadius: `${layout.radius.sm}px`,
  boxShadow: 'none',
  px: 2,
  py: 0.75,
  bgcolor: colors.brand,
  '&:hover': { bgcolor: colors.brandHover, boxShadow: 'none' },
};

/** Primary CTA — admin (neutral dark) */
export const adminPrimaryButtonSx = {
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.8125rem',
  borderRadius: `${layout.radius.sm}px`,
  boxShadow: 'none',
  px: 2,
  py: 0.75,
  bgcolor: colors.adminAccent,
  '&:hover': { bgcolor: '#000', boxShadow: 'none' },
};

export const portalOutlinedButtonSx = {
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.8125rem',
  borderRadius: `${layout.radius.sm}px`,
  borderColor: colors.borderStrong,
  color: colors.text,
  boxShadow: 'none',
  '&:hover': { borderColor: colors.textMuted, bgcolor: colors.surfaceMuted, boxShadow: 'none' },
};

export const ownerTablePaperSx = {
  borderRadius: `${layout.radius.md}px`,
  border: `1px solid ${colors.border}`,
  overflow: 'hidden',
  bgcolor: colors.surface,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

export const tableShellSx = ownerTablePaperSx;

export const tableToolbarSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1.5,
  px: 2,
  py: 1.25,
  minHeight: 52,
  borderBottom: `1px solid ${colors.border}`,
  bgcolor: colors.surface,
};

export const tableHeadCellSx = {
  fontFamily: typography.fontBody,
  fontWeight: 600,
  fontSize: '0.6875rem',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: colors.textMuted,
  bgcolor: colors.surfaceMuted,
  borderBottom: `1px solid ${colors.border}`,
  py: 1.25,
  px: 2,
  whiteSpace: 'nowrap',
};

export const ownerTableHeadSx = {
  bgcolor: colors.surfaceMuted,
  '& .MuiTableCell-head': tableHeadCellSx,
};

export const tableBodyCellSx = {
  fontFamily: typography.fontBody,
  fontSize: '0.8125rem',
  color: colors.text,
  py: 1.375,
  px: 2,
  borderBottom: `1px solid ${colors.border}`,
  verticalAlign: 'middle',
  lineHeight: 1.45,
};

export const tableFooterSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 1,
  px: 2,
  py: 0.25,
  minHeight: 44,
  borderTop: `1px solid ${colors.border}`,
  bgcolor: colors.surfaceMuted,
  '& .MuiTablePagination-root': { border: 'none' },
  '& .MuiTablePagination-toolbar': { minHeight: 44, px: 0 },
  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
    fontSize: '0.75rem',
    color: colors.textMuted,
  },
};

export const getTableRowSx = () => ({
  transition: 'background-color 0.12s ease',
  bgcolor: colors.surface,
  '&:hover': {
    bgcolor: colors.surfaceMuted,
  },
  '&:last-child td': {
    borderBottom: 'none',
  },
});

export const ownerDataGridSx = {
  border: 'none',
  fontSize: '0.8125rem',
  fontFamily: typography.fontBody,
  '& .MuiDataGrid-columnHeaders': {
    bgcolor: colors.surfaceMuted,
    borderBottom: `1px solid ${colors.border}`,
    minHeight: '44px !important',
    maxHeight: '44px !important',
  },
  '& .MuiDataGrid-columnHeader': {
    '&:focus, &:focus-within': { outline: 'none' },
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 600,
    fontSize: '0.6875rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  '& .MuiDataGrid-cell': {
    borderBottom: `1px solid ${colors.border}`,
    py: 1.25,
    '&:focus, &:focus-within': { outline: 'none' },
  },
  '& .MuiDataGrid-row': {
    minHeight: '48px !important',
    maxHeight: '48px !important',
    '&:hover': { bgcolor: colors.surfaceMuted },
    '&.Mui-selected': {
      bgcolor: colors.brandSoft,
      '&:hover': { bgcolor: 'rgba(255, 56, 92, 0.12)' },
    },
  },
  '& .MuiDataGrid-footerContainer': {
    borderTop: `1px solid ${colors.border}`,
    bgcolor: colors.surfaceMuted,
    minHeight: 48,
  },
  '& .MuiDataGrid-toolbarContainer': {
    px: 2,
    py: 1.25,
    gap: 1,
    borderBottom: `1px solid ${colors.border}`,
  },
  '& .MuiDataGrid-overlayWrapper': {
    minHeight: 240,
  },
};

export const dataGridPanelSx = ownerDataGridSx;

export const portalPageSx = {
  pb: 3,
};

/** @deprecated Use ADMIN_ROUTE_META */
export const ADMIN_ROUTE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/owners': 'Owners',
  '/admin/properties': 'Properties',
  '/admin/units': 'Rental units',
  '/admin/inspections': 'Inspections',
  '/admin/additional-services': 'Services',
  '/admin/payment-methods': 'Payment methods',
  '/admin/viewing-payments': 'Viewing payments',
  '/admin/agents': 'Agents',
  '/admin/airbnb': 'Short stays',
  '/admin/tenants': 'Tenants',
  '/admin/communications': 'Messages',
  '/admin/reports': 'Reports',
  '/admin/system': 'System health',
  '/admin/activity': 'Activity logs',
  '/admin/notifications': 'Notifications',
  '/admin/settings': 'Settings',
  '/admin/analytics': 'Analytics',
};

export const ADMIN_ROUTE_META = {
  '/admin': { title: 'Dashboard', subtitle: 'Overview' },
  '/admin/owners': { title: 'Owners', subtitle: 'Property owner accounts' },
  '/admin/properties': { title: 'Properties', subtitle: 'All portfolios' },
  '/admin/units': { title: 'Rental units', subtitle: 'Listings & availability' },
  '/admin/inspections': { title: 'Inspections', subtitle: 'Viewing bookings' },
  '/admin/additional-services': { title: 'Services', subtitle: 'Add-on bookings' },
  '/admin/payment-methods': { title: 'Payment methods', subtitle: 'Guest payment options' },
  '/admin/viewing-payments': { title: 'Viewing payments', subtitle: 'Inspection fees' },
  '/admin/agents': { title: 'Agents', subtitle: 'Field agents' },
  '/admin/airbnb': { title: 'Short stays', subtitle: 'Nightly listings' },
  '/admin/tenants': { title: 'Tenants', subtitle: 'All leases' },
  '/admin/communications': { title: 'Messages', subtitle: 'SMS & templates' },
  '/admin/reports': { title: 'Reports', subtitle: 'Exports' },
  '/admin/system': { title: 'System', subtitle: 'Health & status' },
  '/admin/activity': { title: 'Activity', subtitle: 'Audit log' },
  '/admin/notifications': { title: 'Notifications', subtitle: 'Alerts' },
  '/admin/settings': { title: 'Settings', subtitle: 'Platform config' },
  '/admin/analytics': { title: 'Analytics', subtitle: 'Trends' },
};

export const OWNER_ROUTE_META = {
  '/owner/dashboard': { title: 'Dashboard', subtitle: 'Portfolio snapshot' },
  '/owner/property-hub': { title: 'Property & listings', subtitle: 'Portfolio hub' },
  '/owner/payments': { title: 'Payments', subtitle: 'Rent collected' },
  '/owner/utilities': { title: 'Utilities', subtitle: 'Rates & charges' },
  '/owner/inspections': { title: 'Viewings', subtitle: 'Tour requests' },
  '/owner/viewings': { title: 'Viewings', subtitle: 'Tour requests' },
  '/owner/viewing-payments': { title: 'Viewing payments', subtitle: 'Upfront fees' },
  '/owner/property-qr': { title: 'QR payments', subtitle: 'Rent QR codes' },
  '/owner/communications': { title: 'Messages', subtitle: 'SMS' },
  '/owner/reports': { title: 'Reports', subtitle: 'Exports' },
  '/owner/analytics': { title: 'Analytics', subtitle: 'Performance' },
  '/owner/billing': { title: 'Billing & subscription', subtitle: 'Plan, wallet & approvals' },
};

export const OWNER_PROPERTY_HUB_TAB_META = {
  properties: { title: 'Properties', subtitle: 'Buildings & sites' },
  units: { title: 'Units', subtitle: 'Spaces in properties' },
  'units-for-rent': { title: 'Listings', subtitle: 'Public marketplace' },
  airbnb: { title: 'Short stays', subtitle: 'Nightly bookings' },
  tenants: { title: 'Tenants', subtitle: 'Residents & rent' },
};
