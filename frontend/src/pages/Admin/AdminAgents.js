import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress
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
  Business as BusinessIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { agentAPI } from '../../services/api/agentAPI';
import { showSuccess, showError, showConfirm, showLoading, closeAlert } from '../../utils/sweetAlert';

const AdminAgents = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [agents, setAgents] = useState([]);
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

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAgents();
    }
  }, [user]);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const response = await agentAPI.getAgents();
      setAgents(response.data || []);
    } catch (err) {
      console.error('Failed to load agents:', err);
      setError('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

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
    setError(null);
    
    const loadingAlert = showLoading('Saving agent...', 'Please wait');
    
    try {
      if (editingAgent) {
        // Update agent
        await agentAPI.updateAgent(editingAgent.id, formData);
        closeAlert();
        showSuccess('Agent Updated!', 'The agent information has been successfully updated.');
        handleCloseDialog();
        loadAgents();
      } else {
        // Create agent
        await agentAPI.createAgent(formData);
        closeAlert();
        showSuccess('Agent Created!', 'New agent has been successfully added to the system.');
        handleCloseDialog();
        loadAgents();
      }
    } catch (err) {
      console.error('Failed to save agent:', err);
      closeAlert();
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to save agent';
      showError('Save Failed', errorMsg);
      setError(errorMsg);
    } finally {
      setSubmitting(false);
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
        await agentAPI.deleteAgent(agentId);
        closeAlert();
        showSuccess('Agent Deleted!', 'The agent has been successfully removed from the system.');
        loadAgents();
      } catch (err) {
        console.error('Failed to delete agent:', err);
        closeAlert();
        const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete agent';
        showError('Delete Failed', errorMsg);
        setError(errorMsg);
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

  if (user?.role !== 'admin') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>You need admin privileges to access this page.</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Agents Management
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage property inspection agents. Add, edit, and assign agents to units and inspections.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{agents.length}</Typography>
                  <Typography color="text.secondary">Total Agents</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {agents.filter(agent => agent.is_active).length}
                  </Typography>
                  <Typography color="text.secondary">Active Agents</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {agents.reduce((sum, agent) => sum + agent.assigned_units, 0)}
                  </Typography>
                  <Typography color="text.secondary">Assigned Units</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {agents.reduce((sum, agent) => sum + agent.completed_inspections, 0)}
                  </Typography>
                  <Typography color="text.secondary">Completed Inspections</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Agents Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              All Agents
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Agent
            </Button>
          </Box>
          
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Agent</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Personal Info</TableCell>
                  <TableCell>Specialization</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                        <CircularProgress />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : agents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No agents found. Click "Add Agent" to create one.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={agent.profile_picture} 
                          sx={{ mr: 2, bgcolor: 'primary.light', width: 48, height: 48 }}
                        >
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{agent.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {agent.id} | Age: {agent.age}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {agent.location}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          NIN: {agent.nin_number}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={agent.specialization} 
                        color="primary" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <strong>{agent.assigned_units}</strong> units assigned
                        </Typography>
                        <Typography variant="body2">
                          <strong>{agent.completed_inspections}</strong> inspections completed
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={agent.is_active ? "Active" : "Inactive"} 
                        color={agent.is_active ? "success" : "default"}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewAgent(agent)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Agent">
                        <IconButton size="small" onClick={() => handleOpenDialog(agent)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Agent">
                        <IconButton size="small" color="error" onClick={() => handleDelete(agent.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

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
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <CheckCircleIcon sx={{ mr: 1, color: formData.is_active ? 'success.main' : 'text.secondary' }} />
                  <Typography variant="body2">
                    {formData.is_active ? 'Agent is active' : 'Agent is inactive'}
                  </Typography>
                </Box>
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
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          Agent Details - {selectedAgent?.name}
        </DialogTitle>
        <DialogContent>
          {selectedAgent && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{selectedAgent.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedAgent.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selectedAgent.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Age</Typography>
                  <Typography variant="body1">{selectedAgent.age}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                  <Typography variant="body1">{selectedAgent.location}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">NIN Number</Typography>
                  <Typography variant="body1">{selectedAgent.nin_number}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Specialization</Typography>
                  <Typography variant="body1">{selectedAgent.specialization}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedAgent.is_active ? "Active" : "Inactive"} 
                    color={selectedAgent.is_active ? "success" : "default"}
                    size="small" 
                  />
                </Grid>
                {selectedAgent.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                    <Typography variant="body1">{selectedAgent.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAgents;
