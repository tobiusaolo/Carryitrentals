import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Fade,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import {
  Home as HomeIcon,
} from '@mui/icons-material';
import axios from 'axios';
import SocialMediaFloatButtons from '../../components/SocialMediaFloatButtons';
import Footer from '../../components/Footer';
import PublicHeader from '../../components/Navigation/PublicHeader';
import PropertyCard from '../../components/UI/PropertyCard';
import { useViewerCurrency } from '../../contexts/ViewerCurrencyContext';
import { colors } from '../../theme/designTokens';
import {
  AIRBNB_PROPERTY_TYPE_OPTIONS,
  getAirbnbPropertyTypeLabel,
  normalizeAirbnbPropertyType,
} from '../../constants/airbnb';
import EmptyState from '../../components/UI/EmptyState';
import { SearchOff as SearchOffIcon } from '@mui/icons-material';
import { API_BASE_URL } from '../../config/api';

const PublicAirbnb = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [airbnbs, setAirbnbs] = useState([]);
  const [filteredAirbnbs, setFilteredAirbnbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { viewerCountry, displayCurrency } = useViewerCurrency();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const typeFilter = searchParams.get('type') || '';

  useEffect(() => {
    loadAirbnbs();
  }, [typeFilter]);

  useEffect(() => {
    applyFilters();
  }, [airbnbs, searchQuery, typeFilter]);

  const loadAirbnbs = async () => {
    try {
      setLoading(true);
      const params = typeFilter ? { property_type: normalizeAirbnbPropertyType(typeFilter) } : {};
      const response = await axios.get(`${API_BASE_URL}/airbnb/public`, { params });
      
      const airbnbsWithImages = response.data.map(airbnb => {
        airbnb.property_type = normalizeAirbnbPropertyType(airbnb.property_type);
        if (airbnb.images && typeof airbnb.images === 'string') {
          airbnb.images = airbnb.images.split('|||IMAGE_SEPARATOR|||').filter(img => img.trim());
        } else if (!airbnb.images) {
          airbnb.images = [];
        }
        return airbnb;
      });
      
      setAirbnbs(airbnbsWithImages);
      setFilteredAirbnbs(airbnbsWithImages);
    } catch (err) {
      console.error('Error loading Airbnbs:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = airbnbs;

    if (searchQuery) {
      filtered = filtered.filter(airbnb => 
        airbnb.title?.toLowerCase().includes(searchQuery) ||
        airbnb.location?.toLowerCase().includes(searchQuery) ||
        airbnb.description?.toLowerCase().includes(searchQuery) ||
        getAirbnbPropertyTypeLabel(airbnb.property_type).toLowerCase().includes(searchQuery)
      );
    }

    if (typeFilter) {
      const normalized = normalizeAirbnbPropertyType(typeFilter);
      filtered = filtered.filter((a) => a.property_type === normalized);
    }

    setFilteredAirbnbs(filtered);
  };

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />

      <Container maxWidth="xl" sx={{ py: 3, flex: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: colors.text }}>
          {loading ? 'Loading…' : `${filteredAirbnbs.length} short stay${filteredAirbnbs.length === 1 ? '' : 's'}`}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textMuted, mb: 2 }}>
          {viewerCountry} · Prices in {displayCurrency}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 3 }}>
          <Chip
            label="All types"
            onClick={() => navigate('/airbnb' + (searchQuery ? `?search=${searchParams.get('search')}` : ''))}
            color={!typeFilter ? 'primary' : 'default'}
            variant={!typeFilter ? 'filled' : 'outlined'}
          />
          {AIRBNB_PROPERTY_TYPE_OPTIONS.slice(0, 8).map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              onClick={() => {
                const q = new URLSearchParams(location.search);
                q.set('type', opt.value);
                navigate(`/airbnb?${q.toString()}`);
              }}
              color={typeFilter === opt.value ? 'primary' : 'default'}
              variant={typeFilter === opt.value ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
            <CircularProgress sx={{ color: '#ff385c' }} thickness={5} size={60} />
          </Box>
        ) : filteredAirbnbs.length === 0 ? (
          <EmptyState
            icon={SearchOffIcon}
            title="No stays found"
            description="Try a different search."
            actionLabel="View all"
            onAction={() => navigate('/airbnb')}
          />
        ) : (
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {filteredAirbnbs.map((airbnb, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={airbnb.id}>
                <Fade in={true} timeout={300 + (index * 50)}>
                  <Box>
                    <PropertyCard
                      property={{
                        ...airbnb,
                        rental_price: airbnb.price_per_night,
                        price_per_night: airbnb.price_per_night,
                      }}
                      variant="airbnb"
                      onClick={() => navigate(`/airbnb/${airbnb.id}`)}
                    />
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Footer />
      <SocialMediaFloatButtons />
    </Box>
  );
};

export default PublicAirbnb;
