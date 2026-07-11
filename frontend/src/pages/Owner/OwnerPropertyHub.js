import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Paper, Tab, Tabs, Typography } from '@mui/material';
import {
  Home,
  Apartment,
  Storefront,
  Bed,
  Group,
  AccountBalanceWallet,
} from '@mui/icons-material';
import Properties from '../Properties/Properties';
import Units from '../Units/Units';
import UnitsForRent from '../UnitsForRent/UnitsForRent';
import OwnerAirbnb from '../Airbnb/OwnerAirbnb';
import Tenants from '../Tenants/Tenants';
import Payments from '../Payments/Payments';
import { colors } from '../../theme/designTokens';

const TABS = [
  { key: 'properties', label: 'Properties', icon: <Home fontSize="small" />, hint: 'Buildings & sites you own' },
  { key: 'units', label: 'Units', icon: <Apartment fontSize="small" />, hint: 'Rooms & spaces inside properties' },
  { key: 'units-for-rent', label: 'Units for rent', icon: <Storefront fontSize="small" />, hint: 'Long-term marketplace listings' },
  { key: 'airbnb', label: 'Short stays', icon: <Bed fontSize="small" />, hint: 'Nightly Airbnb-style listings' },
  { key: 'tenants', label: 'Tenants', icon: <Group fontSize="small" />, hint: 'People renting your units — leases & payments' },
  { key: 'payments', label: 'Payments', icon: <AccountBalanceWallet fontSize="small" />, hint: 'Rent collections, pending proofs & payment history' },
];

const OwnerPropertyHub = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabKey = searchParams.get('tab') || 'properties';

  const activeIndex = useMemo(() => {
    const idx = TABS.findIndex((t) => t.key === tabKey);
    return idx >= 0 ? idx : 0;
  }, [tabKey]);

  useEffect(() => {
    if (!TABS.some((t) => t.key === tabKey)) {
      setSearchParams({ tab: 'properties' }, { replace: true });
    }
  }, [tabKey, setSearchParams]);

  const handleTabChange = (_, index) => {
    const next = TABS[index]?.key || 'properties';
    setSearchParams({ tab: next });
  };

  const activeTab = TABS[activeIndex];

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${colors.border}`,
          position: 'sticky',
          top: 64,
          zIndex: 10,
          bgcolor: colors.surface,
        }}
      >
        <Tabs
          value={activeIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            minHeight: 48,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 },
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.key} icon={tab.icon} iconPosition="start" label={tab.label} />
          ))}
        </Tabs>
        {activeTab && (
          <Typography variant="caption" sx={{ display: 'block', px: 2, pb: 1.5, color: colors.textMuted }}>
            {activeTab.hint}
          </Typography>
        )}
      </Paper>

      <Box key={activeTab?.key}>
        {activeTab?.key === 'properties' && <Properties />}
        {activeTab?.key === 'units' && <Units />}
        {activeTab?.key === 'units-for-rent' && <UnitsForRent />}
        {activeTab?.key === 'airbnb' && <OwnerAirbnb />}
        {activeTab?.key === 'tenants' && <Tenants />}
        {activeTab?.key === 'payments' && <Payments />}
      </Box>
    </Box>
  );
};

export default OwnerPropertyHub;
