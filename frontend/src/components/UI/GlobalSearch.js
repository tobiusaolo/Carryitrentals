import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  IconButton
} from '@mui/material';
import { Search, Close, Person, Home, Payment, Apartment } from '@mui/icons-material';

const GlobalSearch = ({ open, onClose, onResultClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    // TODO: Implement actual search API call
    // For now, show placeholder results
    const mockResults = [
      { type: 'tenant', id: 1, title: 'John Doe', subtitle: 'Unit 101' },
      { type: 'property', id: 1, title: 'Sunset Apartments', subtitle: '123 Main St' },
      { type: 'unit', id: 1, title: 'Unit 101', subtitle: 'Available' },
    ].filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
    );

    setResults(mockResults);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'tenant': return <Person />;
      case 'property': return <Home />;
      case 'unit': return <Apartment />;
      case 'payment': return <Payment />;
      default: return <Search />;
    }
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(0,0,0,0.5)',
        zIndex: 1300,
        display: 'flex',
        justifyContent: 'center',
        pt: 8
      }}
      onClick={onClose}
    >
      <Paper
        sx={{
          width: '90%',
          maxWidth: 600,
          height: 'fit-content',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search tenants, properties, units..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={onClose}>
                    <Close />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {results.length > 0 ? (
          <List>
            {results.map((result, index) => (
              <React.Fragment key={result.id}>
                <ListItem
                  button
                  onClick={() => {
                    onResultClick && onResultClick(result);
                    onClose();
                  }}
                >
                  <ListItemIcon>
                    {getIcon(result.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={result.title}
                    secondary={result.subtitle}
                  />
                </ListItem>
                {index < results.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : searchQuery.length >= 2 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No results found for "{searchQuery}"
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Type at least 2 characters to search
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default GlobalSearch;

