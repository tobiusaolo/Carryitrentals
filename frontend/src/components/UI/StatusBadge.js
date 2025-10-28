import React from 'react';
import { Chip, Box } from '@mui/material';
import {
  CheckCircle,
  Warning,
  Cancel,
  Schedule,
  FastForward,
  HourglassEmpty
} from '@mui/icons-material';

const StatusBadge = ({ status, size = 'small', showIcon = true }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return {
          label: 'Paid',
          color: 'success',
          icon: <CheckCircle sx={{ fontSize: 16 }} />,
          bgcolor: '#d1fae5',
          textColor: '#065f46'
        };
      case 'overdue':
        return {
          label: 'Overdue',
          color: 'error',
          icon: <Cancel sx={{ fontSize: 16 }} />,
          bgcolor: '#fee2e2',
          textColor: '#991b1b'
        };
      case 'due':
        return {
          label: 'Due',
          color: 'warning',
          icon: <Warning sx={{ fontSize: 16 }} />,
          bgcolor: '#fef3c7',
          textColor: '#92400e'
        };
      case 'pending':
        return {
          label: 'Pending',
          color: 'default',
          icon: <HourglassEmpty sx={{ fontSize: 16 }} />,
          bgcolor: '#f3f4f6',
          textColor: '#374151'
        };
      case 'paid_ahead':
      case 'advance':
        return {
          label: 'Paid Ahead',
          color: 'secondary',
          icon: <FastForward sx={{ fontSize: 16 }} />,
          bgcolor: '#ede9fe',
          textColor: '#5b21b6'
        };
      case 'scheduled':
        return {
          label: 'Scheduled',
          color: 'info',
          icon: <Schedule sx={{ fontSize: 16 }} />,
          bgcolor: '#dbeafe',
          textColor: '#1e40af'
        };
      case 'occupied':
        return {
          label: 'Occupied',
          color: 'success',
          icon: <CheckCircle sx={{ fontSize: 16 }} />,
          bgcolor: '#d1fae5',
          textColor: '#065f46'
        };
      case 'available':
        return {
          label: 'Available',
          color: 'info',
          icon: null,
          bgcolor: '#dbeafe',
          textColor: '#1e40af'
        };
      default:
        return {
          label: status || 'Unknown',
          color: 'default',
          icon: null,
          bgcolor: '#f3f4f6',
          textColor: '#374151'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      icon={showIcon ? config.icon : null}
      label={config.label}
      size={size}
      sx={{
        bgcolor: config.bgcolor,
        color: config.textColor,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        '& .MuiChip-icon': {
          color: config.textColor
        }
      }}
    />
  );
};

export default StatusBadge;

