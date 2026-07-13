import React from 'react';
import { Box, Typography } from '@mui/material';

export const WATERMARK_TEXT = 'CarryIT Property Solutions';

const isPlaceholder = (src) => !src || String(src).includes('placeholder');

/**
 * Public listing image with a single CarryIT watermark overlay.
 */
const WatermarkedImage = ({
  src,
  alt = '',
  sx = {},
  wrapperSx = {},
  showWatermark = true,
  variant = 'detail',
  ...imgProps
}) => {
  const watermark = showWatermark && !isPlaceholder(src);
  const isCard = variant === 'card';

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...wrapperSx,
      }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          ...sx,
        }}
        {...imgProps}
      />

      {watermark && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography
            sx={{
              transform: 'rotate(-28deg)',
              fontSize: isCard
                ? { xs: '0.55rem', sm: '0.62rem' }
                : { xs: '0.72rem', sm: '0.85rem', md: '1rem' },
              fontWeight: 500,
              color: 'rgba(255,255,255,0.22)',
              textShadow: '0 1px 4px rgba(0,0,0,0.25)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              px: 1,
            }}
          >
            {WATERMARK_TEXT}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default WatermarkedImage;
