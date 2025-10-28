import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api/api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Download,
  TrendingUp,
  TrendingDown,
  Home,
  Apartment,
  AttachMoney,
  People,
  CalendarToday,
  FilterList,
  Refresh,
  Assessment,
  BarChart,
  PieChart,
} from '@mui/icons-material';
// Removed complex date picker dependencies

const Analytics = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { properties } = useSelector((state) => state.properties);
  const { units } = useSelector((state) => state.units);
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dashboard Summary State
  const [dashboardSummary, setDashboardSummary] = useState(null);
  
  // Property Analytics State
  const [selectedProperty, setSelectedProperty] = useState('');
  const [propertyAnalytics, setPropertyAnalytics] = useState(null);
  
  // Payment Analytics State
  const [paymentFilters, setPaymentFilters] = useState({
    property_id: '',
    unit_id: '',
    start_date: null,
    end_date: null
  });
  const [paymentAnalytics, setPaymentAnalytics] = useState(null);
  
  // Monthly Report State
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  
  // Export Dialog State
  const [exportDialog, setExportDialog] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    export_type: 'all',
    property_id: '',
    unit_id: '',
    start_date: null,
    end_date: null
  });

  // Load dashboard summary on component mount
  useEffect(() => {
    loadDashboardSummary();
  }, []);

  const loadDashboardSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/dashboard-summary');
      setDashboardSummary(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load dashboard summary');
    } finally {
      setLoading(false);
    }
  };

  const loadPropertyAnalytics = async (propertyId) => {
    try {
      setLoading(true);
      const response = await api.get(`/analytics/property/${propertyId}`);
      setPropertyAnalytics(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load property analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (paymentFilters.property_id) params.append('property_id', paymentFilters.property_id);
      if (paymentFilters.unit_id) params.append('unit_id', paymentFilters.unit_id);
      if (paymentFilters.start_date) params.append('start_date', paymentFilters.start_date.toISOString().split('T')[0]);
      if (paymentFilters.end_date) params.append('end_date', paymentFilters.end_date.toISOString().split('T')[0]);
      
      const response = await api.get(`/analytics/payments?${params}`);
      setPaymentAnalytics(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load payment analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (paymentFilters.property_id) params.append('property_id', paymentFilters.property_id);
      
      const response = await api.get(`/analytics/monthly-report/${reportYear}/${reportMonth}?${params}`);
      setMonthlyReport(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load monthly report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      params.append('export_type', exportFilters.export_type);
      if (exportFilters.property_id) params.append('property_id', exportFilters.property_id);
      if (exportFilters.unit_id) params.append('unit_id', exportFilters.unit_id);
      if (exportFilters.start_date) params.append('start_date', exportFilters.start_date.toISOString().split('T')[0]);
      if (exportFilters.end_date) params.append('end_date', exportFilters.end_date.toISOString().split('T')[0]);
      
      const response = await api.get(`/analytics/export/excel?${params}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `rental_analytics_${exportFilters.export_type}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportDialog(false);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon />
        Analytics & Reports
      </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadDashboardSummary}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => setExportDialog(true)}
              sx={{ borderRadius: 2 }}
            >
              Export Excel
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </Alert>
        )}

        {/* Analytics Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
            <Tab icon={<Assessment />} label="Dashboard Summary" />
            <Tab icon={<Home />} label="Property Analytics" />
            <Tab icon={<AttachMoney />} label="Payment Analytics" />
            <Tab icon={<CalendarToday />} label="Monthly Reports" />
          </Tabs>
        </Paper>

        {/* Dashboard Summary Tab */}
        {activeTab === 0 && (
          <Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : dashboardSummary ? (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="textSecondary" gutterBottom>
                            Total Properties
                          </Typography>
                          <Typography variant="h4">
                            {dashboardSummary.total_properties}
                          </Typography>
                        </Box>
                        <Home color="primary" sx={{ fontSize: 40 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="textSecondary" gutterBottom>
                            Total Units
                          </Typography>
                          <Typography variant="h4">
                            {dashboardSummary.total_units}
                          </Typography>
                        </Box>
                        <Apartment color="info" sx={{ fontSize: 40 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="textSecondary" gutterBottom>
                            Occupancy Rate
                          </Typography>
                          <Typography variant="h4">
                            {formatPercentage(dashboardSummary.occupancy_rate)}
                          </Typography>
                        </Box>
                        <TrendingUp color="success" sx={{ fontSize: 40 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="textSecondary" gutterBottom>
                            Collection Rate
                          </Typography>
                          <Typography variant="h4">
                            {formatPercentage(dashboardSummary.collection_rate)}
                          </Typography>
                        </Box>
                        <AttachMoney color="secondary" sx={{ fontSize: 40 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Rent Collection Summary
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Total Monthly Rent:</Typography>
                        <Typography variant="h6">{formatCurrency(dashboardSummary.total_monthly_rent)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="success.main">Collected:</Typography>
                        <Typography color="success.main">{formatCurrency(dashboardSummary.collected_rent)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="warning.main">Pending:</Typography>
                        <Typography color="warning.main">{formatCurrency(dashboardSummary.pending_rent)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="error.main">Overdue:</Typography>
                        <Typography color="error.main">{formatCurrency(dashboardSummary.overdue_rent)}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Unit Status Summary
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Occupied Units:</Typography>
                        <Typography variant="h6">{dashboardSummary.occupied_units}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Available Units:</Typography>
                        <Typography variant="h6">{dashboardSummary.available_units}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Total Units:</Typography>
                        <Typography variant="h6">{dashboardSummary.total_units}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                No data available. Please check your properties and units.
              </Alert>
            )}
          </Box>
        )}

        {/* Property Analytics Tab */}
        {activeTab === 1 && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth sx={{ maxWidth: 400 }}>
                <InputLabel>Select Property</InputLabel>
                <Select
                  value={selectedProperty}
                  onChange={(e) => {
                    setSelectedProperty(e.target.value);
                    if (e.target.value) {
                      loadPropertyAnalytics(e.target.value);
                    }
                  }}
                  label="Select Property"
                >
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {propertyAnalytics && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {propertyAnalytics.property_name}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        {propertyAnalytics.property_address}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Total Units:</Typography>
                        <Typography variant="h6">{propertyAnalytics.total_units}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Occupied Units:</Typography>
                        <Typography variant="h6">{propertyAnalytics.occupied_units}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Available Units:</Typography>
                        <Typography variant="h6">{propertyAnalytics.available_units}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Occupancy Rate:</Typography>
                        <Typography variant="h6">{formatPercentage(propertyAnalytics.occupancy_rate)}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Financial Summary
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Total Monthly Rent:</Typography>
                        <Typography variant="h6">{formatCurrency(propertyAnalytics.total_monthly_rent)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="success.main">Collected:</Typography>
                        <Typography color="success.main">{formatCurrency(propertyAnalytics.collected_rent)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="warning.main">Pending:</Typography>
                        <Typography color="warning.main">{formatCurrency(propertyAnalytics.pending_rent)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="error.main">Overdue:</Typography>
                        <Typography color="error.main">{formatCurrency(propertyAnalytics.overdue_rent)}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Unit Details
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Unit Number</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Monthly Rent</TableCell>
                              <TableCell>Bedrooms</TableCell>
                              <TableCell>Bathrooms</TableCell>
                              <TableCell>Tenant</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {propertyAnalytics.units.map((unit) => (
                              <TableRow key={unit.unit_id}>
                                <TableCell>{unit.unit_number}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={unit.status}
                                    color={unit.status === 'occupied' ? 'success' : 'default'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>{formatCurrency(unit.monthly_rent)}</TableCell>
                                <TableCell>{unit.bedrooms}</TableCell>
                                <TableCell>{unit.bathrooms}</TableCell>
                                <TableCell>{unit.tenant_name || 'Available'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        )}

        {/* Payment Analytics Tab */}
        {activeTab === 2 && (
          <Box>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Filters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Property</InputLabel>
                    <Select
                      value={paymentFilters.property_id}
                      onChange={(e) => setPaymentFilters({ ...paymentFilters, property_id: e.target.value })}
                      label="Property"
                    >
                      <MenuItem value="">All Properties</MenuItem>
                      {properties.map((property) => (
                        <MenuItem key={property.id} value={property.id}>
                          {property.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={paymentFilters.start_date ? paymentFilters.start_date.toISOString().split('T')[0] : ''}
                    onChange={(e) => setPaymentFilters({ ...paymentFilters, start_date: e.target.value ? new Date(e.target.value) : null })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={paymentFilters.end_date ? paymentFilters.end_date.toISOString().split('T')[0] : ''}
                    onChange={(e) => setPaymentFilters({ ...paymentFilters, end_date: e.target.value ? new Date(e.target.value) : null })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    onClick={loadPaymentAnalytics}
                    disabled={loading}
                    sx={{ height: '56px' }}
                  >
                    Apply Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>
            
            {paymentAnalytics && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Payment Summary
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Total Payments:</Typography>
                        <Typography variant="h6">{paymentAnalytics.summary.total_payments}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Total Amount:</Typography>
                        <Typography variant="h6">{formatCurrency(paymentAnalytics.summary.total_amount)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="success.main">Completed:</Typography>
                        <Typography color="success.main">{formatCurrency(paymentAnalytics.summary.completed_amount)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="warning.main">Pending:</Typography>
                        <Typography color="warning.main">{formatCurrency(paymentAnalytics.summary.pending_amount)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="error.main">Overdue:</Typography>
                        <Typography color="error.main">{formatCurrency(paymentAnalytics.summary.overdue_amount)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Completion Rate:</Typography>
                        <Typography variant="h6">{formatPercentage(paymentAnalytics.summary.completion_rate)}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Payment Details
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Tenant</TableCell>
                              <TableCell>Unit</TableCell>
                              <TableCell>Property</TableCell>
                              <TableCell>Amount</TableCell>
                              <TableCell>Date</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {paymentAnalytics.payments.map((payment) => (
                              <TableRow key={payment.payment_id}>
                                <TableCell>{payment.tenant_name}</TableCell>
                                <TableCell>{payment.unit_number}</TableCell>
                                <TableCell>{payment.property_name}</TableCell>
                                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                <TableCell>{payment.payment_date}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={payment.status}
                                    color={getStatusColor(payment.status)}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        )}

        {/* Monthly Reports Tab */}
        {activeTab === 3 && (
          <Box>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Report Filters
        </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={reportYear}
                      onChange={(e) => setReportYear(e.target.value)}
                      label="Year"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={reportMonth}
                      onChange={(e) => setReportMonth(e.target.value)}
                      label="Month"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <MenuItem key={month} value={month}>
                          {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Property</InputLabel>
                    <Select
                      value={paymentFilters.property_id}
                      onChange={(e) => setPaymentFilters({ ...paymentFilters, property_id: e.target.value })}
                      label="Property"
                    >
                      <MenuItem value="">All Properties</MenuItem>
                      {properties.map((property) => (
                        <MenuItem key={property.id} value={property.id}>
                          {property.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Button
                    variant="contained"
                    onClick={loadMonthlyReport}
                    disabled={loading}
                    sx={{ height: '56px' }}
                  >
                    Generate Report
                  </Button>
                </Grid>
              </Grid>
      </Paper>
            
            {monthlyReport && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {monthlyReport.month_name} Report
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Total Properties:</Typography>
                        <Typography variant="h6">{monthlyReport.total_properties}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Total Units:</Typography>
                        <Typography variant="h6">{monthlyReport.total_units}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Occupied Units:</Typography>
                        <Typography variant="h6">{monthlyReport.occupied_units}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Available Units:</Typography>
                        <Typography variant="h6">{monthlyReport.available_units}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Occupancy Rate:</Typography>
                        <Typography variant="h6">{formatPercentage(monthlyReport.occupancy_rate)}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Financial Summary
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Total Monthly Rent:</Typography>
                        <Typography variant="h6">{formatCurrency(monthlyReport.total_monthly_rent)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="success.main">Collected:</Typography>
                        <Typography color="success.main">{formatCurrency(monthlyReport.collected_rent)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="warning.main">Pending:</Typography>
                        <Typography color="warning.main">{formatCurrency(monthlyReport.pending_rent)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="error.main">Overdue:</Typography>
                        <Typography color="error.main">{formatCurrency(monthlyReport.overdue_rent)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Collection Rate:</Typography>
                        <Typography variant="h6">{formatPercentage(monthlyReport.collection_rate)}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        )}

        {/* Export Dialog */}
        <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Export Analytics Data</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Export Type</InputLabel>
                  <Select
                    value={exportFilters.export_type}
                    onChange={(e) => setExportFilters({ ...exportFilters, export_type: e.target.value })}
                    label="Export Type"
                  >
                    <MenuItem value="all">All Data</MenuItem>
                    <MenuItem value="properties">Properties Only</MenuItem>
                    <MenuItem value="units">Units Only</MenuItem>
                    <MenuItem value="payments">Payments Only</MenuItem>
                    <MenuItem value="tenants">Tenants Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={exportFilters.property_id}
                    onChange={(e) => setExportFilters({ ...exportFilters, property_id: e.target.value })}
                    label="Property"
                  >
                    <MenuItem value="">All Properties</MenuItem>
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={exportFilters.start_date ? exportFilters.start_date.toISOString().split('T')[0] : ''}
                  onChange={(e) => setExportFilters({ ...exportFilters, start_date: e.target.value ? new Date(e.target.value) : null })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={exportFilters.end_date ? exportFilters.end_date.toISOString().split('T')[0] : ''}
                  onChange={(e) => setExportFilters({ ...exportFilters, end_date: e.target.value ? new Date(e.target.value) : null })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialog(false)}>Cancel</Button>
            <Button onClick={handleExport} variant="contained" disabled={loading}>
              {loading ? 'Exporting...' : 'Export Excel'}
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
};

export default Analytics;