import React from 'react';
import { Alert, AlertTitle, Box, Button, Chip, Typography } from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  Send,
  Visibility
} from '@mui/icons-material';

const CriticalAlerts = ({ alerts = [], onAction }) => {
  if (!alerts || alerts.length === 0) return null;

  const getSeverity = (type) => {
    switch (type) {
      case 'overdue': return 'error';
      case 'due': return 'warning';
      case 'vacant': return 'info';
      case 'maintenance': return 'warning';
      default: return 'info';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'overdue': return <Error />;
      case 'due': return <Warning />;
      case 'vacant': return <Info />;
      case 'maintenance': return <Warning />;
      default: return <Info />;
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          severity={getSeverity(alert.type)}
          icon={getIcon(alert.type)}
          sx={{
            mb: index < alerts.length - 1 ? 2 : 0,
            '& .MuiAlert-message': { width: '100%' },
            borderRadius: 2,
            boxShadow: 1
          }}
          action={
            alert.actions && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {alert.actions.map((action, actionIndex) => (
                  <Button
                    key={actionIndex}
                    size="small"
                    variant={actionIndex === 0 ? 'contained' : 'outlined'}
                    color="inherit"
                    onClick={() => onAction && onAction(alert.type, action.key)}
                    startIcon={action.icon}
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            )
          }
        >
          <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
            {alert.title}
            {alert.count && (
              <Chip
                label={alert.count}
                size="small"
                sx={{ ml: 1, fontWeight: 'bold' }}
              />
            )}
          </AlertTitle>
          <Typography variant="body2">
            {alert.message}
          </Typography>
          {alert.amount && (
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
              Amount: ${alert.amount.toLocaleString()}
            </Typography>
          )}
        </Alert>
      ))}
    </Box>
  );
};

export default CriticalAlerts;

