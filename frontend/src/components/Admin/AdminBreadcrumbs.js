import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/designTokens';
import { getAdminBreadcrumb } from '../../constants/adminNav';

export default function AdminBreadcrumbs({ pathname, pageTitle }) {
  const navigate = useNavigate();
  const crumb = getAdminBreadcrumb(pathname);

  if (!crumb) return null;

  return (
    <Breadcrumbs
      separator={<NavigateNext sx={{ fontSize: 14, color: colors.textMuted }} />}
      sx={{ mb: 0.25, '& .MuiBreadcrumbs-li': { lineHeight: 1 } }}
    >
      <Link
        component="button"
        type="button"
        underline="hover"
        onClick={() => navigate('/admin')}
        sx={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          p: 0,
          fontSize: '0.625rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: colors.textMuted,
        }}
      >
        {crumb.section}
      </Link>
      <Typography
        variant="caption"
        sx={{
          color: colors.textMuted,
          fontSize: '0.625rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {pageTitle || crumb.page}
      </Typography>
    </Breadcrumbs>
  );
}
