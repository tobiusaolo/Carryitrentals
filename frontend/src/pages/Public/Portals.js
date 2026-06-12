import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
} from '@mui/material';
import {
  AdminPanelSettings,
  Business,
  PersonPin,
  Home,
} from '@mui/icons-material';
import PublicHeader from '../../components/Navigation/PublicHeader';
import Footer from '../../components/Footer';
import { colors } from '../../theme/designTokens';

const portals = [
  {
    title: 'Property owner',
    description: 'Manage properties, tenants, rent, viewings, and short stays.',
    path: '/owner-login',
    register: '/owner-register',
    icon: <Business sx={{ fontSize: 40, color: '#667eea' }} />,
    chip: 'Email + password',
  },
  {
    title: 'Admin',
    description: 'Platform operations: listings, agents, payments, inspections.',
    path: '/admin-login',
    icon: <AdminPanelSettings sx={{ fontSize: 40, color: '#222' }} />,
    chip: 'Admin account only',
  },
  {
    title: 'Agent',
    description: 'List units, manage assigned rentals and inspections.',
    path: '/agent-login',
    icon: <PersonPin sx={{ fontSize: 40, color: '#10b981' }} />,
    chip: 'Phone number',
  },
  {
    title: 'Public rentals',
    description: 'Browse homes and short stays — no account required.',
    path: '/rentals',
    icon: <Home sx={{ fontSize: 40, color: colors.brand }} />,
    chip: 'No login',
  },
];

const Portals = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      <Container maxWidth="md" sx={{ py: 6, flex: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Choose your portal
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          CarryIT has separate sign-in pages for owners, admins, and agents. Use the card that matches your role.
        </Typography>
        <Grid container spacing={3}>
          {portals.map((p) => (
            <Grid item xs={12} sm={6} key={p.title}>
              <Card elevation={0} sx={{ border: `1px solid ${colors.border}`, borderRadius: 3, height: '100%' }}>
                <CardActionArea onClick={() => navigate(p.path)} sx={{ height: '100%', alignItems: 'stretch' }}>
                  <CardContent sx={{ p: 3 }}>
                    {p.icon}
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 2, mb: 1 }}>
                      {p.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {p.description}
                    </Typography>
                    <Chip label={p.chip} size="small" variant="outlined" />
                    {p.register && (
                      <Typography variant="caption" display="block" sx={{ mt: 2, color: colors.textMuted }}>
                        New owner? Register at {p.register}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          Direct links:{' '}
          <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace' }}>
            /portals · /owner-login · /admin-login · /agent-login
          </Typography>
        </Typography>
      </Container>
      <Footer />
    </Box>
  );
};

export default Portals;
