import React from 'react';
import { Card, CardContent, Box, Typography, LinearProgress, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

const EnhancedStatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = '#1976d2',
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
    if (trend > 0) return 'success';
    if (trend < 0) return 'error';
    return 'default';
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        borderLeft: 4, 
        borderColor: color,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 3
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ color, mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  icon={getTrendIcon()}
                  label={trendLabel || `${Math.abs(trend).toFixed(1)}% vs last month`}
                  size="small"
                  color={getTrendColor()}
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 24 }}
                />
              </Box>
            )}
          </Box>
          <Box sx={{ 
            bgcolor: `${color}15`, 
            p: 1.5, 
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        </Box>
        
        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" fontWeight="bold" sx={{ color }}>
                {progress.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 1,
                bgcolor: `${color}20`,
                '& .MuiLinearProgress-bar': { 
                  bgcolor: color,
                  borderRadius: 1
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

