import React from 'react';
import { Typography } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { getListingAvailabilityMeta } from '../../utils/listingAvailability';
import { colors } from '../../theme/designTokens';

/**
 * Shows when an available listing was added and how long it has been on the market.
 * Hidden for taken / occupied listings.
 */
export default function ListingAvailabilityMeta({ unit, variant = 'body2', sx = {} }) {
  const meta = getListingAvailabilityMeta(unit);
  if (!meta) return null;

  return (
    <Typography
      variant={variant}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        color: colors.textMuted,
        fontWeight: 600,
        ...sx,
      }}
    >
      <CalendarToday sx={{ fontSize: 16 }} />
      {meta.summary}
    </Typography>
  );
}
