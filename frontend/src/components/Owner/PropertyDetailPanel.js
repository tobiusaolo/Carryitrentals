import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Stack,
  Divider,
  Button,
  Paper,
} from '@mui/material';
import {
  Home,
  People,
  Storefront,
  Landscape,
  Sell,
  Apartment,
} from '@mui/icons-material';
import { colors, layout } from '../../theme/designTokens';
import OwnerStatStrip from './OwnerStatStrip';
import OwnerStatusChip from './OwnerStatusChip';
import {
  formatMoney,
} from '../../utils/formatMoney';
import {
  getPropertyTypeLabel,
  getListingIntentLabel,
  isLandProperty,
  isSaleListing,
  propertyOccupancySummary,
} from '../../constants/property';

function StatBlock({ label, value, hint }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 800, color: colors.text, lineHeight: 1.2 }}>
        {value}
      </Typography>
      {hint ? (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function PropertyDetailPanel({ property, onEdit, onClose, onAddUnit, onManageUnits }) {
  const navigate = useNavigate();

  if (!property) return null;

  const unitsHubPath = `/owner/property-hub?tab=units&property_id=${property.id}`;

  const handleAddUnit = () => {
    if (onAddUnit) onAddUnit();
    else navigate(unitsHubPath);
  };

  const handleManageUnits = () => {
    if (onManageUnits) onManageUnits();
    else navigate(unitsHubPath);
  };

  const occ = propertyOccupancySummary(property);
  const stats = property.stats || property;
  const land = isLandProperty(property);
  const sale = isSaleListing(property);

  const occupancyPct = Math.min(100, Math.max(0, occ.rate || 0));

  return (
    <Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <OwnerStatusChip status={property.property_type} label={getPropertyTypeLabel(property.property_type)} />
        <Chip size="small" label={getListingIntentLabel(property.listing_intent)} variant="outlined" />
        {land ? <Chip size="small" icon={<Landscape fontSize="small" />} label="Land" color="success" variant="outlined" /> : null}
        {sale && property.sale_price ? (
          <Chip size="small" icon={<Sell fontSize="small" />} label={`Sale ${formatMoney(property.sale_price, 'UGX')}`} color="primary" variant="outlined" />
        ) : null}
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {[property.address, property.city, property.state, property.country].filter(Boolean).join(' · ')}
      </Typography>

      {!land ? (
        <>
          <OwnerStatStrip
            sx={{ mb: 2 }}
            stats={[
              { title: 'Registered units', value: occ.unitCount, icon: <Apartment />, subtitle: occ.declared > 0 ? `Declared ${occ.declared}` : 'No cap set' },
              { title: 'Occupied', value: occ.occupied, icon: <People />, variantIndex: 1 },
              { title: 'Available', value: occ.available, icon: <Home />, variantIndex: 2 },
              { title: 'On marketplace', value: stats.marketplace_listings ?? 0, icon: <Storefront />, variantIndex: 3 },
            ]}
          />

          <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: `${layout.radius.md}px`, border: `1px solid ${colors.border}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Occupancy
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: colors.brand }}>
                {occupancyPct.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={occupancyPct}
              sx={{
                height: 8,
                borderRadius: 4,
                mb: 1,
                bgcolor: colors.surfaceMuted,
                '& .MuiLinearProgress-bar': { bgcolor: colors.brand },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {occ.headline}
              {occ.maintenance > 0 ? ` · ${occ.maintenance} under maintenance` : ''}
            </Typography>
            {occ.remaining != null && occ.remaining > 0 ? (
              <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                {occ.remaining} declared unit slot(s) not yet added in CarryIT
              </Typography>
            ) : null}
          </Paper>
        </>
      ) : (
        <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: `${layout.radius.md}px`, border: `1px solid ${colors.border}`, bgcolor: `${colors.success}08` }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Land / plot details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <StatBlock label="Plot size" value={property.lot_size || '—'} />
            </Grid>
            <Grid item xs={6} sm={4}>
              <StatBlock label="Listing" value={getListingIntentLabel(property.listing_intent)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatBlock
                label="Asking price"
                value={property.sale_price ? formatMoney(property.sale_price, 'UGX') : '—'}
              />
            </Grid>
          </Grid>
          {occ.unitCount > 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              {occ.unitCount} subdivided plot(s) tracked as units
            </Typography>
          ) : null}
        </Paper>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <StatBlock label="Tenants" value={stats.tenant_count ?? 0} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatBlock
            label="Rent potential"
            value={stats.monthly_rent_potential ? formatMoney(stats.monthly_rent_potential, 'UGX') : '—'}
            hint="/ month"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatBlock label="MTN MoMo" value={property.mtn_mobile_money_number || '—'} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatBlock label="Airtel Money" value={property.airtel_money_number || '—'} />
        </Grid>
      </Grid>

      {property.description ? (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Description
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
            {property.description}
          </Typography>
        </>
      ) : null}

      {stats.tracking_note ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          {stats.tracking_note}
        </Typography>
      ) : null}

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
        {onEdit ? (
          <Button variant="contained" onClick={onEdit}>
            Edit property
          </Button>
        ) : null}
        {!land ? (
          <Button variant="outlined" onClick={handleAddUnit}>
            Add unit
          </Button>
        ) : null}
        {!land ? (
          <Button variant="outlined" onClick={handleManageUnits}>
            View units
          </Button>
        ) : null}
        {onClose ? (
          <Button variant="text" onClick={onClose}>
            Close
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}
