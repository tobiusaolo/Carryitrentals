import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Fab,
  Avatar,
} from '@mui/material';
import {
  Add,
  CalendarToday,
  Home,
  Apartment,
  CheckCircle,
  Schedule,
  Cancel,
  Edit,
  Delete,
  Visibility,
  Assignment,
  Warning,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
// Removed complex date picker dependencies

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: color, mr: 2 }}>
          {icon}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Inspections = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { units } = useSelector((state) => state.units);
  const { properties } = useSelector((state) => state.properties);
  
  const [activeTab, setActiveTab] = useState(0);
  const [inspections, setInspections] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInspection, setEditingInspection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    unit_id: '',
    inspection_date: new Date(),
    inspection_type: 'routine',
    inspector_name: '',
    status: 'scheduled',
    notes: '',
    findings: '',
    recommendations: '',
    photos: []
  });

  // Mock data for inspections - in real app, this would come from API
  useEffect(() => {
    const mockInspections = [
      {
        id: 1,
        unit_id: 1,
        unit_number: '101',
        property_name: 'Sunset Apartments',
        property_address: '123 Sunset Boulevard, Los Angeles, CA',
        inspection_date: '2025-10-25',
        inspection_type: 'routine',
        inspector_name: 'John Smith',
        status: 'scheduled',
        notes: 'Quarterly routine inspection',
        findings: '',
        recommendations: '',
        monthly_rent: 2500,
        bedrooms: 2,
        bathrooms: 2,
        created_at: '2025-10-20T10:00:00Z'
      },
      {
        id: 2,
        unit_id: 2,
        unit_number: '102',
        property_name: 'Sunset Apartments',
        property_address: '123 Sunset Boulevard, Los Angeles, CA',
        inspection_date: '2025-10-28',
        inspection_type: 'move_out',
        inspector_name: 'Jane Doe',
        status: 'completed',
        notes: 'Move-out inspection for departing tenant',
        findings: 'Minor wall damage, carpet needs cleaning',
        recommendations: 'Repair wall damage, deep clean carpet',
        monthly_rent: 2200,
        bedrooms: 1,
        bathrooms: 1,
        created_at: '2025-10-18T14:30:00Z'
      },
      {
        id: 3,
        unit_id: 3,
        unit_number: '201',
        property_name: 'Premium Rental Complex',
        property_address: '456 Premium Street, Los Angeles, CA',
        inspection_date: '2025-11-01',
        inspection_type: 'move_in',
        inspector_name: 'Mike Johnson',
        status: 'scheduled',
        notes: 'Pre-move-in inspection for new tenant',
        findings: '',
        recommendations: '',
        monthly_rent: 3000,
        bedrooms: 3,
        bathrooms: 2,
        created_at: '2025-10-19T09:15:00Z'
      }
    ];
    setInspections(mockInspections);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (inspection = null) => {
    if (inspection) {
      setEditingInspection(inspection);
      setFormData({
        unit_id: inspection.unit_id,
        inspection_date: new Date(inspection.inspection_date),
        inspection_type: inspection.inspection_type,
        inspector_name: inspection.inspector_name,
        status: inspection.status,
        notes: inspection.notes,
        findings: inspection.findings,
        recommendations: inspection.recommendations,
        photos: inspection.photos || []
      });
    } else {
      setEditingInspection(null);
      setFormData({
        unit_id: '',
        inspection_date: new Date(),
        inspection_type: 'routine',
        inspector_name: '',
        status: 'scheduled',
        notes: '',
        findings: '',
        recommendations: '',
        photos: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingInspection(null);
    setFormData({
      unit_id: '',
      inspection_date: new Date(),
      inspection_type: 'routine',
      inspector_name: '',
      status: 'scheduled',
      notes: '',
      findings: '',
      recommendations: '',
      photos: []
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newInspection = {
        id: editingInspection ? editingInspection.id : Date.now(),
        ...formData,
        inspection_date: formData.inspection_date.toISOString().split('T')[0],
        unit_number: units.find(u => u.id === parseInt(formData.unit_id))?.unit_number || 'N/A',
        property_name: properties.find(p => p.id === units.find(u => u.id === parseInt(formData.unit_id))?.property_id)?.name || 'N/A',
        property_address: properties.find(p => p.id === units.find(u => u.id === parseInt(formData.unit_id))?.property_id)?.address || 'N/A',
        monthly_rent: units.find(u => u.id === parseInt(formData.unit_id))?.monthly_rent || 0,
        bedrooms: units.find(u => u.id === parseInt(formData.unit_id))?.bedrooms || 0,
        bathrooms: units.find(u => u.id === parseInt(formData.unit_id))?.bathrooms || 0,
        created_at: new Date().toISOString()
      };

      if (editingInspection) {
        setInspections(prev => prev.map(i => i.id === editingInspection.id ? newInspection : i));
      } else {
        setInspections(prev => [...prev, newInspection]);
      }

      setLoading(false);
      handleCloseDialog();
    }, 1000);
  };

  const handleDelete = (inspectionId) => {
    setInspections(prev => prev.filter(i => i.id !== inspectionId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'in_progress': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Schedule />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      case 'in_progress': return <Edit />;
      default: return <CalendarToday />;
    }
  };

  const getInspectionTypeColor = (type) => {
    switch (type) {
      case 'routine': return 'info';
      case 'move_in': return 'success';
      case 'move_out': return 'warning';
      case 'emergency': return 'error';
      default: return 'default';
    }
  };

  // Filter inspections based on active tab
  const filteredInspections = inspections.filter(inspection => {
    switch (activeTab) {
      case 0: return inspection.status === 'scheduled';
      case 1: return inspection.status === 'completed';
      case 2: return inspection.status === 'cancelled';
      case 3: return inspection.status === 'in_progress';
      default: return true;
    }
  });

  // Get available units for rent (not occupied) - ONLY these can be inspected
  const availableUnits = units.filter(unit => unit.status === 'available');
  
  // Show warning if no available units
  const hasAvailableUnits = availableUnits.length > 0;

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'unit_number', headerName: 'Unit', width: 100 },
    { field: 'property_name', headerName: 'Property', width: 200 },
    { field: 'inspection_date', headerName: 'Date', width: 120 },
    { field: 'inspection_type', headerName: 'Type', width: 120 },
    { field: 'inspector_name', headerName: 'Inspector', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'monthly_rent', headerName: 'Rent', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDelete(params.row.id)}>
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday />
            Unit Inspections
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            disabled={!hasAvailableUnits}
            sx={{ borderRadius: 2 }}
          >
            Schedule Inspection
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </Alert>
        )}

        {!hasAvailableUnits && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              No Available Units for Inspection
            </Typography>
            <Typography variant="body2">
              Inspections can only be scheduled for units that are <strong>available for rent</strong> (not occupied). 
              Currently, all your units are occupied. You can schedule inspections when units become available.
            </Typography>
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Scheduled Inspections
                    </Typography>
                    <Typography variant="h4">
                      {inspections.filter(i => i.status === 'scheduled').length}
                    </Typography>
                  </Box>
                  <Schedule color="primary" sx={{ fontSize: 40 }} />
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
                      Completed Inspections
                    </Typography>
                    <Typography variant="h4">
                      {inspections.filter(i => i.status === 'completed').length}
                    </Typography>
                  </Box>
                  <CheckCircle color="success" sx={{ fontSize: 40 }} />
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
                      Available Units
                    </Typography>
                    <Typography variant="h4">
                      {availableUnits.length}
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
                      Total Inspections
                    </Typography>
                    <Typography variant="h4">
                      {inspections.length}
                    </Typography>
                  </Box>
                  <CalendarToday color="secondary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Inspection Status Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Scheduled" />
            <Tab label="Completed" />
            <Tab label="Cancelled" />
            <Tab label="In Progress" />
          </Tabs>
        </Paper>


        {/* Data Grid View */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            All Inspections
          </Typography>
          <DataGrid
            rows={inspections}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            sx={{ height: 400 }}
          />
        </Box>

        {/* Inspection Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingInspection ? 'Edit Inspection' : 'Schedule New Inspection'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Unit (Available for Rent Only)</InputLabel>
                    <Select
                      value={formData.unit_id}
                      onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                      label="Unit (Available for Rent Only)"
                    >
                      {availableUnits.length === 0 ? (
                        <MenuItem disabled>
                          No available units for inspection
                        </MenuItem>
                      ) : (
                        availableUnits.map((unit) => (
                          <MenuItem key={unit.id} value={unit.id}>
                            Unit {unit.unit_number} - {properties.find(p => p.id === unit.property_id)?.name} (Available)
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Inspection Date"
                    type="date"
                    value={formData.inspection_date.toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, inspection_date: new Date(e.target.value) })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Inspection Type</InputLabel>
                    <Select
                      value={formData.inspection_type}
                      onChange={(e) => setFormData({ ...formData, inspection_type: e.target.value })}
                      label="Inspection Type"
                    >
                      <MenuItem value="routine">Routine</MenuItem>
                      <MenuItem value="move_in">Move-In</MenuItem>
                      <MenuItem value="move_out">Move-Out</MenuItem>
                      <MenuItem value="emergency">Emergency</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Inspector Name"
                    value={formData.inspector_name}
                    onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      label="Status"
                    >
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    multiline
                    rows={3}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Findings"
                    value={formData.findings}
                    onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                    multiline
                    rows={3}
                    placeholder="Enter inspection findings..."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Recommendations"
                    value={formData.recommendations}
                    onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                    multiline
                    rows={3}
                    placeholder="Enter recommendations..."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Saving...' : editingInspection ? 'Update' : 'Schedule'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    );
  };

  export default Inspections;