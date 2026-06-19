import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
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
import DataTable from '../../components/UI/DataTable';
import OwnerStatusChip from '../../components/Owner/OwnerStatusChip';
import { formatMoney } from '../../utils/formatMoney';
import adminAPI from '../../services/api/adminAPI';

const AdminAnalytics = () => {
  const { user } = useSelector(state => state.auth);
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
  }, [user, loadAnalytics]);

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>{icon}</Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="div">{value}</Typography>
            <Typography color="text.secondary" variant="body2">{title}</Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
            )}
          </Box>
          {trend != null && trend !== 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {trend > 0 ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
              <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const currency = analytics?.currency || 'UGX';
  const totalPortfolio = analytics?.portfolio_monthly_rent ?? 0;
  const revenueByOwner = analytics?.revenue_by_owner ?? [];

  const revenueColumns = [
    {
      id: 'ownerName',
      label: 'Owner',
      getSearchValue: (row) => row.ownerName,
      render: (owner) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>{owner.ownerName.charAt(0)}</Avatar>
          {owner.ownerName}
        </Box>
      ),
    },
    {
      id: 'properties',
      label: 'Properties',
      render: (owner) => owner.properties,
    },
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LinearProgress variant="determinate" value={marketShare} sx={{ width: 100, mr: 1 }} />
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
        return <OwnerStatusChip status={label.toLowerCase()} label={label} />;
      },
    },
  ];

  if (user?.role !== 'admin') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>You need admin privileges to access this page.</Typography>
        </Alert>
      </Box>
    );
  }

  if (loading && !analytics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        System Analytics
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Live portfolio metrics and platform revenue from your database.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {analytics && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Platform MRR"
                value={formatMoney(analytics.mrr?.amount ?? 0, currency)}
                icon={<SubscriptionsIcon />}
                color="success.main"
                subtitle={`${analytics.mrr?.active_subscribers ?? 0} subscribed landlords`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Occupancy rate"
                value={`${analytics.occupancy_rate ?? 0}%`}
                icon={<PeopleIcon />}
                color="info.main"
                subtitle="Units occupied"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Properties"
                value={analytics.total_properties ?? 0}
                icon={<HomeIcon />}
                color="primary.main"
                subtitle="On platform"
                trend={analytics.portfolio_growth_week_pct}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Platform revenue (MTD)"
                value={formatMoney(analytics.platform_revenue_mtd ?? 0, currency)}
                icon={<MoneyIcon />}
                color="warning.main"
                subtitle="Subscriptions, viewing fees, Airbnb fees"
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mb: 3 }}>
            Portfolio rent totals ({formatMoney(totalPortfolio, currency)}/mo) reflect landlord
            inventory — not CarryIT platform revenue. See Platform revenue for subscription income.
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Top owners by portfolio rent
                  </Typography>
                  <List>
                    {(analytics.top_performers ?? []).map((owner, index) => (
                      <React.Fragment key={owner.ownerId}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>{index + 1}</Avatar>
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
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Property performance
                  </Typography>
                  <List>
                    {(analytics.property_performance ?? []).slice(0, 5).map((property) => (
                      <React.Fragment key={property.id}>
                        <ListItem>
                          <ListItemText
                            primary={property.name}
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  Rent potential: {formatMoney(property.revenue, currency)}/mo
                                </Typography>
                                <Typography variant="body2">
                                  Units: {property.units} · Occupied: {property.occupied} ({property.occupancy}%)
                                </Typography>
                                <LinearProgress variant="determinate" value={property.occupancy} sx={{ mt: 1 }} />
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
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
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default AdminAnalytics;
