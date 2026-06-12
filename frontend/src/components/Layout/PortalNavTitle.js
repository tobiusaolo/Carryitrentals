import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors, typography } from '../../theme/designTokens';

const PortalNavTitle = ({ title, subtitle, meta }) => (
  <Box sx={{ minWidth: 0, maxWidth: { xs: 'min(72vw, 280px)', sm: 'min(48vw, 420px)' } }}>
    {meta && (
      <Typography
        variant="caption"
        sx={{
          color: colors.textMuted,
          display: 'block',
          mb: 0.1,
          textTransform: 'uppercase',
          fontSize: '0.625rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
        }}
        noWrap
      >
        {meta}
      </Typography>
    )}
    <Typography
      variant="subtitle1"
      sx={{
        fontFamily: typography.fontDisplay,
        fontWeight: 700,
        fontSize: '0.9375rem',
        letterSpacing: '-0.02em',
        lineHeight: 1.25,
        color: colors.text,
      }}
      noWrap
    >
      {title}
    </Typography>
    {subtitle && (
      <Typography
        variant="caption"
        sx={{
          color: colors.textMuted,
          display: { xs: 'none', sm: 'block' },
          lineHeight: 1.3,
          mt: 0.1,
          fontSize: '0.75rem',
        }}
        noWrap
      >
        {subtitle}
      </Typography>
    )}
  </Box>
);

export default PortalNavTitle;
