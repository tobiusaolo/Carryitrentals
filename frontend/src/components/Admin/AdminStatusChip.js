import React from 'react';
import { Chip, alpha } from '@mui/material';
import { colors, adminPalette } from '../../theme/designTokens';
import { getListingRequestStatusMeta } from '../../constants/listingRequest';

const toneStyles = {
  success: { color: colors.success, bg: alpha(colors.success, 0.1) },
  warning: { color: adminPalette.warning, bg: alpha(colors.warning, 0.12) },
  error: { color: colors.error, bg: alpha(colors.error, 0.1) },
  pending: { color: adminPalette.indigo, bg: alpha(adminPalette.indigo, 0.1) },
  neutral: { color: colors.textMuted, bg: colors.surfaceMuted },
  active: { color: adminPalette.primary, bg: alpha(adminPalette.primary, 0.08) },
};

const statusToneMap = {
  pending: 'pending',
  in_review: 'warning',
  in_progress: 'warning',
  awaiting_approval: 'warning',
  fulfilled: 'success',
  published: 'success',
  live: 'success',
  approved: 'success',
  confirmed: 'success',
  paid: 'success',
  completed: 'success',
  available: 'success',
  active: 'active',
  rejected: 'error',
  declined: 'error',
  cancelled: 'error',
  failed: 'error',
  overdue: 'error',
  warning: 'warning',
  partial: 'warning',
  scheduled: 'pending',
  occupied: 'neutral',
  inactive: 'neutral',
};

const friendlyLabels = {
  in_review: 'In review',
  in_progress: 'In progress',
  awaiting_approval: 'Awaiting approval',
  rental_unit: 'Unit for rent',
  short_stay: 'Short stay',
};

export default function AdminStatusChip({ status, label }) {
  const raw = String(status?.value || status || 'unknown').toLowerCase();
  const listingMeta = ['pending', 'in_review', 'fulfilled', 'rejected'].includes(raw)
    ? getListingRequestStatusMeta(raw)
    : null;
  const tone = statusToneMap[raw] || 'neutral';
  const style = toneStyles[tone] || toneStyles.neutral;
  const display =
    label ||
    listingMeta?.shortLabel ||
    friendlyLabels[raw] ||
    String(status?.value || status || 'unknown').replace(/_/g, ' ');

  return (
    <Chip
      size="small"
      label={display}
      sx={{
        height: 24,
        fontSize: '0.6875rem',
        fontWeight: 600,
        textTransform: 'capitalize',
        bgcolor: style.bg,
        color: style.color,
        border: `1px solid ${alpha(style.color, 0.2)}`,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
}
