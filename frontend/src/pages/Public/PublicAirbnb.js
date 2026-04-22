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
} from '@mui/material';
import {
  Home as HomeIcon,
} from '@mui/icons-material';
import axios from 'axios';
import SocialMediaFloatButtons from '../../components/SocialMediaFloatButtons';
import Footer from '../../components/Footer';
import PublicHeader from '../../components/Navigation/PublicHeader';
import CategoryBar from '../../components/Navigation/CategoryBar';
import PropertyCard from '../../components/UI/PropertyCard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://carryit-backend-su8h.onrender.com/api/v1';

const PublicAirbnb = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [airbnbs, setAirbnbs] = useState([]);
  const [filteredAirbnbs, setFilteredAirbnbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Units');

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  useEffect(() => {
    loadAirbnbs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activeCategory, airbnbs, searchQuery]);

  const loadAirbnbs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/airbnb/public`);
      
      const airbnbsWithImages = response.data.map(airbnb => {
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

    // Apply category filter
    if (activeCategory !== 'All Units') {
      filtered = filtered.filter(airbnb => {
        const type = (airbnb.property_type || airbnb.unit_type || '').toLowerCase();
        const cat = activeCategory.toLowerCase();
        
        if (cat === 'apartments') return type.includes('apartment') || type.includes('flat');
        if (cat === 'studios') return type.includes('studio') || type.includes('single');
        if (cat === 'one bedroom') return (airbnb.bedrooms || 0) === 1;
        if (cat === 'two bedroom') return (airbnb.bedrooms || 0) === 2;
        if (cat === 'penthouses') return type.includes('penthouse');
        if (cat === 'villas') return type.includes('villa') || type.includes('mansion');
        
        return true;
      });
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(airbnb => 
        airbnb.title?.toLowerCase().includes(searchQuery) ||
        airbnb.location?.toLowerCase().includes(searchQuery) ||
        airbnb.description?.toLowerCase().includes(searchQuery)
      );
    }

    setFilteredAirbnbs(filtered);
  };

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      <CategoryBar 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      <Container maxWidth="xl" sx={{ py: 4, flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
            <CircularProgress sx={{ color: '#ff385c' }} thickness={5} size={60} />
          </Box>
        ) : filteredAirbnbs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 15 }}>
            <HomeIcon sx={{ fontSize: 80, color: '#d1d5db', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 800 }}>
              No stays found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Try adjusting your search or category filters.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => {
                setActiveCategory('All Units');
                navigate('/airbnb');
              }}
              sx={{ borderRadius: '12px', px: 4, bgcolor: '#ff385c', '&:hover': { bgcolor: '#e31c5f' } }}
            >
              Clear filters
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredAirbnbs.map((airbnb, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={airbnb.id}>
                <Fade in={true} timeout={300 + (index * 50)}>
                  <Box>
                    <PropertyCard 
                      property={{...airbnb, rental_price: airbnb.price_per_night}} 
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
