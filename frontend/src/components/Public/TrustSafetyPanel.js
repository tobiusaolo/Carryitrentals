import React from 'react';
import { Box, Typography, Paper, Grid, Chip, Button, alpha } from '@mui/material';
import {
  VerifiedUser,
  Visibility,
  GppGood,
  ReportProblem,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TRUST_POINTS = [
  { icon: VerifiedUser, title: 'Admin-verified listings', desc: 'CarryIT staff review listings before they show the Verified badge.' },
  { icon: Visibility, title: 'View before you pay rent', desc: 'Inspection fee only — never pay monthly rent before viewing.' },
  { icon: GppGood, title: 'Transparent pricing', desc: 'Rent, deposit, and inspection fees shown upfront.' },
  { icon: ReportProblem, title: 'Report suspicious ads', desc: 'Flag fake, duplicate, or misleading listings in one click.' },
];

const RED_FLAGS = [
  'Price 30–50% below similar homes in the area',
  'Agent asks for rent or deposit before a viewing',
  'Photos look like stock images or another property',
  'Listing stays online but “already taken” on arrival',
];

const TrustSafetyPanel = ({ compact = false, onReport }) => {
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        p: compact ? 2 : 3,
        mb: 3,
        borderRadius: '16px',
        border: '1px solid #EBEBEB',
        bgcolor: alpha('#10b981', 0.04),
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: compact ? 1.5 : 2 }}>
        <Typography variant={compact ? 'subtitle1' : 'h6'} sx={{ fontWeight: 800 }}>
          Trusted search — built for East Africa
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {onReport && (
            <Button size="small" variant="outlined" color="error" onClick={onReport} sx={{ borderRadius: '8px', fontWeight: 700 }}>
              Report listing
            </Button>
          )}
          <Button size="small" variant="text" onClick={() => navigate('/guidelines')} sx={{ fontWeight: 700 }}>
            Safety guide
          </Button>
        </Box>
      </Box>

      {!compact && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {TRUST_POINTS.map(({ icon: Icon, title, desc }) => (
            <Grid item xs={12} sm={6} md={3} key={title}>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Icon sx={{ color: '#10b981', mt: 0.25 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{title}</Typography>
                  <Typography variant="caption" color="text.secondary">{desc}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#717171', mr: 1 }}>
          Watch for:
        </Typography>
        {RED_FLAGS.map((flag) => (
          <Chip key={flag} label={flag} size="small" sx={{ bgcolor: '#FFF', border: '1px solid #EBEBEB', fontSize: '0.7rem' }} />
        ))}
      </Box>
    </Paper>
  );
};

export default TrustSafetyPanel;
