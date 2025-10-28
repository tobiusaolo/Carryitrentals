import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as MoneyIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import reportsAPI from '../../services/api/reportsAPI';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';
import api from '../../services/api/api';
import NotificationSystem from '../../components/UI/NotificationSystem';
import EmptyState from '../../components/UI/EmptyState';

const Reports = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tenants, setTenants] = useState([]);
  
  const { properties } = useSelector((state) => state.properties);
  
  // Load tenants and properties on mount
  useEffect(() => {
    loadTenants();
    dispatch(fetchProperties());
  }, [dispatch]);

  const loadTenants = async () => {
    try {
      const response = await api.get('/tenants/');
      setTenants(response.data);
    } catch (error) {
      console.error('Error loading tenants:', error);
      setSnackbar({ 
        open: true, 
        message: 'Could not load tenants. Please refresh the page.', 
        severity: 'warning' 
      });
    }
  };
  
  // Report parameters
  const [tenantStatementParams, setTenantStatementParams] = useState({
    tenant_id: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  
  const [propertyReportParams, setPropertyReportParams] = useState({
    property_id: '',
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  
  const [yearEndParams, setYearEndParams] = useState({
    year: new Date().getFullYear()
  });
  
  const [taxReportParams, setTaxReportParams] = useState({
    property_id: '',
    year: new Date().getFullYear()
  });

  const handleGenerateTenantStatement = async () => {
    if (!tenantStatementParams.tenant_id) {
      setSnackbar({ open: true, message: 'Please select a tenant', severity: 'warning' });
      return;
    }
    
    setLoading(true);
    try {
      const blob = await reportsAPI.generateTenantStatementPDF(
        tenantStatementParams.tenant_id,
        tenantStatementParams.year,
        tenantStatementParams.month
      );
      
      // Check if blob is valid
      if (!blob || blob.size === 0) {
        throw new Error('Report generation returned empty data');
      }
      
      // Check if it's actually a PDF (not an error JSON)
      if (blob.type === 'application/json') {
        const text = await blob.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.detail || 'Failed to generate report');
      }
      
      const filename = `tenant_statement_${tenantStatementParams.tenant_id}_${tenantStatementParams.year}_${tenantStatementParams.month}.pdf`;
      reportsAPI.downloadPDF(blob, filename);
      
      setSnackbar({ open: true, message: 'Tenant statement generated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error generating tenant statement:', error);
      setSnackbar({
        open: true,
        message: `Error generating report: ${error.message || error.response?.data?.detail || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePropertyReport = async () => {
    if (!propertyReportParams.property_id) {
      setSnackbar({ open: true, message: 'Please select a property', severity: 'warning' });
      return;
    }
    
    setLoading(true);
    try {
      const blob = await reportsAPI.generatePropertyReportPDF(
        propertyReportParams.property_id,
        propertyReportParams.start_date,
        propertyReportParams.end_date
      );
      
      // Check if blob is valid
      if (!blob || blob.size === 0) {
        throw new Error('Report generation returned empty data');
      }
      
      // Check if it's actually a PDF (not an error JSON)
      if (blob.type === 'application/json') {
        const text = await blob.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.detail || 'Failed to generate report');
      }
      
      const filename = `property_report_${propertyReportParams.property_id}_${propertyReportParams.start_date}_${propertyReportParams.end_date}.pdf`;
      reportsAPI.downloadPDF(blob, filename);
      
      setSnackbar({ open: true, message: 'Property report generated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error generating property report:', error);
      setSnackbar({
        open: true,
        message: `Error generating report: ${error.message || error.response?.data?.detail || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateYearEndReport = async () => {
    setLoading(true);
    try {
      const blob = await reportsAPI.generateYearEndReportPDF(yearEndParams.year);
      
      // Check if blob is valid
      if (!blob || blob.size === 0) {
        throw new Error('Report generation returned empty data');
      }
      
      // Check if it's actually a PDF (not an error JSON)
      if (blob.type === 'application/json') {
        const text = await blob.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.detail || 'Failed to generate report');
      }
      
      const filename = `year_end_report_${yearEndParams.year}.pdf`;
      reportsAPI.downloadPDF(blob, filename);
      
      setSnackbar({ open: true, message: 'Year-end report generated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error generating year-end report:', error);
      setSnackbar({
        open: true,
        message: `Error generating report: ${error.message || error.response?.data?.detail || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTaxReport = async () => {
    if (!taxReportParams.property_id) {
      setSnackbar({ open: true, message: 'Please select a property', severity: 'warning' });
      return;
    }
    
    setLoading(true);
    try {
      const blob = await reportsAPI.generateTaxReportPDF(
        taxReportParams.property_id,
        taxReportParams.year
      );
      
      // Check if blob is valid
      if (!blob || blob.size === 0) {
        throw new Error('Report generation returned empty data');
      }
      
      // Check if it's actually a PDF (not an error JSON)
      if (blob.type === 'application/json') {
        const text = await blob.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.detail || 'Failed to generate report');
      }
      
      const filename = `tax_report_${taxReportParams.property_id}_${taxReportParams.year}.pdf`;
      reportsAPI.downloadPDF(blob, filename);
      
      setSnackbar({ open: true, message: 'Tax report generated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error generating tax report:', error);
      setSnackbar({
        open: true,
        message: `Error generating report: ${error.message || error.response?.data?.detail || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    {
      title: 'Tenant Statement',
      description: 'Generate monthly rent statement for a tenant',
      icon: <DescriptionIcon fontSize="large" color="primary" />,
      color: '#1976d2'
    },
    {
      title: 'Property Report',
      description: 'Comprehensive property performance report',
      icon: <AssessmentIcon fontSize="large" color="success" />,
      color: '#2e7d32'
    },
    {
      title: 'Year-End Report',
      description: 'Annual summary report for all properties',
      icon: <CalendarIcon fontSize="large" color="warning" />,
      color: '#ed6c02'
    },
    {
      title: 'Tax Report',
      description: 'Income and expense report for tax purposes',
      icon: <AccountBalanceIcon fontSize="large" color="error" />,
      color: '#d32f2f'
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          <PdfIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Reports & Statements
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate PDF reports for tenants, properties, and financial statements
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} • {tenants.length} tenant{tenants.length === 1 ? '' : 's'} loaded
        </Typography>
      </Box>

      {/* Show loading or empty state */}
      {properties.length === 0 && tenants.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Loading your properties and tenants... If this takes too long, please make sure you have properties and tenants set up.
        </Alert>
      )}

      {/* Report Type Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {reportTypes.map((type, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', borderTop: 3, borderColor: type.color }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  {type.icon}
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    {type.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {type.description}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Report Generation Forms */}
      <Grid container spacing={3}>
        {/* Tenant Statement */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <DescriptionIcon sx={{ mr: 1 }} color="primary" />
              Tenant Statement
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Tenant</InputLabel>
                  <Select
                    value={tenantStatementParams.tenant_id}
                    label="Select Tenant"
                    onChange={(e) => setTenantStatementParams({ ...tenantStatementParams, tenant_id: e.target.value })}
                    disabled={tenants.length === 0}
                  >
                    <MenuItem value="">-- Select Tenant --</MenuItem>
                    {tenants.length === 0 && (
                      <MenuItem disabled>No tenants available</MenuItem>
                    )}
                    {tenants.map((tenant) => (
                      <MenuItem key={tenant.id} value={tenant.id}>
                        {tenant.first_name} {tenant.last_name} - Unit {tenant.unit?.unit_number || 'N/A'} ({tenant.property?.name || 'N/A'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {tenants.length === 0 && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    No tenants found. Please add tenants first.
                  </Typography>
                )}
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={tenantStatementParams.year}
                    label="Year"
                    onChange={(e) => setTenantStatementParams({ ...tenantStatementParams, year: e.target.value })}
                  >
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return <MenuItem key={year} value={year}>{year}</MenuItem>;
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={tenantStatementParams.month}
                    label="Month"
                    onChange={(e) => setTenantStatementParams({ ...tenantStatementParams, month: e.target.value })}
                  >
                    {[...Array(12)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                  onClick={handleGenerateTenantStatement}
                  disabled={loading}
                >
                  Generate Statement
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Property Report */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 1 }} color="success" />
              Property Performance Report
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={propertyReportParams.property_id}
                    label="Property"
                    onChange={(e) => setPropertyReportParams({ ...propertyReportParams, property_id: e.target.value })}
                    disabled={properties.length === 0}
                  >
                    <MenuItem value="">-- Select Property --</MenuItem>
                    {properties.length === 0 && (
                      <MenuItem disabled>No properties available</MenuItem>
                    )}
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name} - {property.address}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {properties.length === 0 && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    No properties found. Please add properties first.
                  </Typography>
                )}
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={propertyReportParams.start_date}
                  onChange={(e) => setPropertyReportParams({ ...propertyReportParams, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={propertyReportParams.end_date}
                  onChange={(e) => setPropertyReportParams({ ...propertyReportParams, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                  onClick={handleGeneratePropertyReport}
                  disabled={loading}
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Year-End Report */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ mr: 1 }} color="warning" />
              Year-End Report
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={yearEndParams.year}
                    label="Year"
                    onChange={(e) => setYearEndParams({ year: e.target.value })}
                  >
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return <MenuItem key={year} value={year}>{year}</MenuItem>;
                    })}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Generate comprehensive year-end report for all your properties
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                  onClick={handleGenerateYearEndReport}
                  disabled={loading}
                >
                  Generate Year-End Report
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Tax Report */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountBalanceIcon sx={{ mr: 1 }} color="error" />
              Tax Report
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={taxReportParams.property_id}
                    label="Property"
                    onChange={(e) => setTaxReportParams({ ...taxReportParams, property_id: e.target.value })}
                    disabled={properties.length === 0}
                  >
                    <MenuItem value="">-- Select Property --</MenuItem>
                    {properties.length === 0 && (
                      <MenuItem disabled>No properties available</MenuItem>
                    )}
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name} - {property.address}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {properties.length === 0 && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    No properties found. Please add properties first.
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tax Year</InputLabel>
                  <Select
                    value={taxReportParams.year}
                    label="Tax Year"
                    onChange={(e) => setTaxReportParams({ ...taxReportParams, year: e.target.value })}
                  >
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return <MenuItem key={year} value={year}>{year}</MenuItem>;
                    })}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Generate income and expense report for tax filing
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                  onClick={handleGenerateTaxReport}
                  disabled={loading}
                >
                  Generate Tax Report
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Professional Notification System */}
      <NotificationSystem
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        title={snackbar.severity === 'success' ? 'Success!' : snackbar.severity === 'error' ? 'Error' : null}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default Reports;

