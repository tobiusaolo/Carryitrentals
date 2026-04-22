import React from 'react';
import { Card, CardContent, Box, Typography, LinearProgress, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

const EnhancedStatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = '#667eea',
  progress,
  trend,
  trendLabel,
  onClick
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) return <TrendingUp sx={{ fontSize: 16 }} />;
    if (trend < 0) return <TrendingDown sx={{ fontSize: 16 }} />;
    return <TrendingFlat sx={{ fontSize: 16 }} />;
  };

  const getTrendColor = () => {
    if (trend > 0) return '#10b981';
    if (trend < 0) return '#ef4444';
    return '#6b7280';
  };

  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%', 
        borderRadius: '24px',
        border: '1px solid #EEE',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
          borderColor: color,
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, letterSpacing: '0.02em' }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#222', mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            bgcolor: `${color}10`, 
            p: 1.5, 
            borderRadius: '16px',
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {React.cloneElement(icon, { sx: { fontSize: 24 } })}
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
              <Typography variant="caption" sx={{ fontWeight: 700, color: color }}>
                {progress.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                bgcolor: '#F0F0F0',
                '& .MuiLinearProgress-bar': { 
                  bgcolor: color,
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
