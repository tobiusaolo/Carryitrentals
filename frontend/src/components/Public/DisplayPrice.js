import React from 'react';
import { Box, Typography } from '@mui/material';
import { useViewerCurrencyOptional } from '../../contexts/ViewerCurrencyContext';

/**
 * Shows price in viewer's currency; shows listing currency as secondary when different.
 */
const DisplayPrice = ({
  amount,
  listingCurrency = 'UGX',
  period,
  variant = 'body1',
  fontWeight = 800,
  showSecondary = true,
  component = 'span',
}) => {
  const { formatMoney } = useViewerCurrencyOptional();
  const { primary, secondary, sameCurrency } = formatMoney(amount, listingCurrency);

  return (
    <Box component={component} sx={{ display: 'inline' }}>
      <Typography
        component="span"
        variant={variant}
        sx={{ fontWeight, color: 'inherit' }}
      >
        {primary}
        {period && (
          <Typography component="span" variant={variant} sx={{ fontWeight: 400, ml: 0.5 }}>
            {period}
          </Typography>
        )}
      </Typography>
      {showSecondary && !sameCurrency && secondary && (
        <Typography
          component="span"
          variant="caption"
          sx={{ display: 'block', color: '#717171', fontWeight: 500, mt: 0.25 }}
        >
          Listed at {secondary}
        </Typography>
      )}
    </Box>
  );
};

export default DisplayPrice;
