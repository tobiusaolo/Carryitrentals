import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { colors, ownerPrimaryButtonSx } from '../../theme/designTokens';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false,
}) => (
  <Box sx={{ textAlign: 'center', py: compact ? 3.5 : 5, px: 2 }}>
    {Icon && (
      <Box
        sx={{
          width: compact ? 48 : 56,
          height: compact ? 48 : 56,
          borderRadius: `${10}px`,
          bgcolor: colors.surfaceMuted,
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 1.5,
        }}
      >
        <Icon sx={{ fontSize: compact ? 24 : 28, color: colors.textMuted }} />
      </Box>
    )}
    <Typography
      variant="body2"
      sx={{ fontWeight: 600, color: colors.text, mb: description ? 0.5 : 1.5 }}
    >
      {title}
    </Typography>
    {description && (
      <Typography
        variant="caption"
        sx={{ color: colors.textMuted, maxWidth: 320, mx: 'auto', display: 'block', mb: 1.5 }}
      >
        {description}
      </Typography>
    )}
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={ownerPrimaryButtonSx}>
          {actionLabel}
        </Button>
      )}
      {secondaryActionLabel && onSecondaryAction && (
        <Button variant="outlined" onClick={onSecondaryAction} sx={{ textTransform: 'none', fontWeight: 600 }}>
          {secondaryActionLabel}
        </Button>
      )}
    </Box>
  </Box>
);

export default EmptyState;
