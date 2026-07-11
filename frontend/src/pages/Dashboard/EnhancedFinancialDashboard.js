import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  People,
  Home,
  CheckCircle,
  Cancel,
  FastForward,
  ExpandMore,
  Send as SendIcon,
  Visibility as ViewIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { useCachedQuery } from '../../hooks/useCachedQuery';
import CriticalAlerts from '../../components/UI/CriticalAlerts';
import OwnerStatCard from '../../components/Owner/OwnerStatCard';
import OwnerStatStrip from '../../components/Owner/OwnerStatStrip';
import OwnerPage from '../../components/Owner/OwnerPage';
import StatusBadge from '../../components/UI/StatusBadge';
import QuickActionButton from '../../components/UI/QuickActionButton';
import DataTable from '../../components/UI/DataTable';
import { DashboardSkeleton } from '../../components/UI/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';
import { formatMoney } from '../../utils/formatMoney';
import { colors, getOwnerStatColor } from '../../theme/designTokens';
import { useRegisterPageMeta } from '../../contexts/PageMetaContext';
import useOwnerSoftRefresh from '../../hooks/useOwnerSoftRefresh';

const EnhancedFinancialDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    data: financialData,
    loading,
    error,
    refresh: loadFinancialData,
  } = useCachedQuery('/analytics/owner-financial-summary');

  const { data: arrearsData } = useCachedQuery('/owner-portfolio/arrears');

  const [criticalAlerts, setCriticalAlerts] = useState([]);

  useRegisterPageMeta({
    title: 'Dashboard',
    subtitle: user?.first_name
      ? `Welcome, ${user.first_name}${financialData?.current_month ? ` · ${financialData.current_month}` : ''}`
      : "What's happening with your properties today.",
  });

  useEffect(() => {
    if (financialData && financialData.overall) {
      generateCriticalAlerts();
    }
  }, [financialData, arrearsData]);

  useOwnerSoftRefresh(loadFinancialData);

  const generateCriticalAlerts = () => {
    const alerts = [];
    const { overall, income_streams: streams } = financialData;
    const currency = streams?.display_currency || arrearsData?.currency || 'UGX';

    if (streams?.viewing_fees?.pending_bookings > 0) {
      alerts.push({
        type: 'pending',
        title: `${streams.viewing_fees.pending_bookings} Viewing request${streams.viewing_fees.pending_bookings !== 1 ? 's' : ''}`,
        message: 'Guests booked a tour on your rental listings — review and confirm after payment.',
        actions: [
          { label: 'View bookings', key: 'view_viewings', icon: <ViewIcon /> },
        ],
      });
    }

    const overdueTenants = arrearsData?.overdue_tenants ?? [];
    const totalArrears = Number(arrearsData?.total_balance_due ?? 0);
    if (overdueTenants.length > 0) {
      alerts.push({
        type: 'overdue',
        title: `${overdueTenants.length} in arrears`,
        message: `${formatMoney(totalArrears, currency)} outstanding across your portfolio.`,
        amount: totalArrears,
        count: overdueTenants.length,
        actions: [
          { label: 'View tenants', key: 'view_arrears', icon: <ViewIcon /> },
        ],
      });
    } else if (overall.tenants_unpaid > 0 && overall.remaining_to_collect > 0) {
      alerts.push({
        type: 'overdue',
        title: `${overall.tenants_unpaid} Unpaid Payments`,
        message: `${overall.tenants_unpaid} tenant${overall.tenants_unpaid !== 1 ? 's have' : ' has'} rent due (move-in and due dates respected).`,
        amount: overall.remaining_to_collect,
        count: overall.tenants_unpaid,
        actions: [
          { label: 'Remind All', key: 'send_reminder', icon: <SendIcon /> },
          { label: 'Review', key: 'view_arrears', icon: <ViewIcon /> },
        ],
      });
    }

    setCriticalAlerts(alerts);
  };

  const handleAlertAction = (alertType, actionKey) => {
    switch (actionKey) {
      case 'send_reminder':
        navigate('/owner/communications');
        break;
      case 'view_details':
      case 'view_payments':
        navigate('/owner/property-hub?tab=payments');
        break;
      case 'view_arrears':
        navigate('/owner/property-hub?tab=tenants');
        break;
      case 'view_viewings':
        navigate('/owner/viewings');
        break;
      case 'view_units':
        navigate('/owner/units');
        break;
      default:
        break;
    }
  };

  if (loading && !financialData) return <OwnerPage><DashboardSkeleton /></OwnerPage>;
  if (error) return <OwnerPage><Alert severity="error">{error}</Alert></OwnerPage>;
  if (!financialData || !financialData.overall) {
    return <OwnerPage><Alert severity="info">No dashboard data available</Alert></OwnerPage>;
  }

  const { overall, properties, current_month, income_streams: streams } = financialData;
  const currency = streams?.display_currency || 'UGX';

  return (
    <OwnerPage disableMaxWidth sx={{ pb: 4 }}>
      <Box sx={{ pb: 4 }}>
        {criticalAlerts.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <CriticalAlerts alerts={criticalAlerts} onAction={handleAlertAction} />
          </Box>
        )}

        {streams && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 800, color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney sx={{ color: colors.brand }} /> Income this month (all sources)
            </Typography>
            <OwnerStatStrip
              sx={{ mb: 4 }}
              stats={[
                {
                  title: 'Tenant rent collected',
                  value: formatMoney(streams.rent?.amount, streams.rent?.currency || currency),
                  subtitle: streams.rent?.label,
                  icon: <AttachMoney />,
                  color: getOwnerStatColor(0),
                },
                {
                  title: 'Viewing fees',
                  value: formatMoney(streams.viewing_fees?.amount, streams.viewing_fees?.currency || currency),
                  subtitle: streams.viewing_fees?.pending_bookings
                    ? `${streams.viewing_fees.pending_bookings} pending booking(s)`
                    : 'Paid upfront (60%)',
                  icon: <PaymentIcon />,
                  color: getOwnerStatColor(1),
                  onClick: () => navigate('/owner/viewing-payments'),
                },
                {
                  title: 'Short stays',
                  value: formatMoney(streams.airbnb?.amount, streams.airbnb?.currency || currency),
                  subtitle: streams.airbnb?.confirmed_count
                    ? `${streams.airbnb.confirmed_count} confirmed booking(s)`
                    : 'Airbnb / short stays',
                  icon: <Home />,
                  color: getOwnerStatColor(2),
                  onClick: () => navigate('/owner/airbnb'),
                },
                {
                  title: 'Estimated total',
                  value: formatMoney(streams.total_estimated?.amount, streams.total_estimated?.currency || currency),
                  subtitle: streams.total_estimated?.note || 'Combined estimate',
                  icon: <TrendingUp />,
                  color: getOwnerStatColor(0),
                },
              ]}
            />
          </>
        )}

        <Typography variant="h6" sx={{ fontWeight: 800, color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachMoney sx={{ color: colors.brand }} /> Tenant rent (properties)
        </Typography>
        <OwnerStatStrip
          sx={{ mb: 6 }}
          stats={[
            {
              title: 'Expected Revenue',
              value: formatMoney(overall.expected_monthly_revenue, currency),
              subtitle: 'Current billing cycle',
              icon: <AttachMoney />,
              color: getOwnerStatColor(0),
            },
            {
              title: 'Collected',
              value: formatMoney(overall.current_month_collected, currency),
              subtitle: 'Payments confirmed',
              icon: <CheckCircle />,
              color: getOwnerStatColor(1),
            },
            {
              title: 'Outstanding',
              value: formatMoney(overall.remaining_to_collect, currency),
              subtitle: 'Pending collection',
              icon: <TrendingUp />,
              color: getOwnerStatColor(2),
            },
            {
              title: 'Collection Rate',
              value: `${overall.collection_rate.toFixed(1)}%`,
              subtitle: 'Performance target: 95%',
              icon: <TrendingUp />,
              color: getOwnerStatColor(0),
            },
          ]}
        />

        {/* Occupancy & Tenants */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Home sx={{ color: colors.brand }} /> Portfolio Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <OwnerStatCard
                  title="Total Units"
                  value={overall.total_units}
                  icon={<Home />}
                  color={getOwnerStatColor(3)}
                />
              </Grid>
              <Grid item xs={6}>
                <OwnerStatCard
                  title="Occupancy"
                  value={`${overall.occupancy_rate.toFixed(1)}%`}
                  icon={<People />}
                  color={getOwnerStatColor(1)}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <People sx={{ color: colors.brand }} /> Tenant Activity
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <OwnerStatCard
                  title="Paid Ahead"
                  value={overall.tenants_paid_ahead}
                  icon={<FastForward />}
                  color={getOwnerStatColor(2)}
                />
              </Grid>
              <Grid item xs={6}>
                <OwnerStatCard
                  title="Unpaid"
                  value={overall.tenants_unpaid}
                  icon={<Cancel />}
                  color={colors.error}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Property Detailed Breakdown */}
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#222', mb: 2 }}>
          Property Breakdown
        </Typography>
        
        {properties.map((property) => (
          <Accordion 
            key={property.property_id} 
            elevation={0}
            sx={{ 
              mb: 2, 
              borderRadius: '16px !important', 
              border: '1px solid #EEE',
              '&:before': { display: 'none' },
              overflow: 'hidden'
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                <Box sx={{ bgcolor: '#F7F7F7', p: 1, borderRadius: '12px' }}>
                  <Home sx={{ color: '#667eea' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#222' }}>
                    {property.property_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {property.occupied_units}/{property.total_units} Units Occupied • {property.collection_rate.toFixed(0)}% Collected
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', mr: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#667eea' }}>
                    {formatMoney(property.current_month_collected, currency)}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 4, bgcolor: '#FAFAFA' }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #EEE' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Collection Progress</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Collected</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>
                        {formatMoney(property.current_month_collected, currency)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Remaining</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#ef4444' }}>
                        {formatMoney(property.remaining_to_collect, currency)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={property.collection_rate}
                      sx={{ height: 8, borderRadius: 4, bgcolor: '#EEE', '& .MuiLinearProgress-bar': { bgcolor: '#667eea' } }}
                    />
                  </Paper>
                </Grid>
                
                {property.tenants_unpaid_list.length > 0 && (
                  <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #EEE' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#ef4444' }}>Unpaid Tenants</Typography>
                    <DataTable
                      title="Unpaid tenants"
                      dense
                      maxHeight={320}
                      stickyHeader={false}
                      columns={[
                        { id: 'name', label: 'Tenant', render: (tenant) => tenant.name },
                        {
                          id: 'remaining',
                          label: 'Remaining',
                          align: 'right',
                          render: (tenant) => (
                            <Typography component="span" sx={{ fontWeight: 700, color: colors.text }}>
                              {formatMoney(tenant.remaining, currency)}
                            </Typography>
                          ),
                        },
                        {
                          id: 'actions',
                          label: 'Actions',
                          align: 'center',
                          render: () => (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <QuickActionButton
                                icon={<SendIcon sx={{ fontSize: 18 }} />}
                                tooltip="Remind"
                                onClick={() => navigate('/owner/communications')}
                                color="primary"
                              />
                              <QuickActionButton
                                icon={<PaymentIcon sx={{ fontSize: 18 }} />}
                                tooltip="Record"
                                onClick={() => navigate('/owner/property-hub?tab=payments')}
                                color="primary"
                              />
                            </Box>
                          ),
                        },
                      ]}
                      rows={property.tenants_unpaid_list}
                      pageSize={5}
                      pageSizeOptions={[5, 10]}
                    />
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </OwnerPage>
  );
};

export default EnhancedFinancialDashboard;
