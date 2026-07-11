import React from 'react';
import { Grid } from '@mui/material';
import AdminPanel from './AdminPanel';
import { EnhancedBarChart, EnhancedPieChart } from '../UI/EnhancedCharts';
import { adminPalette } from '../../theme/designTokens';

export default function AdminAnalyticsCharts({ ownerPieData, occupancyBarData }) {
  if (!ownerPieData.length && !occupancyBarData.length) return null;

  return (
    <Grid container spacing={2} sx={{ mb: 2.5 }}>
      {ownerPieData.length > 0 && (
        <Grid item xs={12} md={6}>
          <AdminPanel title="Portfolio rent by owner" subtitle="Top owners by monthly rent potential">
            <EnhancedPieChart data={ownerPieData} />
          </AdminPanel>
        </Grid>
      )}
      {occupancyBarData.length > 0 && (
        <Grid item xs={12} md={6}>
          <AdminPanel title="Occupancy by property" subtitle="Occupied units as % of total">
            <EnhancedBarChart
              data={occupancyBarData}
              dataKey="occupancy"
              xKey="name"
              color={adminPalette.primary}
              formatter={(v) => `${v}%`}
            />
          </AdminPanel>
        </Grid>
      )}
    </Grid>
  );
}
