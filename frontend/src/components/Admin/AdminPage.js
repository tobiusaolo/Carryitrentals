import React from 'react';
import { Box } from '@mui/material';

/**
 * Standard admin page wrapper — no extra padding (AdminLayout already provides it).
 */
export default function AdminPage({ children, sx }) {
  return (
    <Box
      component="section"
      sx={{
        width: '100%',
        minWidth: 0,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
