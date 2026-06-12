import React from 'react';
import { Card, CardContent, Box, Typography, LinearProgress, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { colors, layout, getOwnerStatColor } from '../../theme/designTokens';

const EnhancedStatCard = ({
  title, 
  value, 
  subtitle, 
  icon, 
  color,
  variantIndex = 0,
  progress,
  trend,
  trendLabel,
  onClick
}) => {
  const accentColor = color || getOwnerStatColor(variantIndex);

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) return <TrendingUp sx={{ fontSize: 16 }} />;
    if (trend < 0) return <TrendingDown sx={{ fontSize: 16 }} />;
    return <TrendingFlat sx={{ fontSize: 16 }} />;
  };

  const getTrendColor = () => {
    if (trend > 0) return colors.brand;
    if (trend < 0) return colors.text;
    return colors.textMuted;
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: `${layout.radius.md}px`,
        border: `1px solid ${colors.border}`,
        bgcolor: colors.surface,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        '&:hover': onClick ? { bgcolor: colors.surfaceMuted, borderColor: colors.borderStrong } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: trend !== undefined || progress !== undefined ? 1.5 : 0 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: colors.textMuted, fontWeight: 600, display: 'block', mb: 0.25 }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text, fontSize: '1.375rem', lineHeight: 1.2 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${accentColor}12`,
              p: 1,
              borderRadius: `${layout.radius.sm}px`,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 20 } })}
          </Box>
        </Box>
        
        {trend !== undefined && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ color: getTrendColor(), display: 'flex', alignItems: 'center' }}>
              {getTrendIcon()}
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: getTrendColor() }}>
              {trend > 0 ? '+' : ''}{trend}%
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {trendLabel || 'vs last month'}
            </Typography>
          </Box>
        )}
        
        {progress !== undefined && (
          <Box sx={{ mt: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Progress
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: accentColor }}>
                {progress.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                bgcolor: colors.surfaceMuted,
                '& .MuiLinearProgress-bar': { 
                  bgcolor: accentColor,
                  borderRadius: 3
                }
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedStatCard;
