import React from 'react';
import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';
import { colors, layout, getOwnerStatColor } from '../../theme/designTokens';

const OwnerStatCard = ({ title, value, subtitle, icon, variantIndex = 0, color }) => {
  const accentColor = color || getOwnerStatColor(variantIndex);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: `${layout.radius.md}px`,
        border: `1px solid ${colors.border}`,
        bgcolor: colors.surface,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {icon && (
            <Avatar
              sx={{
                bgcolor: `${accentColor}12`,
                color: accentColor,
                width: 40,
                height: 40,
              }}
            >
              {React.cloneElement(icon, { sx: { fontSize: 20 } })}
            </Avatar>
          )}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: colors.text, lineHeight: 1.2, fontSize: '1.375rem' }}
            >
              {value}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text, display: 'block' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OwnerStatCard;
