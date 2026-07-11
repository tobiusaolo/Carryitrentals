import React, { useCallback, useEffect, useState, Suspense, lazy } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  AccountBalance,
  AttachMoney,
  Payment,
  Refresh,
  Subscriptions,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/UI/PageHeader';
import AdminPage from '../../components/Admin/AdminPage';
import AdminStatStrip from '../../components/Admin/AdminStatStrip';
import AdminPanel from '../../components/Admin/AdminPanel';
import { formatMoney } from '../../utils/formatMoney';
import { adminRevenueAPI } from '../../services/api/adminRevenueAPI';
import { portalOutlinedButtonSx } from '../../theme/designTokens';
import { buildTransactionSparkline, buildSourceBarData } from '../../utils/adminChartData';

const AdminRevenueCharts = lazy(() => import('../../components/Admin/AdminRevenueCharts'));

function SourceRow({ label, mtd, allTime, currency }) {
  return (
    <TableRow>
      <TableCell>{label}</TableCell>
      <TableCell align="right">{formatMoney(mtd, currency)}</TableCell>
      <TableCell align="right">{formatMoney(allTime, currency)}</TableCell>
    </TableRow>
  );
}

const AdminRevenue = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: payload } = await adminRevenueAPI.getSummary();
      setData(payload);
    } catch (e) {
      setError(typeof e.response?.data?.detail === 'string' ? e.response.data.detail : 'Could not load revenue data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') load();
    const handler = () => load();
    window.addEventListener('carryit:admin-refresh', handler);
    return () => window.removeEventListener('carryit:admin-refresh', handler);
  }, [user, load]);

  if (user?.role !== 'admin') {
    return <Alert severity="error">Admin access required</Alert>;
  }

  const currency = data?.currency || 'UGX';
  const mrr = data?.mrr;
  const platform = data?.platform_revenue;
  const rent = data?.landlord_rent_volume;
  const pending = data?.pending_approvals;
  const revenueSparkline = buildTransactionSparkline(data?.recent_platform_transactions ?? []);
  const sourceBarData = buildSourceBarData(platform?.by_source_mtd ?? {});
  const sourcePieData = sourceBarData.map((row) => ({ name: row.name, value: row.value }));

  return (
    <AdminPage>
      <PageHeader
        variant="admin"
        title="Platform revenue"
        subtitle="MRR, subscriptions & fees"
        action={
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={load}
            disabled={loading}
            sx={portalOutlinedButtonSx}
          >
            Refresh
          </Button>
        }
      />

      {loading && !data ? <LinearProgress sx={{ mb: 2 }} /> : null}
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {data ? (
        <>
          <AdminStatStrip
            stats={[
              {
                id: 'mrr',
                title: 'Monthly recurring revenue',
                value: formatMoney(mrr?.amount ?? 0, currency),
                subtitle: `${mrr?.active_subscribers ?? 0} active · ${mrr?.trialing_subscribers ?? 0} trialing`,
                icon: <Subscriptions />,
              },
              {
                id: 'mtd',
                title: 'Platform revenue (MTD)',
                value: formatMoney(platform?.mtd_total ?? 0, currency),
                subtitle: 'This calendar month',
                icon: <AttachMoney />,
                sparklineData: revenueSparkline,
              },
              {
                id: 'pesapal',
                title: 'Pesapal (MTD)',
                value: formatMoney(platform?.by_method_mtd?.pesapal ?? 0, currency),
                subtitle: `Manual: ${formatMoney(platform?.by_method_mtd?.manual ?? 0, currency)}`,
                icon: <Payment />,
              },
              {
                id: 'alltime',
                title: 'All-time platform revenue',
                value: formatMoney(platform?.all_time_total ?? 0, currency),
                subtitle: 'Excludes tenant rent',
                icon: <AccountBalance />,
              },
            ]}
          />

          <Alert severity="info" sx={{ mb: 3 }}>
            {rent?.note}
          </Alert>

          {sourceBarData.length > 0 && (
            <Suspense fallback={<LinearProgress sx={{ mb: 3 }} />}>
              <AdminRevenueCharts
                sourceBarData={sourceBarData}
                sourcePieData={sourcePieData}
                currency={currency}
              />
            </Suspense>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <AdminPanel title="Revenue by source" subtitle="CarryIT income only — subscriptions, viewing fees, Airbnb cut.">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Source</TableCell>
                        <TableCell align="right">MTD</TableCell>
                        <TableCell align="right">All time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <SourceRow
                        label="Landlord subscriptions"
                        mtd={platform?.by_source_mtd?.subscription ?? 0}
                        allTime={platform?.by_source_all_time?.subscription ?? 0}
                        currency={currency}
                      />
                      <SourceRow
                        label="Viewing / inspection fees"
                        mtd={platform?.by_source_mtd?.inspection ?? 0}
                        allTime={platform?.by_source_all_time?.inspection ?? 0}
                        currency={currency}
                      />
                      <SourceRow
                        label="Airbnb platform fees"
                        mtd={platform?.by_source_mtd?.airbnb_fees ?? 0}
                        allTime={platform?.by_source_all_time?.airbnb_fees ?? 0}
                        currency={currency}
                      />
                    </TableBody>
                  </Table>
              </AdminPanel>

              <AdminPanel title="Recent platform transactions" sx={{ mt: 3 }} contentSx={{ pt: 0 }}>
                  {(data.recent_platform_transactions ?? []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No completed platform payments yet.
                    </Typography>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell>Method</TableCell>
                          <TableCell align="right">Platform amount</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(data.recent_platform_transactions ?? []).map((row) => (
                          <TableRow key={row.id}>
                            <TableCell sx={{ textTransform: 'capitalize' }}>{row.category}</TableCell>
                            <TableCell sx={{ textTransform: 'capitalize' }}>{row.method}</TableCell>
                            <TableCell align="right">{formatMoney(row.amount, row.currency || currency)}</TableCell>
                            <TableCell>
                              {row.completed_at
                                ? new Date(row.completed_at).toLocaleDateString()
                                : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
              </AdminPanel>
            </Grid>

            <Grid item xs={12} md={5}>
              <AdminPanel
                title="Landlord rent volume"
                subtitle="Not platform revenue — rent processed for landlords only."
              >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">MTD rent processed</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {formatMoney(rent?.mtd_amount ?? 0, currency)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">All-time rent processed</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {formatMoney(rent?.all_time_amount ?? 0, currency)}
                    </Typography>
                  </Box>
              </AdminPanel>

              <AdminPanel title="Pending approvals" sx={{ mt: 3 }} contentSx={{ pt: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Platform payments (viewing, etc.)</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {pending?.platform_count ?? 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Tenant rent (for landlords)</Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {pending?.rent_for_landlords_count ?? 0}
                    </Typography>
                  </Box>
              </AdminPanel>

              <AdminPanel title="Payment methods (all time)" sx={{ mt: 3 }} contentSx={{ pt: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Pesapal</Typography>
                    <Typography fontWeight={700}>
                      {formatMoney(platform?.by_method_all_time?.pesapal ?? 0, currency)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Manual proof</Typography>
                    <Typography fontWeight={700}>
                      {formatMoney(platform?.by_method_all_time?.manual ?? 0, currency)}
                    </Typography>
                  </Box>
              </AdminPanel>
            </Grid>
          </Grid>
        </>
      ) : null}
    </AdminPage>
  );
};

export default AdminRevenue;
