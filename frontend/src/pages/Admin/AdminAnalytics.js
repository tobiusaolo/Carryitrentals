import React, { useCallback, useEffect, useState, Suspense, lazy } from 'react';
import {
  Box,
  Grid,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  Subscriptions as SubscriptionsIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/UI/PageHeader';
import DataTable from '../../components/UI/DataTable';
import AdminPage from '../../components/Admin/AdminPage';
import AdminStatStrip from '../../components/Admin/AdminStatStrip';
import AdminPanel from '../../components/Admin/AdminPanel';
import AdminStatusChip from '../../components/Admin/AdminStatusChip';
import { formatMoney } from '../../utils/formatMoney';
import adminAPI from '../../services/api/adminAPI';
import { buildOwnerPieData, buildOccupancyBarData } from '../../utils/adminChartData';

const AdminAnalyticsCharts = lazy(() => import('../../components/Admin/AdminAnalyticsCharts'));

const AdminAnalytics = () => {
  const { user } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await adminAPI.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') loadAnalytics();
    const handler = () => loadAnalytics();
    window.addEventListener('carryit:admin-refresh', handler);
    return () => window.removeEventListener('carryit:admin-refresh', handler);
  }, [user, loadAnalytics]);

  const currency = analytics?.currency || 'UGX';
  const totalPortfolio = analytics?.portfolio_monthly_rent ?? 0;
  const revenueByOwner = analytics?.revenue_by_owner ?? [];
  const ownerPieData = buildOwnerPieData(revenueByOwner);
  const occupancyBarData = buildOccupancyBarData(analytics?.property_performance ?? []);

  const revenueColumns = [
    {
      id: 'ownerName',
      label: 'Owner',
      getSearchValue: (row) => row.ownerName,
      render: (owner) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.875rem' }}>
            {owner.ownerName?.charAt(0)}
          </Avatar>
          {owner.ownerName}
        </Box>
      ),
    },
    { id: 'properties', label: 'Properties', render: (owner) => owner.properties },
    {
      id: 'revenue',
      label: 'Portfolio rent (monthly)',
      render: (owner) => formatMoney(owner.revenue, currency),
    },
    {
      id: 'marketShare',
      label: 'Share of portfolio',
      render: (owner) => {
        const marketShare = totalPortfolio ? (owner.revenue / totalPortfolio) * 100 : 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress variant="determinate" value={marketShare} sx={{ width: 80, height: 4, borderRadius: 2 }} />
            {marketShare.toFixed(1)}%
          </Box>
        );
      },
    },
    {
      id: 'performance',
      label: 'Performance',
      render: (owner) => {
        const marketShare = totalPortfolio ? (owner.revenue / totalPortfolio) * 100 : 0;
        const label = marketShare > 50 ? 'High' : marketShare > 25 ? 'Medium' : 'Low';
        return <AdminStatusChip status={label.toLowerCase()} label={label} />;
      },
    },
  ];

  if (user?.role !== 'admin') {
    return (
      <AdminPage>
        <Alert severity="error">You need admin privileges to access this page.</Alert>
      </AdminPage>
    );
  }

  if (loading && !analytics) {
    return (
      <AdminPage>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </AdminPage>
    );
  }

  const growth = analytics?.portfolio_growth_week_pct;

  return (
    <AdminPage>
      <PageHeader variant="admin" title="Analytics" subtitle="Trends & performance" />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {analytics && (
        <>
          <AdminStatStrip
            loading={loading}
            stats={[
              {
                id: 'mrr',
                title: 'Platform MRR',
                value: formatMoney(analytics.mrr?.amount ?? 0, currency),
                subtitle: `${analytics.mrr?.active_subscribers ?? 0} subscribed landlords`,
                icon: <SubscriptionsIcon />,
              },
              {
                id: 'occupancy',
                title: 'Occupancy rate',
                value: `${analytics.occupancy_rate ?? 0}%`,
                subtitle: 'Units occupied',
                icon: <PeopleIcon />,
                progress: analytics.occupancy_rate,
              },
              {
                id: 'properties',
                title: 'Properties',
                value: analytics.total_properties ?? 0,
                subtitle: 'On platform',
                icon: <HomeIcon />,
                trend: growth,
                trendLabel: 'vs last week',
              },
              {
                id: 'revenue',
                title: 'Platform revenue (MTD)',
                value: formatMoney(analytics.platform_revenue_mtd ?? 0, currency),
                subtitle: 'Subscriptions, viewing fees, Airbnb fees',
                icon: <MoneyIcon />,
              },
            ]}
          />

          <Alert severity="info" sx={{ mb: 2.5 }}>
            Portfolio rent ({formatMoney(totalPortfolio, currency)}/mo) is landlord inventory — not platform revenue.
          </Alert>

          {(ownerPieData.length > 0 || occupancyBarData.length > 0) && (
            <Suspense fallback={<LinearProgress sx={{ mb: 2.5 }} />}>
              <AdminAnalyticsCharts
                ownerPieData={ownerPieData}
                occupancyBarData={occupancyBarData}
              />
            </Suspense>
          )}

          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={12} md={6}>
              <AdminPanel title="Top owners by portfolio rent" contentSx={{ py: 1 }}>
                <List disablePadding>
                  {(analytics.top_performers ?? []).map((owner, index) => (
                    <React.Fragment key={owner.ownerId}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 28, height: 28, fontSize: '0.75rem' }}>
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={owner.ownerName}
                          secondary={`${owner.properties} properties · ${formatMoney(owner.revenue, currency)}/mo`}
                        />
                      </ListItem>
                      {index < (analytics.top_performers?.length ?? 0) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </AdminPanel>
            </Grid>

            <Grid item xs={12} md={6}>
              <AdminPanel title="Property performance" contentSx={{ py: 1 }}>
                <List disablePadding>
                  {(analytics.property_performance ?? []).slice(0, 5).map((property) => (
                    <React.Fragment key={property.id}>
                      <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                        <ListItemText
                          primary={property.name}
                          secondary={
                            <Box component="span" sx={{ display: 'block' }}>
                              <Typography variant="caption" display="block">
                                Rent potential: {formatMoney(property.revenue, currency)}/mo
                              </Typography>
                              <Typography variant="caption" display="block">
                                {property.units} units · {property.occupied} occupied ({property.occupancy}%)
                              </Typography>
                              <LinearProgress variant="determinate" value={property.occupancy} sx={{ mt: 0.5, height: 4, borderRadius: 2 }} />
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </AdminPanel>
            </Grid>
          </Grid>

          <DataTable
            columns={revenueColumns}
            rows={revenueByOwner}
            getRowId={(row) => row.ownerId}
            title="Portfolio rent by owner"
            subtitle="Landlord rent inventory — not platform revenue"
            emptyTitle="No owner data"
            emptyDescription="Owner metrics appear once landlords register properties."
            emptyIcon={PieChartIcon}
            searchPlaceholder="Search by owner name…"
          />
        </>
      )}
    </AdminPage>
  );
};

export default AdminAnalytics;
