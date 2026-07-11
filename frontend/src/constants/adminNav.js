/** Shared admin navigation config — used by sidebar and breadcrumbs. */

export const ADMIN_NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { text: 'Dashboard', path: '/admin' },
      { text: 'Platform revenue', path: '/admin/revenue' },
      { text: 'Analytics', path: '/admin/analytics' },
    ],
  },
  {
    label: 'Portfolio',
    items: [
      { text: 'Owners', path: '/admin/owners' },
      { text: 'Properties', path: '/admin/properties' },
      { text: 'Internal units', path: '/admin/internal-units' },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { text: 'Listing requests', path: '/admin/listing-requests', badgeKey: 'listingRequests' },
      { text: 'Listing reports', path: '/admin/listing-reports', badgeKey: 'listingReports' },
      { text: 'Units for rent', path: '/admin/units' },
      { text: 'Short stays', path: '/admin/airbnb' },
    ],
  },
  {
    label: 'People',
    items: [
      { text: 'Tenants', path: '/admin/tenants', badgeKey: 'screening' },
      { text: 'Agents', path: '/admin/agents' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { text: 'Inspections', path: '/admin/inspections', badgeKey: 'inspections' },
      { text: 'Maintenance', path: '/admin/maintenance', badgeKey: 'maintenance' },
      { text: 'Viewing payments', path: '/admin/viewing-payments' },
      { text: 'Services', path: '/admin/additional-services' },
      { text: 'Messages', path: '/admin/communications' },
      { text: 'Reports', path: '/admin/reports' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { text: 'Payment approvals', path: '/admin/payment-intents', badgeKey: 'paymentIntents' },
      { text: 'Payment methods', path: '/admin/payment-methods' },
      { text: 'Notifications', path: '/admin/notifications', badgeKey: 'notifications' },
      { text: 'System health', path: '/admin/system' },
      { text: 'Activity logs', path: '/admin/activity' },
      { text: 'Settings', path: '/admin/settings' },
    ],
  },
];

/** @returns {{ section: string, page: string } | null} */
export function getAdminBreadcrumb(pathname) {
  for (const section of ADMIN_NAV_SECTIONS) {
    const item = section.items.find((i) => i.path === pathname);
    if (item) {
      return { section: section.label, page: item.text };
    }
  }
  return null;
}
