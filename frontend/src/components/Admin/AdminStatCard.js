import React from 'react';
import { Card, CardContent, Box, Typography, LinearProgress } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { colors, layout, getAdminStatColor } from '../../theme/designTokens';
import AdminSparkline from './AdminSparkline';

export default function AdminStatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  variantIndex = 0,
  progress,
  trend,
  trendLabel,
  sparklineData,
  onClick,
  loading = false,
}) {
  const accentColor = color || getAdminStatColor(variantIndex);

  const trendIcon =
    trend > 0 ? (
      <TrendingUp sx={{ fontSize: 14 }} />
    ) : trend < 0 ? (
      <TrendingDown sx={{ fontSize: 14 }} />
    ) : trend === 0 ? (
      <TrendingFlat sx={{ fontSize: 14 }} />
    ) : null;

  const trendColor =
    trend > 0 ? colors.success : trend < 0 ? colors.error : colors.textMuted;

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        height: '100%',
        borderRadius: `${layout.radius.md}px`,
        border: `1px solid ${colors.border}`,
        bgcolor: colors.surface,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        '&:hover': onClick
          ? { bgcolor: colors.surfaceMuted, borderColor: colors.borderStrong }
          : {},
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{ color: colors.textMuted, fontWeight: 600, display: 'block', mb: 0.25 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: colors.text,
                fontSize: '1.375rem',
                lineHeight: 1.2,
                opacity: loading ? 0.4 : 1,
              }}
            >
              {loading ? '—' : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                bgcolor: `${accentColor}12`,
                p: 1,
                borderRadius: `${layout.radius.sm}px`,
                color: accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                ml: 1,
              }}
            >
              {React.cloneElement(icon, { sx: { fontSize: 20 } })}
            </Box>
          )}
        </Box>

        {trend !== undefined && trend !== null && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ color: trendColor, display: 'flex', alignItems: 'center' }}>{trendIcon}</Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: trendColor }}>
              {trend > 0 ? '+' : ''}
              {trend}%
            </Typography>
            {trendLabel && (
              <Typography variant="caption" sx={{ color: colors.textMuted }}>
                {trendLabel}
              </Typography>
            )}
          </Box>
        )}

        {progress !== undefined && (
          <Box sx={{ mt: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, progress))}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: colors.surfaceMuted,
                '& .MuiLinearProgress-bar': { bgcolor: accentColor },
              }}
            />
          </Box>
        )}

        {sparklineData?.length > 0 && (
          <AdminSparkline data={sparklineData} color={accentColor} />
        )}
      </CardContent>
    </Card>
  );
}
