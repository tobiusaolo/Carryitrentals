import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  alpha,
} from '@mui/material';
import {
  CheckCircle,
  Payment,
  Refresh,
  ReceiptLong,
  AccountBalanceWallet,
  Verified,
  HomeWork,
  Schedule,
  InfoOutlined,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import PageHeader from '../../components/UI/PageHeader';
import OwnerPageContainer from '../../components/Owner/OwnerPageContainer';
import OwnerStatStrip from '../../components/Owner/OwnerStatStrip';
import OwnerStatusChip from '../../components/Owner/OwnerStatusChip';
import { useRegisterPageMeta } from '../../contexts/PageMetaContext';
import { subscriptionAPI, walletAPI } from '../../services/api/subscriptionAPI';
import { formatMoney } from '../../utils/formatMoney';
import {
  colors,
  layout,
  ownerPrimaryButtonSx,
  portalOutlinedButtonSx,
} from '../../theme/designTokens';

const POPULAR_SLUG = 'pro';

const PLAN_FEATURES = (plan) => [
  `Up to ${plan.max_properties} propert${plan.max_properties === 1 ? 'y' : 'ies'}`,
  `${plan.max_rental_listings} marketplace listing${plan.max_rental_listings === 1 ? '' : 's'}`,
  plan.airbnb_enabled ? 'Short-stay (Airbnb) module' : 'Long-term rentals only',
  'CarryIT Verified badge eligible',
  'Viewing fee collection',
];

function PlanCard({ plan, subscription, paying, onSubscribe }) {
  const isCurrent = subscription?.plan?.slug === plan.slug && subscription?.is_active;
  const isPopular = plan.slug === POPULAR_SLUG;

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: `${layout.radius.lg}px`,
        border: `1px solid ${isCurrent ? colors.brand : isPopular ? alpha(colors.brand, 0.35) : colors.border}`,
        bgcolor: isCurrent ? alpha(colors.brand, 0.04) : colors.surface,
        boxShadow: isPopular ? `0 8px 24px ${alpha(colors.brand, 0.08)}` : '0 1px 3px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: isCurrent ? colors.brand : colors.borderStrong,
        },
      }}
    >
      {isPopular && !isCurrent && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            px: 1,
            py: 0.25,
            borderRadius: `${layout.radius.sm}px`,
            bgcolor: colors.brand,
            color: '#fff',
            fontSize: '0.625rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Popular
        </Box>
      )}
      {isCurrent && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            bgcolor: colors.brand,
          }}
        />
      )}

      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.text, fontSize: '1.125rem' }}>
            {plan.name}
          </Typography>
          {isCurrent && (
            <OwnerStatusChip status="active" label="Current plan" />
          )}
        </Stack>

        <Typography variant="body2" sx={{ color: colors.textMuted, mb: 2, minHeight: 40 }}>
          {plan.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography
            component="span"
            sx={{ fontWeight: 800, fontSize: '1.75rem', color: colors.text, letterSpacing: '-0.02em' }}
          >
            {formatMoney(plan.price_monthly, plan.currency)}
          </Typography>
          <Typography component="span" sx={{ color: colors.textMuted, fontSize: '0.875rem', ml: 0.5 }}>
            / month
          </Typography>
        </Box>

        <Stack spacing={1.25} sx={{ mb: 2.5, flex: 1 }}>
          {PLAN_FEATURES(plan).map((feature) => (
            <Stack key={feature} direction="row" spacing={1} alignItems="flex-start">
              <CheckCircle sx={{ fontSize: 16, color: colors.success, mt: 0.15, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: colors.text, fontSize: '0.8125rem', lineHeight: 1.45 }}>
                {feature}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Button
          fullWidth
          variant={isCurrent ? 'outlined' : 'contained'}
          startIcon={isCurrent ? <Verified /> : <Payment />}
          disabled={isCurrent || paying === plan.slug}
          onClick={() => onSubscribe(plan.slug)}
          sx={isCurrent ? portalOutlinedButtonSx : ownerPrimaryButtonSx}
        >
          {isCurrent ? 'Active on this plan' : paying === plan.slug ? 'Redirecting to Pesapal…' : 'Subscribe with Pesapal'}
        </Button>
      </Box>
    </Paper>
  );
}

const OwnerBilling = () => {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useRegisterPageMeta({
    title: 'Billing & subscription',
    subtitle: 'Your plan and Airbnb wallet',
  });

  const load = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [plansRes, subRes, walletRes] = await Promise.all([
        subscriptionAPI.getPlans(),
        subscriptionAPI.getMySubscription(),
        walletAPI.getMyWallet(),
      ]);

      setPlans(plansRes.data || []);
      setSubscription(subRes.data);
      setWallet(walletRes.data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not load billing');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const params = new URLSearchParams(window.location.search);
    if (params.get('pesapal') === '1') {
      setMessage('Payment received — your subscription is updating.');
      load(true);
    }
  }, [load]);

  const payPlan = async (slug) => {
    try {
      setPaying(slug);
      setError(null);
      const { data } = await subscriptionAPI.subscribePesapal(slug);
      if (data.redirect_url) window.location.href = data.redirect_url;
      else setError('Could not start checkout');
    } catch (e) {
      setError(typeof e.response?.data?.detail === 'string' ? e.response.data.detail : 'Checkout failed');
    } finally {
      setPaying('');
    }
  };

  const periodEndLabel = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  if (loading) {
    return (
      <OwnerPageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: colors.brand }} />
        </Box>
      </OwnerPageContainer>
    );
  }

  return (
    <OwnerPageContainer>
      <PageHeader
        action={
          <Button
            startIcon={<Refresh />}
            onClick={() => load(true)}
            variant="outlined"
            size="small"
            sx={portalOutlinedButtonSx}
            disabled={refreshing}
          >
            Refresh
          </Button>
        }
      />

      {refreshing && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
      {message && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: `${layout.radius.sm}px` }} onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: `${layout.radius.sm}px` }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Alert
        severity="info"
        sx={{ mb: 3, borderRadius: `${layout.radius.sm}px` }}
        action={
          <Button
            color="inherit"
            size="small"
            component={RouterLink}
            to="/owner/property-hub?tab=payments"
          >
            Review proofs
          </Button>
        }
      >
        Tenant rent proof approvals live under <strong>Property hub → Payments</strong>. Approve manual proofs there
        when tenants pay outside Pesapal.
      </Alert>

      <OwnerStatStrip
        sx={{ mb: 3 }}
        stats={[
          {
            variantIndex: 0,
            icon: <ReceiptLong />,
            title: 'Current plan',
            value: subscription?.is_active ? subscription.plan?.name || 'Active' : 'None',
            subtitle: subscription?.is_active
              ? `${subscription.status || 'active'} · renews ${periodEndLabel}`
              : 'Choose a plan below to publish listings',
          },
          {
            variantIndex: 1,
            icon: <Schedule />,
            title: 'Days remaining',
            value: subscription?.is_active ? String(subscription.days_remaining ?? 0) : '—',
            subtitle: subscription?.is_active ? 'On your billing period' : 'Subscribe to unlock features',
          },
          {
            variantIndex: 2,
            icon: <AccountBalanceWallet />,
            title: 'Airbnb wallet',
            value: formatMoney(wallet?.balance ?? 0, wallet?.currency || 'UGX'),
            subtitle: 'Short-stay payouts after platform fee',
          },
        ]}
      />

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 2,
          borderRadius: `${layout.radius.md}px`,
          border: `1px solid ${colors.border}`,
          bgcolor: alpha(colors.brand, 0.04),
          display: 'flex',
          gap: 1.5,
          alignItems: 'flex-start',
        }}
      >
        <InfoOutlined sx={{ color: colors.brand, fontSize: 20, mt: 0.15 }} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text, mb: 0.5 }}>
            How billing works on CarryIT
          </Typography>
          <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', lineHeight: 1.5 }}>
            Your subscription unlocks listings, viewings, and optional short stays. Tenant rent is paid directly to
            you — it never mixes with your Airbnb wallet or platform subscription.
          </Typography>
        </Box>
      </Paper>

      {!subscription?.is_active && (
        <Alert
          severity="warning"
          sx={{ mb: 3, borderRadius: `${layout.radius.sm}px` }}
          icon={<HomeWork />}
        >
          No active subscription — pick a plan to keep listings live and access owner tools.
        </Alert>
      )}

      <Typography
        variant="overline"
        sx={{
          display: 'block',
          color: colors.textMuted,
          fontWeight: 700,
          letterSpacing: '0.08em',
          mb: 2,
        }}
      >
        Subscription plans
      </Typography>

      <Grid container spacing={2}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <PlanCard
              plan={plan}
              subscription={subscription}
              paying={paying}
              onSubscribe={payPlan}
            />
          </Grid>
        ))}
      </Grid>
    </OwnerPageContainer>
  );
};

export default OwnerBilling;
