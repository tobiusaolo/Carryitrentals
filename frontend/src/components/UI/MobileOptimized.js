import React from 'react';
import { Box, Card, CardContent, Typography, useMediaQuery, useTheme } from '@mui/material';

// Responsive Grid that stacks on mobile
export const ResponsiveGrid = ({ children, spacing = 3 }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)'
        },
        gap: spacing,
        width: '100%'
      }}
    >
      {children}
    </Box>
  );
};

// Mobile-friendly card that's touch-optimized
export const TouchCard = ({ children, onClick, sx }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        minHeight: isMobile ? 'auto' : 120,
        '&:active': {
          transform: 'scale(0.98)',
          bgcolor: 'action.hover'
        },
        '&:hover': onClick ? {
          boxShadow: 3,
          transform: 'translateY(-2px)'
        } : {},
        ...sx
      }}
    >
      {children}
    </Card>
  );
};

// Touch-friendly button (minimum 44px)
export const TouchButton = ({ children, ...props }) => {
  return (
    <Box
      component="button"
      sx={{
        minWidth: 44,
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Responsive container that adds proper padding on mobile
export const MobileContainer = ({ children }) => {
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3 },
        width: '100%'
      }}
    >
      {children}
    </Box>
  );
};

// Stacked stat cards for mobile
export const ResponsiveStatCard = ({ title, value, subtitle, icon, color }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card sx={{ height: '100%', borderLeft: isMobile ? 0 : 4, borderTop: isMobile ? 4 : 0, borderColor: color }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            alignItems: isMobile ? 'center' : 'flex-start',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight="bold" sx={{ color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                bgcolor: `${color}15`,
                p: isMobile ? 1 : 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: isMobile ? 2 : 0,
                mt: isMobile ? 0 : 2
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default {
  ResponsiveGrid,
  TouchCard,
  TouchButton,
  MobileContainer,
  ResponsiveStatCard
};

