import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
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
  Hotel,
  Payment,
  Refresh,
  Subscriptions,
  Visibility,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/UI/PageHeader';
import { formatMoney } from '../../utils/formatMoney';
import { adminRevenueAPI } from '../../services/api/adminRevenueAPI';
import { portalOutlinedButtonSx } from '../../theme/designTokens';

function StatCard({ title, value, subtitle, icon, color = 'primary.main' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Box sx={{ color, opacity: 0.85 }}>{icon}</Box>
        </Box>
        <Typography variant="h4" fontWeight={800} color={color}>
          {value}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

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
  }, [user, load]);

  if (user?.role !== 'admin') {
    return <Alert severity="error">Admin access required</Alert>;
  }

  const currency = data?.currency || 'UGX';
  const mrr = data?.mrr;
  const platform = data?.platform_revenue;
  const rent = data?.landlord_rent_volume;
  const pending = data?.pending_approvals;

  return (
    <Box>
      <PageHeader
        title="Platform revenue"
        subtitle="Subscriptions, viewing fees, and Airbnb commissions — rent is kept separate for landlords"
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
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Monthly recurring revenue (MRR)"
                value={formatMoney(mrr?.amount ?? 0, currency)}
                subtitle={`${mrr?.active_subscribers ?? 0} active · ${mrr?.trialing_subscribers ?? 0} trialing`}
                icon={<Subscriptions />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Platform revenue (MTD)"
                value={formatMoney(platform?.mtd_total ?? 0, currency)}
                subtitle="This calendar month"
                icon={<AttachMoney />}
                color="success.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pesapal (MTD)"
                value={formatMoney(platform?.by_method_mtd?.pesapal ?? 0, currency)}
                subtitle={`Manual: ${formatMoney(platform?.by_method_mtd?.manual ?? 0, currency)}`}
                icon={<Payment />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="All-time platform revenue"
                value={formatMoney(platform?.all_time_total ?? 0, currency)}
                subtitle="Excludes tenant rent"
                icon={<AccountBalance />}
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mb: 3 }}>
            {rent?.note}
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue by source
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Only CarryIT income — landlord subscriptions, viewing fees, and Airbnb platform cut.
                  </Typography>
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
                </CardContent>
              </Card>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent platform transactions
                  </Typography>
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
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Hotel fontSize="small" />
                    Landlord rent volume (not platform revenue)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Rent paid by tenants through CarryIT is recorded for landlords only. It does not
                    enter the platform wallet or subscription revenue.
                  </Typography>
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
                </CardContent>
              </Card>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Visibility fontSize="small" />
                    Pending approvals
                  </Typography>
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
                </CardContent>
              </Card>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Payment methods (all time)
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
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
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : null}
    </Box>
  );
};

export default AdminRevenue;
