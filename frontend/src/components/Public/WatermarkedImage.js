import React from 'react';
import { Box, Typography } from '@mui/material';

export const WATERMARK_TEXT = 'CarryIT Property Solutions';

const isPlaceholder = (src) => !src || String(src).includes('placeholder');

/**
 * Public listing image with CarryIT watermark overlay.
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
  const showBadge = variant !== 'card';

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
        <>
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: { xs: 3, md: 5 },
                transform: 'rotate(-28deg)',
                opacity: 0.3,
              }}
            >
              {Array.from({ length: 16 }).map((_, i) => (
                <Typography
                  key={i}
                  sx={{
                    fontSize: { xs: '0.62rem', sm: '0.72rem', md: '0.88rem' },
                    fontWeight: 800,
                    color: '#fff',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    textShadow: '0 1px 3px rgba(0,0,0,0.65)',
                    letterSpacing: '0.04em',
                    userSelect: 'none',
                  }}
                >
                  {WATERMARK_TEXT}
                </Typography>
              ))}
            </Box>
          </Box>

          {showBadge && (
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                pointerEvents: 'none',
                px: 1.25,
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {WATERMARK_TEXT}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default WatermarkedImage;
