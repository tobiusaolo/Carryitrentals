import React from 'react';
import { Box } from '@mui/material';
import { colors, layout, portalPageSx } from '../../theme/designTokens';

const OwnerPageContainer = ({ children, disableMaxWidth = false }) => (
  <Box
    sx={{
      ...portalPageSx,
      px: { xs: 2, sm: 2.5 },
      pt: { xs: 2, sm: 2.5 },
      maxWidth: disableMaxWidth ? 'none' : layout.adminMaxWidth,
      mx: 'auto',
      width: '100%',
    }}
  >
    {children}
  </Box>
);

export default OwnerPageContainer;
