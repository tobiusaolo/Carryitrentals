import React from 'react';
import { Chip, alpha } from '@mui/material';
import { EventAvailable } from '@mui/icons-material';
import { formatInspectionBookingsLabel } from '../../utils/listingInspections';
import { colors } from '../../theme/designTokens';

/**
 * Shows how many inspection / viewing requests a rental listing has received.
 */
export default function ListingInspectionBookingsBadge({
  unit,
  size = 'small',
  variant = 'outlined',
  sx = {},
}) {
  return (
    <Chip
      icon={<EventAvailable sx={{ fontSize: '16px !important' }} />}
      label={formatInspectionBookingsLabel(unit)}
      size={size}
      variant={variant}
      sx={{
        height: size === 'small' ? 26 : 30,
        fontWeight: 700,
        fontSize: '0.68rem',
        letterSpacing: '0.02em',
        color: '#0f5c6e',
        bgcolor: alpha('#0891b2', 0.1),
        border: `1px solid ${alpha('#0891b2', 0.28)}`,
        '& .MuiChip-icon': { color: '#0891b2' },
        ...sx,
      }}
    />
  );
}
