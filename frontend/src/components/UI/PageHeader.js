import React, { useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { adminPrimaryButtonSx, ownerPrimaryButtonSx } from '../../theme/designTokens';
import { usePageMeta } from '../../contexts/PageMetaContext';

/**
 * Registers page title in the top nav; renders action row in the body only.
 */
const PageHeader = ({
  title,
  meta,
  subtitle,
  action,
  actionLabel,
  onAction,
  children,
  dense = false,
  variant = 'owner',
}) => {
  const { setPageMeta } = usePageMeta();
  const primarySx = variant === 'admin' ? adminPrimaryButtonSx : ownerPrimaryButtonSx;

  useEffect(() => {
    if (title) {
      setPageMeta({ title, subtitle, meta });
    }
    return () => setPageMeta(null);
  }, [title, subtitle, meta, setPageMeta]);

  const hasActions = Boolean(action || children || (actionLabel && onAction));
  if (!hasActions) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 1,
        mb: dense ? 1.5 : 2,
      }}
    >
      {children}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={primarySx}>
          {actionLabel}
        </Button>
      )}
      {action}
    </Box>
  );
};

export default PageHeader;
