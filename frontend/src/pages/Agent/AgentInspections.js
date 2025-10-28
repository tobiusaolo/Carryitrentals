import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Schedule,
  AttachMoney,
  CalendarToday,
  Home,
  Person
} from '@mui/icons-material';
import StatusBadge from '../../components/UI/StatusBadge';
import EmptyState from '../../components/UI/EmptyState';
import { TableSkeleton } from '../../components/UI/LoadingSkeleton';
import api from '../../services/api/api';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const AgentInspections = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inspections/bookings/');
      setInspections(response.data);
    } catch (err) {
      console.error('Error loading inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterInspections = (status) => {
    if (!status) return inspections;
    return inspections.filter(i => i.status === status);
  };

  const calculateEarnings = (status) => {
    return filterInspections(status).reduce((sum, i) => sum + (i.amount || 0), 0);
  };

  const approvedInspections = filterInspections('approved');
  const pendingInspections = filterInspections('pending');
  const completedInspections = filterInspections('completed');

  const renderInspectionCard = (inspection) => (
    <Card
      key={inspection.id}
      sx={{
        mb: 2,
        borderRadius: 3,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {inspection.unit_type || 'Rental Unit'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {inspection.location || 'Location not specified'}
            </Typography>
          </Box>
          <StatusBadge status={inspection.status} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday fontSize="small" color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Booked
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {new Date(inspection.booking_date).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person fontSize="small" color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Client
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {inspection.client_name || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: inspection.status === 'approved' ? 'success.50' : 'grey.100',
                p: 2,
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney color={inspection.status === 'approved' ? 'success' : 'action'} />
                <Typography variant="caption" color="text.secondary">
                  Inspection Fee
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight="bold" color={inspection.status === 'approved' ? 'success.main' : 'text.primary'}>
                ${(inspection.amount || 0).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <TableSkeleton rows={4} columns={1} />;
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
        My Inspections
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {inspections.length} total inspection{inspections.length !== 1 ? 's' : ''}
      </Typography>

      {/* Earnings Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white'
            }}
          >
            <AttachMoney sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold">
              ${calculateEarnings('approved').toLocaleString()}
            </Typography>
            <Typography variant="caption">
              Approved Earnings
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white'
            }}
          >
            <Schedule sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold">
              ${calculateEarnings('pending').toLocaleString()}
            </Typography>
            <Typography variant="caption">
              Pending Approval
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label={`All (${inspections.length})`} />
        <Tab label={`Approved (${approvedInspections.length})`} />
        <Tab label={`Pending (${pendingInspections.length})`} />
      </Tabs>

      {/* Inspection Lists */}
      <TabPanel value={selectedTab} index={0}>
        {inspections.length === 0 ? (
          <EmptyState
            type="messages"
            title="No Inspections Yet"
            message="Inspection bookings will appear here when tenants book to view your rental units"
          />
        ) : (
          inspections.map(renderInspectionCard)
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        {approvedInspections.length === 0 ? (
          <EmptyState
            title="No Approved Inspections"
            message="Approved inspections will appear here"
          />
        ) : (
          approvedInspections.map(renderInspectionCard)
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        {pendingInspections.length === 0 ? (
          <EmptyState
            title="No Pending Inspections"
            message="Inspections awaiting approval will appear here"
          />
        ) : (
          pendingInspections.map(renderInspectionCard)
        )}
      </TabPanel>
    </Box>
  );
};

export default AgentInspections;

