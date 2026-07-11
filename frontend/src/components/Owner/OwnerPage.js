import React from 'react';
import { Box } from '@mui/material';
import { layout, portalPageSx } from '../../theme/designTokens';

/**
 * Standard owner page wrapper — padding + max width; inner section scrolls on small screens.
 */
export default function OwnerPage({ children, disableMaxWidth = false, sx }) {
  return (
    <Box
      sx={{
        ...portalPageSx,
        px: { xs: 2, sm: 2.5 },
        pt: { xs: 2, sm: 2.5 },
        maxWidth: disableMaxWidth ? 'none' : layout.adminMaxWidth,
        mx: 'auto',
        width: '100%',
        ...sx,
      }}
    >
      <Box
        component="section"
        sx={{
          width: '100%',
          minWidth: 0,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
