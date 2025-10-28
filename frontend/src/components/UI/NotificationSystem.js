import React from 'react';
import { Snackbar, Alert, AlertTitle, Slide } from '@mui/material';
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';

const SlideTransition = (props) => {
  return <Slide {...props} direction="up" />;
};

const NotificationSystem = ({ 
  open, 
  message, 
  severity = 'info', 
  title,
  onClose,
  autoHideDuration = 6000,
  action
}) => {
  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircle fontSize="inherit" />;
      case 'error':
        return <Error fontSize="inherit" />;
      case 'warning':
        return <Warning fontSize="inherit" />;
      case 'info':
      default:
        return <Info fontSize="inherit" />;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        icon={getIcon()}
        action={action}
        variant="filled"
        sx={{
          minWidth: 300,
          boxShadow: 3,
          borderRadius: 2,
          '& .MuiAlert-icon': {
            fontSize: 24
          }
        }}
      >
        {title && <AlertTitle sx={{ fontWeight: 'bold' }}>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSystem;

