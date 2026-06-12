import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { colors } from '../../theme/designTokens';

/**
 * Visual section break for long admin/owner forms.
 */
const FormSection = ({ title, subtitle, children, first }) => (
  <Box sx={{ width: '100%', mt: first ? 0 : 2 }}>
    {!first && <Divider sx={{ mb: 2 }} />}
    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.text, mb: subtitle ? 0.5 : 1.5 }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" sx={{ color: colors.textMuted, mb: 1.5 }}>
        {subtitle}
      </Typography>
    )}
    {children}
  </Box>
);

export default FormSection;
