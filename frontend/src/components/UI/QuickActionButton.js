import React from 'react';
import { IconButton, Tooltip } from '@mui/material';

const QuickActionButton = ({ 
  icon, 
  tooltip, 
  onClick, 
  color = 'primary',
  size = 'small',
  disabled = false 
}) => {
  return (
    <Tooltip title={tooltip} arrow>
      <span>
        <IconButton
          size={size}
          color={color}
          onClick={onClick}
          disabled={disabled}
          sx={{
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)',
              bgcolor: `${color}.50`
            }
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default QuickActionButton;

