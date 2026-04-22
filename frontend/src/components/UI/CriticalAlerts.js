import React from 'react';
import { Box, Button, Chip, Typography, Paper, alpha, IconButton } from '@mui/material';
import {
  Warning,
  Error as ErrorIcon,
  Info,
  ChevronRight
} from '@mui/icons-material';

const CriticalAlerts = ({ alerts = [], onAction }) => {
  if (!alerts || alerts.length === 0) return null;

  const getColor = (type) => {
    switch (type) {
      case 'overdue': return '#ef4444';
      case 'due': return '#f59e0b';
      case 'vacant': return '#3b82f6';
      case 'maintenance': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'overdue': return <ErrorIcon sx={{ fontSize: 24 }} />;
      case 'due': return <Warning sx={{ fontSize: 24 }} />;
      case 'maintenance': return <Warning sx={{ fontSize: 24 }} />;
      default: return <Info sx={{ fontSize: 24 }} />;
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {alerts.map((alert, index) => {
        const mainColor = getColor(alert.type);
        return (
          <Paper
            key={index}
            elevation={0}
            sx={{
              p: 2.5,
              mb: index < alerts.length - 1 ? 2 : 0,
              borderRadius: '20px',
              border: `1px solid ${alpha(mainColor, 0.2)}`,
              bgcolor: alpha(mainColor, 0.02),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(mainColor, 0.05),
                transform: 'scale(1.005)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ 
                bgcolor: alpha(mainColor, 0.1), 
                color: mainColor, 
                p: 1.5, 
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {getIcon(alert.type)}
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#222' }}>
                    {alert.title}
                  </Typography>
                  {alert.count && (
                    <Chip
                      label={alert.count}
                      size="small"
                      sx={{ fontWeight: 800, bgcolor: mainColor, color: 'white', height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 500 }}>
                  {alert.message}
                </Typography>
                {alert.amount && (
                  <Typography variant="body2" sx={{ fontWeight: 800, color: mainColor, mt: 0.5 }}>
                    Balance: ${alert.amount.toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {alert.actions && alert.actions.map((action, actionIndex) => (
                <Button
                  key={actionIndex}
                  variant={actionIndex === 0 ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => onAction && onAction(alert.type, action.key)}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2,
                    bgcolor: actionIndex === 0 ? mainColor : 'transparent',
                    borderColor: mainColor,
                    color: actionIndex === 0 ? 'white' : mainColor,
                    '&:hover': {
                      bgcolor: actionIndex === 0 ? alpha(mainColor, 0.9) : alpha(mainColor, 0.05),
                      borderColor: mainColor,
                    }
                  }}
                >
                  {action.label}
                </Button>
              ))}
              {!alert.actions && (
                <IconButton size="small" onClick={() => onAction && onAction(alert.type, 'view')}>
                  <ChevronRight />
                </IconButton>
              )}
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};

export default CriticalAlerts;
