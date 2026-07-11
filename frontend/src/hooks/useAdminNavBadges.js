import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { listingRequestAPI } from '../services/api/listingRequestAPI';
import { paymentIntentAPI } from '../services/api/subscriptionAPI';

const POLL_MS = 60000;

/**
 * Lightweight counts for admin sidebar badges.
 */
export default function useAdminNavBadges(enabled = true) {
  const [badges, setBadges] = useState({
    listingRequests: 0,
    listingReports: 0,
    inspections: 0,
    maintenance: 0,
    paymentIntents: 0,
    screening: 0,
    notifications: 0,
  });

  const refresh = useCallback(async () => {
    if (!enabled) return;

    const next = {
      listingRequests: 0,
      listingReports: 0,
      inspections: 0,
      maintenance: 0,
      paymentIntents: 0,
      screening: 0,
      notifications: 0,
    };

    try {
      const api = authService.createAxiosInstance();
      const [statsRes, notifRes, listingRes, intentsRes, screeningRes, reportsRes] =
        await Promise.allSettled([
          api.get('/admin/stats'),
          api.get('/notifications/unread-count'),
          listingRequestAPI.getAll(),
          paymentIntentAPI.listPending(),
          api.get('/tenants/screening/pending'),
          api.get('/marketplace/listing-reports'),
        ]);

      if (statsRes.status === 'fulfilled') {
        next.inspections = statsRes.value.data?.maintenance?.pending_inspections ?? 0;
        next.maintenance = statsRes.value.data?.maintenance?.active_requests ?? 0;
      }
      if (notifRes.status === 'fulfilled') {
        next.notifications = notifRes.value.data?.unread_count ?? 0;
      }
      if (listingRes.status === 'fulfilled') {
        const rows = listingRes.value.data || [];
        next.listingRequests = rows.filter(
          (r) => r.status === 'pending' || r.status === 'in_review'
        ).length;
      }
      if (intentsRes.status === 'fulfilled') {
        const intents = Array.isArray(intentsRes.value.data) ? intentsRes.value.data : [];
        next.paymentIntents = intents.filter((i) => i.status === 'awaiting_approval').length;
      }
      if (screeningRes.status === 'fulfilled') {
        const rows = Array.isArray(screeningRes.value.data) ? screeningRes.value.data : [];
        next.screening = rows.length;
      }
      if (reportsRes.status === 'fulfilled') {
        const rows = Array.isArray(reportsRes.value.data) ? reportsRes.value.data : [];
        next.listingReports = rows.filter((r) => r.status === 'pending').length;
      }

      setBadges(next);
    } catch (err) {
      console.error('Admin nav badges:', err);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
    if (!enabled) return undefined;
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh, enabled]);

  return { badges, refresh };
}
