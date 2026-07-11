import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  LinearProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Business as BusinessIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  Work as WorkIcon,
  Notes as NotesIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { agentAPI } from '../../services/api/agentAPI';
import { showSuccess, showError, showConfirm, showLoading, closeAlert } from '../../utils/sweetAlert';
import authService from '../../services/authService';
import { useCachedQuery } from '../../hooks/useCachedQuery';
import PageHeader from '../../components/UI/PageHeader';
import DataTable from '../../components/UI/DataTable';
import TableActions from '../../components/UI/TableActions';
import AdminPage from '../../components/Admin/AdminPage';
import AdminStatStrip from '../../components/Admin/AdminStatStrip';
import AdminStatusChip from '../../components/Admin/AdminStatusChip';
import { adminPrimaryButtonSx, portalOutlinedButtonSx } from '../../theme/designTokens';

const AdminAgents = () => {
  const { user } = useSelector(state => state.auth);

  const {
    data: agents = [],
    loading,
    refreshing,
    error,
    refresh: loadAgents,
  } = useCachedQuery('/agents/', { enabled: user?.role === 'admin' });

  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    location: '',
    nin_number: '',
    specialization: '',
    is_active: true,
    notes: '',
    profile_picture: null,
    nin_front_image: null,
    nin_back_image: null
  });

  const handleOpenDialog = (agent = null) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        age: agent.age,
        location: agent.location,
        nin_number: agent.nin_number,
        specialization: agent.specialization,
        is_active: agent.is_active,
        notes: agent.notes,
        profile_picture: agent.profile_picture,
        nin_front_image: agent.nin_front_image,
        nin_back_image: agent.nin_back_image
      });
    } else {
      setEditingAgent(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        age: '',
        location: '',
        nin_number: '',
        specialization: '',
        is_active: true,
        notes: '',
        profile_picture: null,
        nin_front_image: null,
        nin_back_image: null
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAgent(null);
  };

  const handleViewAgent = (agent) => {
    setSelectedAgent(agent);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedAgent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const loadingAlert = showLoading('Saving agent...', 'Please wait');
    
    try {
      const api = authService.createAxiosInstance();
      
      if (editingAgent) {
        // Update agent
        await api.put(`/agents/${editingAgent.id}`, formData);
        closeAlert();
        showSuccess('Agent Updated!', 'The agent information has been successfully updated.');
        handleCloseDialog();
        
        // Wait a moment for backend to process, then refresh
        await new Promise(resolve => setTimeout(resolve, 300));
        await loadAgents();
      } else {
        // Create agent
        await api.post('/agents/', formData);
        closeAlert();
        showSuccess('Agent Created!', 'New agent has been successfully added to the system.');
        handleCloseDialog();
        
        // Wait a moment for backend to process, then refresh
        await new Promise(resolve => setTimeout(resolve, 300));
        await loadAgents();
      }
    } catch (err) {
      console.error('Failed to save agent:', err);
      closeAlert();
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to save agent';
      showError('Save Failed', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (agent) => {
    const action = agent.is_active ? 'deactivate' : 'activate';
    const result = await showConfirm(
      `${action === 'activate' ? 'Activate' : 'Deactivate'} Agent?`,
      `Are you sure you want to ${action} ${agent.name}? ${action === 'deactivate' ? 'The agent will not be able to login until reactivated.' : 'The agent will be able to login and access the system.'}`,
      `Yes, ${action === 'activate' ? 'Activate' : 'Deactivate'}`,
      'Cancel'
    );
    
    if (result.isConfirmed) {
      const loadingAlert = showLoading(`${action === 'activate' ? 'Activating' : 'Deactivating'} agent...`, 'Please wait');
      
      try {
        // Use the dedicated toggle endpoint
        await agentAPI.toggleAgentActive(agent.id);
        closeAlert();
        showSuccess(
          `Agent ${action === 'activate' ? 'Activated' : 'Deactivated'}!`, 
          `${agent.name} has been ${action === 'activate' ? 'activated' : 'deactivated'} successfully.`
        );
        
        // Wait a moment for backend to process, then refresh
        await new Promise(resolve => setTimeout(resolve, 300));
        await loadAgents();
      } catch (err) {
        console.error(`Failed to ${action} agent:`, err);
        closeAlert();
        const errorMsg = err.response?.data?.detail || err.message || `Failed to ${action} agent`;
        showError(`${action === 'activate' ? 'Activation' : 'Deactivation'} Failed`, errorMsg);
      }
    }
  };

  const handleDelete = async (agentId) => {
    const result = await showConfirm(
      'Delete Agent?',
      'Are you sure you want to delete this agent? This action cannot be undone.',
      'Yes, Delete',
      'Cancel'
    );
    
    if (result.isConfirmed) {
      const loadingAlert = showLoading('Deleting agent...', 'Please wait');
      
      try {
        const api = authService.createAxiosInstance();
        await api.delete(`/agents/${agentId}`);
        closeAlert();
        showSuccess('Agent Deleted!', 'The agent has been successfully removed from the system.');
        
        // Wait a moment for backend to process, then refresh
        await new Promise(resolve => setTimeout(resolve, 300));
        await loadAgents();
      } catch (err) {
        console.error('Failed to delete agent:', err);
        closeAlert();
        const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete agent';
        showError('Delete Failed', errorMsg);
      }
    }
  };

  const handleFileUpload = (field, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          [field]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const activeCount = agents.filter((agent) => agent.is_active).length;
  const assignedUnits = agents.reduce((sum, agent) => sum + (agent.assigned_units || 0), 0);
  const completedInspections = agents.reduce((sum, agent) => sum + (agent.completed_inspections || 0), 0);

  const agentColumns = [
    {
      id: 'agent',
      label: 'Agent',
      getSearchValue: (row) => `${row.name} ${row.id}`,
      render: (agent) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={agent.profile_picture}
            sx={{ mr: 2, bgcolor: 'primary.light', width: 40, height: 40 }}
          >
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle2">{agent.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {agent.id} · Age: {agent.age}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'contact',
      label: 'Contact',
      getSearchValue: (row) => `${row.email} ${row.phone}`,
      render: (agent) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2">{agent.email}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2">{agent.phone}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'personal',
      label: 'Personal info',
      getSearchValue: (row) => `${row.location} ${row.nin_number}`,
      render: (agent) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {agent.location}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            NIN: {agent.nin_number}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'performance',
      label: 'Performance',
      render: (agent) => (
        <Box>
          <Typography variant="body2">
            <strong>{agent.assigned_units || 0}</strong> units assigned
          </Typography>
          <Typography variant="body2">
            <strong>{agent.completed_inspections || 0}</strong> inspections completed
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (agent) => (
        <AdminStatusChip status={agent.is_active ? 'active' : 'inactive'} />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      render: (agent) => (
        <TableActions
          inline
          actions={[
            {
              icon: agent.is_active ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />,
              label: agent.is_active ? 'Deactivate' : 'Activate',
              onClick: () => handleToggleActive(agent),
            },
            {
              icon: <ViewIcon fontSize="small" />,
              label: 'View',
              onClick: () => handleViewAgent(agent),
            },
            {
              icon: <EditIcon fontSize="small" />,
              label: 'Edit',
              onClick: () => handleOpenDialog(agent),
            },
            {
              icon: <DeleteIcon fontSize="small" />,
              label: 'Delete',
              danger: true,
              onClick: () => handleDelete(agent.id),
            },
          ]}
        />
      ),
    },
  ];

  if (user?.role !== 'admin') {
    return (
      <AdminPage>
        <Alert severity="error">Admin access required</Alert>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <PageHeader
        variant="admin"
        title="Agents"
        subtitle={`${activeCount} active · ${agents.length} total`}
        action={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadAgents}
              variant="outlined"
              size="small"
              sx={portalOutlinedButtonSx}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={adminPrimaryButtonSx}
            >
              Add agent
            </Button>
          </Box>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {(loading || refreshing) && <LinearProgress sx={{ mb: 2 }} />}

      <AdminStatStrip
        loading={loading}
        stats={[
          { title: 'Total agents', value: agents.length, icon: <PersonIcon /> },
          { title: 'Active agents', value: activeCount, icon: <CheckCircleIcon /> },
          { title: 'Assigned units', value: assignedUnits, icon: <AssignmentIcon /> },
          { title: 'Completed inspections', value: completedInspections, icon: <BusinessIcon /> },
        ]}
      />

      <DataTable
        columns={agentColumns}
        rows={agents}
        loading={loading}
        title="All agents"
        emptyTitle="No agents yet"
        emptyDescription='Click "Add agent" to onboard a field agent.'
        emptyIcon={PersonIcon}
        emptyActionLabel="Add agent"
        onEmptyAction={() => handleOpenDialog()}
        searchPlaceholder="Search by name, email, or location…"
        getRowId={(row) => row.id}
      />

      {/* Add/Edit Agent Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAgent ? 'Edit Agent' : 'Add New Agent'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Agent Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="National ID (NIN) Number"
                  name="nin_number"
                  value={formData.nin_number}
                  onChange={(e) => setFormData({...formData, nin_number: e.target.value})}
                  required
                />
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Contact Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </Grid>


              {/* Photo Uploads */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Photos & Documents
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Profile Picture
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('profile_picture', e.target.files[0])}
                    style={{ marginBottom: 8 }}
                  />
                  {formData.profile_picture && (
                    <Box sx={{ mt: 1 }}>
                      <img 
                        src={formData.profile_picture} 
                        alt="Profile" 
                        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    NIN Front Image
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('nin_front_image', e.target.files[0])}
                    style={{ marginBottom: 8 }}
                  />
                  {formData.nin_front_image && (
                    <Box sx={{ mt: 1 }}>
                      <img 
                        src={formData.nin_front_image} 
                        alt="NIN Front" 
                        style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 8 }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    NIN Back Image
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('nin_back_image', e.target.files[0])}
                    style={{ marginBottom: 8 }}
                  />
                  {formData.nin_back_image && (
                    <Box sx={{ mt: 1 }}>
                      <img 
                        src={formData.nin_back_image} 
                        alt="NIN Back" 
                        style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 8 }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Status */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ mr: 1, color: formData.is_active ? 'success.main' : 'text.secondary' }} />
                      <Typography variant="body2">
                        {formData.is_active ? 'Agent is Active' : 'Agent is Inactive'}
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  {editingAgent ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                `${editingAgent ? 'Update' : 'Create'} Agent`
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Agent Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={handleCloseViewDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        {selectedAgent && (
          <>
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 3,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar 
                    src={selectedAgent.profile_picture} 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      border: '4px solid white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    {selectedAgent.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {selectedAgent.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      <Chip 
                        label={selectedAgent.is_active ? "Active" : "Inactive"} 
                        color={selectedAgent.is_active ? "success" : "default"}
                        sx={{ 
                          bgcolor: selectedAgent.is_active ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                          color: 'white',
                          fontWeight: 600
                        }}
                        icon={selectedAgent.is_active ? <CheckCircleIcon /> : <WarningIcon />}
                      />
                      {selectedAgent.specialization && (
                        <Chip 
                          label={selectedAgent.specialization}
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: 500
                          }}
                          icon={<WorkIcon />}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              <Box>
                {/* Performance Metrics Card */}
                {selectedAgent.assigned_units !== undefined && (
                  <Card variant="outlined" sx={{ m: 3, mb: 2, bgcolor: 'action.hover' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TrendingUpIcon color="primary" />
                        Performance Overview
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                            <HomeIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold" color="primary.main">
                              {selectedAgent.assigned_units || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Units Assigned
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                            <StarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold" color="warning.main">
                              {selectedAgent.performance_rating || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Performance Rating
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                            <AssignmentIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold" color="success.main">
                              {selectedAgent.completed_inspections || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Completed Inspections
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Contact Information Card */}
                <Card variant="outlined" sx={{ m: 3, mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <PhoneIcon color="primary" />
                      Contact Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <EmailIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Email Address
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedAgent.email || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <PhoneIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Phone Number
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedAgent.phone || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      {selectedAgent.location && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <LocationIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Location
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {selectedAgent.location}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>

                {/* Personal Information Card */}
                <Card variant="outlined" sx={{ m: 3, mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <PersonIcon color="primary" />
                      Personal Information
                    </Typography>
                    <Grid container spacing={3}>
                      {selectedAgent.age && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <PersonIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Age
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {selectedAgent.age} years old
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                      {selectedAgent.nin_number && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <BadgeIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                NIN Number
                              </Typography>
                              <Typography variant="body1" fontWeight="medium" sx={{ fontFamily: 'monospace' }}>
                                {selectedAgent.nin_number}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                      {selectedAgent.specialization && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <WorkIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Specialization
                              </Typography>
                              <Chip 
                                label={selectedAgent.specialization}
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>

                {/* Notes Card */}
                {selectedAgent.notes && (
                  <Card variant="outlined" sx={{ m: 3, mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <NotesIcon color="primary" />
                        Notes
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {selectedAgent.notes}
                        </Typography>
                      </Paper>
                    </CardContent>
                  </Card>
                )}
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
              <Button onClick={handleCloseViewDialog} variant="outlined">
                Close
              </Button>
              <Button 
                variant="contained" 
                startIcon={<EditIcon />}
                onClick={() => {
                  handleCloseViewDialog();
                  handleOpenDialog(selectedAgent);
                }}
              >
                Edit Agent
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </AdminPage>
  );
};

export default AdminAgents;
