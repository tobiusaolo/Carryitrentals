import React from 'react';
import { Grid } from '@mui/material';
import AdminPanel from './AdminPanel';
import { EnhancedBarChart, EnhancedPieChart } from '../UI/EnhancedCharts';
import { adminPalette } from '../../theme/designTokens';
import { formatMoney } from '../../utils/formatMoney';

export default function AdminRevenueCharts({ sourceBarData, sourcePieData, currency }) {
  if (!sourceBarData.length) return null;

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={7}>
        <AdminPanel title="Revenue by source (MTD)" subtitle="Platform income this month">
          <EnhancedBarChart
            data={sourceBarData}
            dataKey="value"
            xKey="name"
            color={adminPalette.indigo}
            formatter={(v) => formatMoney(v, currency)}
          />
        </AdminPanel>
      </Grid>
      <Grid item xs={12} md={5}>
        <AdminPanel title="Source mix" subtitle="Share of MTD platform revenue">
          <EnhancedPieChart data={sourcePieData} />
        </AdminPanel>
      </Grid>
    </Grid>
  );
}
