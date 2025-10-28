import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import {
  Inbox,
  Person,
  Home,
  Payment,
  Message,
  Description
} from '@mui/icons-material';

const EmptyState = ({ 
  type = 'default', 
  title, 
  message, 
  actionText, 
  onAction,
  icon: CustomIcon 
}) => {
  const getDefaultConfig = () => {
    switch (type) {
      case 'tenants':
        return {
          icon: Person,
          title: 'No Tenants Yet',
          message: 'Get started by adding your first tenant to this property',
          actionText: 'Add Tenant'
        };
      case 'properties':
        return {
          icon: Home,
          title: 'No Properties Yet',
          message: 'Create your first property to start managing rentals',
          actionText: 'Add Property'
        };
      case 'payments':
        return {
          icon: Payment,
          title: 'No Payments Found',
          message: 'Payment records will appear here once tenants make payments',
          actionText: 'Record Payment'
        };
      case 'messages':
        return {
          icon: Message,
          title: 'No Messages Sent',
          message: 'Send your first bulk message to communicate with tenants',
          actionText: 'Send Message'
        };
      case 'reports':
        return {
          icon: Description,
          title: 'No Reports Yet',
          message: 'Generate reports to track your property performance',
          actionText: 'Generate Report'
        };
      default:
        return {
          icon: Inbox,
          title: 'No Data Available',
          message: 'There is no data to display at this time',
          actionText: null
        };
    }
  };

  const config = getDefaultConfig();
  const Icon = CustomIcon || config.icon;
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const displayActionText = actionText || config.actionText;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
        minHeight: 300
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: 'primary.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3
        }}
      >
        <Icon sx={{ fontSize: 60, color: 'text.disabled' }} />
      </Box>
      
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {displayTitle}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {displayMessage}
      </Typography>
      
      {displayActionText && onAction && (
        <Button
          variant="contained"
          size="large"
          onClick={onAction}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          {displayActionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;

