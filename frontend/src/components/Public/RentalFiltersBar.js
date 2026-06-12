import React, { useMemo, useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Paper,
  Grid,
  Typography,
  Drawer,
  IconButton,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FilterList, Clear, Close } from '@mui/icons-material';
import { VIEWER_REGIONS } from '../../config/currencyLocale';
import { useViewerCurrencyOptional } from '../../contexts/ViewerCurrencyContext';
import { colors } from '../../theme/designTokens';

const COUNTRIES = ['', ...VIEWER_REGIONS.filter((r) =>
  ['UGX', 'KES', 'TZS', 'RWF', 'BIF', 'SSP'].includes(r.currency)
).map((r) => r.country)];

const FilterFields = ({ filters, onChange }) => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <TextField
        fullWidth
        size="small"
        label="Area / neighborhood"
        placeholder="e.g. Naguru, Kisaasi"
        value={filters.location}
        onChange={(e) => onChange({ ...filters, location: e.target.value })}
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        select
        fullWidth
        size="small"
        label="Country"
        value={filters.country}
        onChange={(e) => onChange({ ...filters, country: e.target.value })}
      >
        {COUNTRIES.map((c) => (
          <MenuItem key={c || 'all'} value={c}>{c || 'All'}</MenuItem>
        ))}
      </TextField>
    </Grid>
    <Grid item xs={6} sm={6}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Min rent (listing currency)"
        value={filters.min_price}
        onChange={(e) => onChange({ ...filters, min_price: e.target.value })}
      />
    </Grid>
    <Grid item xs={6} sm={6}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Max rent (listing currency)"
        value={filters.max_price}
        onChange={(e) => onChange({ ...filters, max_price: e.target.value })}
      />
    </Grid>
    <Grid item xs={12}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Bedrooms"
        value={filters.bedrooms}
        onChange={(e) => onChange({ ...filters, bedrooms: e.target.value })}
      />
    </Grid>
  </Grid>
);

const RentalFiltersBar = ({ filters, onChange, onApply, onClear }) => {
  const { displayCurrency } = useViewerCurrencyOptional();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeCount = useMemo(
    () =>
      [filters.location, filters.country, filters.min_price, filters.max_price, filters.bedrooms].filter(
        (v) => v !== '' && v != null
      ).length,
    [filters]
  );

  const applyAndClose = () => {
    onApply();
    setDrawerOpen(false);
  };

  const clearAndClose = () => {
    onClear();
    setDrawerOpen(false);
  };

  if (isMobile) {
    return (
      <Box sx={{ mb: 2 }}>
        <Badge badgeContent={activeCount} color="primary" sx={{ width: '100%' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setDrawerOpen(true)}
            sx={{
              justifyContent: 'flex-start',
              fontWeight: 700,
              borderRadius: '10px',
              borderColor: colors.border,
              color: colors.text,
              py: 1.25,
            }}
          >
            Filters {activeCount > 0 ? `(${activeCount})` : ''}
          </Button>
        </Badge>

        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '85vh' },
          }}
        >
          <Box sx={{ p: 2.5, pb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Filters
              </Typography>
              <IconButton size="small" onClick={() => setDrawerOpen(false)} aria-label="Close">
                <Close />
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Prices on cards use {displayCurrency}
            </Typography>
            <FilterFields filters={filters} onChange={onChange} />
            <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={applyAndClose}
                sx={{ bgcolor: colors.text, fontWeight: 700, boxShadow: 'none' }}
              >
                Show results
              </Button>
              <Button variant="outlined" onClick={clearAndClose} sx={{ minWidth: 48 }}>
                <Clear />
              </Button>
            </Box>
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '12px', border: `1px solid ${colors.border}` }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Filter by area and budget · Cards show {displayCurrency}
      </Typography>
      <Grid container spacing={2} alignItems="flex-end">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Area / neighborhood"
            placeholder="e.g. Naguru"
            value={filters.location}
            onChange={(e) => onChange({ ...filters, location: e.target.value })}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <TextField
            select
            fullWidth
            size="small"
            label="Country"
            value={filters.country}
            onChange={(e) => onChange({ ...filters, country: e.target.value })}
          >
            {COUNTRIES.map((c) => (
              <MenuItem key={c || 'all'} value={c}>{c || 'All'}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Min rent (listing currency)"
            value={filters.min_price}
            onChange={(e) => onChange({ ...filters, min_price: e.target.value })}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Max rent (listing currency)"
            value={filters.max_price}
            onChange={(e) => onChange({ ...filters, max_price: e.target.value })}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={1}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Beds"
            value={filters.bedrooms}
            onChange={(e) => onChange({ ...filters, bedrooms: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FilterList />}
              onClick={onApply}
              sx={{ bgcolor: colors.text, fontWeight: 700, borderRadius: '10px', boxShadow: 'none' }}
            >
              Apply
            </Button>
            <Button variant="outlined" onClick={onClear} sx={{ minWidth: 48, borderRadius: '10px' }}>
              <Clear />
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RentalFiltersBar;
