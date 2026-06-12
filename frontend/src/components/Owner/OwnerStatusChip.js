import React from 'react';
import { Chip, alpha } from '@mui/material';
import { colors, ownerPalette } from '../../theme/designTokens';

const toneMap = {
  success: 'accent',
  active: 'accent',
  confirmed: 'accent',
  paid: 'accent',
  available: 'accent',
  completed: 'accent',
  pending: 'secondary',
  warning: 'secondary',
  due: 'secondary',
  scheduled: 'secondary',
  error: 'primary',
  cancelled: 'primary',
  failed: 'primary',
  overdue: 'primary',
  occupied: 'primary',
  declined: 'primary',
};

const OwnerStatusChip = ({ status, label }) => {
  const raw = String(status?.value || status || 'unknown').toLowerCase();
  const tone = toneMap[raw] || 'secondary';
  const color =
    tone === 'accent'
      ? ownerPalette.accent
      : tone === 'primary'
        ? ownerPalette.primary
        : ownerPalette.secondary;
  const display =
    label || String(status?.value || status || 'unknown').replace(/_/g, ' ');

  return (
    <Chip
      size="small"
      label={display}
      sx={{
        height: 24,
        fontSize: '0.6875rem',
        fontWeight: 600,
        textTransform: 'capitalize',
        bgcolor:
          tone === 'accent'
            ? alpha(colors.brand, 0.1)
            : tone === 'primary'
              ? alpha(colors.error, 0.08)
              : colors.surfaceMuted,
        color,
        border: `1px solid ${alpha(color, 0.15)}`,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
};

export default OwnerStatusChip;
