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
  useMediaQuery,
  useTheme,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import logoImage from '../../assets/images/er13.png';
import CurrencyCountryMenu from '../Public/CurrencyCountryMenu';
import PublicMoreMenu from '../Public/PublicMoreMenu';
import { useViewerCurrencyOptional } from '../../contexts/ViewerCurrencyContext';
import { colors, layout } from '../../theme/designTokens';

const PublicHeader = ({ onRequestProperty }) => {
  const { viewerCountry, displayCurrency } = useViewerCurrencyOptional();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchValue, setSearchValue] = useState('');

  const isRentals = !location.pathname.includes('airbnb');
  const browseMode = isRentals ? 'rentals' : 'airbnb';

  const runSearch = () => {
    const path = browseMode === 'airbnb' ? '/airbnb' : '/rentals';
    const q = searchValue.trim();
    navigate(q ? `${path}?search=${encodeURIComponent(q)}` : path);
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') runSearch();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        zIndex: 1100,
      }}
    >
      <Container maxWidth={layout.publicMaxWidth}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', gap: 2, minHeight: 64, py: 0.5 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', flexShrink: 0 }}
            onClick={() => navigate('/rentals')}
          >
            <Avatar src={logoImage} alt="CarryIT" sx={{ width: 36, height: 36, borderRadius: '8px' }} variant="rounded" />
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: colors.brand, display: { xs: 'none', sm: 'block' }, letterSpacing: '-0.02em' }}
            >
              CarryIT
            </Typography>
          </Box>

          {!isMobile && (
            <ToggleButtonGroup
              exclusive
              value={browseMode}
              size="small"
              sx={{
                flexShrink: 0,
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  border: `1px solid ${colors.border}`,
                  px: 2,
                  py: 0.5,
                  '&.Mui-selected': { bgcolor: colors.text, color: '#fff', '&:hover': { bgcolor: '#000' } },
                },
              }}
            >
              <ToggleButton value="rentals" onClick={() => navigate('/rentals')}>
                Rentals
              </ToggleButton>
              <ToggleButton value="airbnb" onClick={() => navigate('/airbnb')}>
                Short stays
              </ToggleButton>
            </ToggleButtonGroup>
          )}

          <Paper
            elevation={0}
            sx={{
              flex: 1,
              maxWidth: 480,
              display: 'flex',
              alignItems: 'center',
              borderRadius: '10px',
              border: `1px solid ${colors.border}`,
              px: 1.5,
              py: 0.25,
            }}
          >
            <InputBase
              placeholder={isMobile ? `Search in ${viewerCountry}` : `Search homes in ${viewerCountry} · ${displayCurrency}`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKey}
              sx={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}
            />
            <IconButton size="small" onClick={runSearch} sx={{ bgcolor: colors.brand, color: '#fff', '&:hover': { bgcolor: colors.brandHover } }}>
              <SearchIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Paper>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
            <CurrencyCountryMenu />
            {!isMobile && onRequestProperty && (
              <Button
                variant="contained"
                size="small"
                onClick={onRequestProperty}
                sx={{
                  bgcolor: colors.brand,
                  fontWeight: 700,
                  borderRadius: `${layout.radius.md}px`,
                  boxShadow: 'none',
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: colors.brandHover, boxShadow: 'none' },
                }}
              >
                Request home
              </Button>
            )}
            <PublicMoreMenu onRequestProperty={isMobile ? onRequestProperty : undefined} />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default PublicHeader;
