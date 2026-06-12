import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
  Box,
  Chip,
} from '@mui/material';
import { MyLocation } from '@mui/icons-material';
import { useViewerCurrency } from '../../contexts/ViewerCurrencyContext';

const CurrencyCountryMenu = () => {
  const { viewerCountry, displayCurrency, regions, setCountry, detectionSource, detecting } =
    useViewerCurrency();
  const [anchor, setAnchor] = useState(null);

  const region = regions.find((r) => r.country === viewerCountry);

  return (
    <>
      <Tooltip
        title={
          detecting
            ? 'Detecting your region…'
            : `Prices in ${displayCurrency} · ${viewerCountry}${detectionSource === 'ip' || detectionSource === 'timezone' ? ' (auto)' : ''}`
        }
      >
        <IconButton
          onClick={(e) => setAnchor(e.currentTarget)}
          size="small"
          sx={{
            color: '#222',
            border: '1px solid #EBEBEB',
            borderRadius: '10px',
            px: 1,
          }}
        >
          <Typography component="span" variant="caption" sx={{ fontWeight: 800, fontSize: '0.7rem' }}>
            {region?.flag} {displayCurrency}
          </Typography>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: '16px', minWidth: 280, mt: 1 } }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #EBEBEB' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Display currency
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Based on your country/region. Listings convert for easy comparison.
          </Typography>
          {!detecting && (
            <Chip
              size="small"
              icon={<MyLocation sx={{ fontSize: 14 }} />}
              label={detectionSource === 'manual' ? 'You selected' : 'Auto-detected'}
              sx={{ mt: 1, fontSize: '0.65rem' }}
            />
          )}
        </Box>
        {regions.map((r) => (
          <MenuItem
            key={r.country}
            selected={r.country === viewerCountry}
            onClick={() => {
              setCountry(r.country);
              setAnchor(null);
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography fontSize="1.25rem">{r.flag}</Typography>
            </ListItemIcon>
            <ListItemText
              primary={r.country}
              secondary={`Show prices in ${r.currency}`}
              primaryTypographyProps={{ fontWeight: r.country === viewerCountry ? 800 : 500 }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default CurrencyCountryMenu;
