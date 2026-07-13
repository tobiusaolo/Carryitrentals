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
                ? { xs: '0.7rem', sm: '0.8rem' }
                : { xs: '0.9rem', sm: '1.1rem', md: '1.35rem' },
              fontWeight: 800,
              color: 'rgba(255,255,255,0.42)',
              textShadow: '0 2px 10px rgba(0,0,0,0.55)',
              letterSpacing: '0.1em',
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
