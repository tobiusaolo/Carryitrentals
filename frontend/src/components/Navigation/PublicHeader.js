import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Avatar,
  InputBase,
  alpha,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Language,
  Menu as MenuIcon,
  AccountCircle,
} from '@mui/icons-material';
import logoImage from '../../assets/images/er13.png';

const PublicHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const path = location.pathname.includes('airbnb') ? '/airbnb' : '/rentals';
      navigate(`${path}?search=${searchValue}`);
    }
  };

  const isAirbnb = location.pathname.includes('airbnb');

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #f1f1f1',
        py: 1,
        zIndex: 1100,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: 64, md: 80 } }}>
          
          {/* Logo - Extreme Left */}
          <Box 
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', flex: { xs: 1, md: '0 0 auto' } }} 
            onClick={() => navigate('/')}
          >
            <Avatar
              src={logoImage}
              alt="CarryIT Logo"
              sx={{ width: 40, height: 40, borderRadius: '10px' }}
              variant="rounded"
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 900, 
                color: '#ff385c', // Iconic Airbnb-like brand color for logo
                display: { xs: 'none', lg: 'block' },
                fontSize: '1.4rem',
                letterSpacing: '-0.03em'
              }}
            >
              CarryIT
            </Typography>
          </Box>

          {/* Search Bar - Centered Pill */}
          {!isMobile && (
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: 400,
                borderRadius: '40px',
                border: '1px solid #DDD',
                px: 2,
                py: 0.5,
                boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.2s ease',
                '&:hover': { boxShadow: '0 2px 4px rgba(0,0,0,0.18)' },
                cursor: 'pointer'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 800, px: 2, borderRight: '1px solid #DDD', color: '#222' }}>
                {isAirbnb ? 'Anywhere' : 'Uganda'}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, px: 2, borderRight: '1px solid #DDD', color: '#222' }}>
                Any week
              </Typography>
              <InputBase
                placeholder="Search stays"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearch}
                sx={{ ml: 2, flex: 1, fontSize: '0.9rem', fontWeight: 500 }}
              />
              <IconButton 
                size="small" 
                sx={{ bgcolor: '#ff385c', color: 'white', '&:hover': { bgcolor: '#e31c5f' }, p: 1 }}
                onClick={() => navigate(`${isAirbnb ? '/airbnb' : '/rentals'}?search=${searchValue}`)}
              >
                <SearchIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Paper>
          )}

          {/* Right Side Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: { xs: 0, md: '0 0 auto' }, justifyContent: 'flex-end' }}>
            {!isMobile && (
              <>
                <Button 
                  onClick={() => navigate('/rentals')}
                  sx={{ color: '#222', fontWeight: 800, textTransform: 'none', borderRadius: '20px', px: 2, '&:hover': { bgcolor: '#F7F7F7' } }}
                >
                  Rentals
                </Button>
                <Button 
                  onClick={() => navigate('/airbnb')}
                  sx={{ color: '#222', fontWeight: 800, textTransform: 'none', borderRadius: '20px', px: 2, '&:hover': { bgcolor: '#F7F7F7' } }}
                >
                  Airbnb
                </Button>
                <IconButton sx={{ color: '#222' }}><Language sx={{ fontSize: 20 }} /></IconButton>
              </>
            )}

            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                border: '1px solid #DDD',
                borderRadius: '30px',
                p: '5px 5px 5px 12px',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s ease',
                '&:hover': { boxShadow: '0 2px 4px rgba(0,0,0,0.18)' }
              }}
              onClick={() => navigate('/login')}
            >
              <MenuIcon sx={{ fontSize: 18, color: '#222' }} />
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#717171' }}>
                <AccountCircle sx={{ fontSize: 32 }} />
              </Avatar>
            </Paper>
          </Box>
        </Toolbar>
        
        {/* Mobile Search Bar */}
        {isMobile && (
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: '40px',
              border: '1px solid #DDD',
              mb: 2,
              px: 2,
              py: 1,
              boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
            }}
          >
            <SearchIcon sx={{ color: '#222', mr: 2 }} />
            <InputBase
              placeholder="Search stays in Uganda"
              fullWidth
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
              sx={{ fontWeight: 600, fontSize: '0.9rem' }}
            />
          </Paper>
        )}
      </Container>
    </AppBar>
  );
};

export default PublicHeader;
