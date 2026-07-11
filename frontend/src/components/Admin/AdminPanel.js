import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { colors, layout } from '../../theme/designTokens';

export default function AdminPanel({ title, subtitle, action, children, sx, contentSx }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: `${layout.radius.lg}px`,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        bgcolor: colors.surface,
        ...sx,
      }}
    >
      {(title || action) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1.5,
            px: 2.5,
            py: 2,
            borderBottom: subtitle ? 'none' : `1px solid ${colors.border}`,
          }}
        >
          <Box>
            {title && (
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: colors.text }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Box>
      )}
      <Box sx={{ p: 2.5, ...contentSx }}>{children}</Box>
    </Paper>
  );
}
