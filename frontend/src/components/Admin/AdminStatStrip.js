import React from 'react';
import { Grid } from '@mui/material';
import AdminStatCard from './AdminStatCard';

/**
 * Responsive row of KPI cards.
 * @param {Array<{title, value, subtitle?, icon?, color?, variantIndex?, progress?, trend?, trendLabel?, onClick?}>} stats
 */
export default function AdminStatStrip({ stats = [], loading = false, spacing = 2, sx }) {
  if (!stats.length) return null;

  return (
    <Grid container spacing={spacing} sx={{ mb: 2.5, ...sx }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={stats.length >= 4 ? 3 : 4} key={stat.id || stat.title || index}>
          <AdminStatCard {...stat} variantIndex={stat.variantIndex ?? index} loading={loading} />
        </Grid>
      ))}
    </Grid>
  );
}
