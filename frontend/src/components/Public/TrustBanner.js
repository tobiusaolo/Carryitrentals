import React from 'react';
import { Box, Typography, Button, alpha } from '@mui/material';
import { VerifiedUser, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/designTokens';

/** One-line trust cue — no wall of chips on browse pages */
const TrustBanner = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        py: 1.25,
        px: 2,
        mb: 2,
        borderRadius: `${12}px`,
        bgcolor: alpha(colors.success, 0.06),
        border: `1px solid ${alpha(colors.success, 0.2)}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <VerifiedUser sx={{ fontSize: 18, color: colors.success, flexShrink: 0 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
          Verified agents · View before you pay rent · Transparent fees
        </Typography>
      </Box>
      <Button
        size="small"
        endIcon={<ChevronRight />}
        onClick={() => navigate('/guidelines')}
        sx={{ fontWeight: 700, color: colors.text, flexShrink: 0, whiteSpace: 'nowrap' }}
      >
        Safety guide
      </Button>
    </Box>
  );
};

export default TrustBanner;
