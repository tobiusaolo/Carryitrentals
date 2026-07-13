import React from 'react';
import { Chip, alpha } from '@mui/material';
import { Videocam, VideocamOff } from '@mui/icons-material';
import { hasListingVideo } from '../../utils/listingVideo';
import { colors } from '../../theme/designTokens';

/**
 * Compact indicator for whether a rental listing includes a walkthrough video.
 */
export default function ListingVideoBadge({
  unit,
  size = 'small',
  variant = 'filled',
  sx = {},
}) {
  const hasVideo = hasListingVideo(unit);

  return (
    <Chip
      icon={hasVideo ? <Videocam sx={{ fontSize: '16px !important' }} /> : <VideocamOff sx={{ fontSize: '16px !important' }} />}
      label={hasVideo ? 'Video tour' : 'No video'}
      size={size}
      variant={variant}
      sx={{
        height: size === 'small' ? 26 : 30,
        fontWeight: 700,
        fontSize: '0.68rem',
        letterSpacing: '0.02em',
        ...(hasVideo
          ? {
              color: '#5b21b6',
              bgcolor: alpha('#7c3aed', 0.12),
              border: `1px solid ${alpha('#7c3aed', 0.28)}`,
              '& .MuiChip-icon': { color: '#7c3aed' },
            }
          : {
              color: colors.textMuted,
              bgcolor: alpha(colors.textMuted, 0.08),
              border: `1px solid ${colors.border}`,
              '& .MuiChip-icon': { color: colors.textMuted },
            }),
        ...sx,
      }}
    />
  );
}
