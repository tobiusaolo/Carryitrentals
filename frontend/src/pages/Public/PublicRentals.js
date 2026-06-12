import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { SearchOff as SearchOffIcon } from '@mui/icons-material';
import EmptyState from '../../components/UI/EmptyState';
import SocialMediaFloatButtons from '../../components/SocialMediaFloatButtons';
import Footer from '../../components/Footer';
import PublicHeader from '../../components/Navigation/PublicHeader';
import CategoryBar from '../../components/Navigation/CategoryBar';
import PropertyCard from '../../components/UI/PropertyCard';
import TrustBanner from '../../components/Public/TrustBanner';
import RentalFiltersBar from '../../components/Public/RentalFiltersBar';
import RequestPropertyDialog from '../../components/Public/RequestPropertyDialog';
import { fetchPublicRentals } from '../../services/api/marketplaceAPI';
import { colors } from '../../theme/designTokens';
import { normalizeRentalStatus, sortUnitsAvailableFirst } from '../../utils/rentalStatus';
import { matchesRentalCategory } from '../../utils/rentalUnitForm';
import { normalizePublicRentalUnit } from '../../services/api/marketplaceAPI';

const emptyFilters = {
  location: '',
  country: '',
  min_price: '',
  max_price: '',
  bedrooms: '',
};

const PublicRentals = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All Units');
  const [filters, setFilters] = useState(emptyFilters);
  const [requestOpen, setRequestOpen] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const normalizeUnits = (data) =>
    sortUnitsAvailableFirst(
      data.map((unit) => ({
        ...normalizePublicRentalUnit(unit),
        status: normalizeRentalStatus(unit.status),
      }))
    );

  const loadRentalUnits = useCallback(async (apiFilters = {}) => {
    try {
      setLoading(true);
      setLoadError(null);
      const params = {};
      if (apiFilters.location) params.location = apiFilters.location;
      if (apiFilters.country) params.country = apiFilters.country;
      if (apiFilters.min_price) params.min_price = Number(apiFilters.min_price);
      if (apiFilters.max_price) params.max_price = Number(apiFilters.max_price);
      if (apiFilters.bedrooms) params.bedrooms = Number(apiFilters.bedrooms);

      const response = await fetchPublicRentals(params);
      const listings = normalizeUnits(response.data || []);
      setUnits(listings);
      setFilteredUnits(listings);
    } catch (err) {
      console.error('Error loading rental units:', err);
      setUnits([]);
      setFilteredUnits([]);
      const detail = err.response?.data?.detail;
      setLoadError(
        typeof detail === 'string'
          ? detail
          : 'Could not load listings. Check that the backend is running and REACT_APP_API_URL points to it.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRentalUnits();
  }, [loadRentalUnits]);

  useEffect(() => {
    let filtered = units;

    if (activeCategory !== 'All Units') {
      filtered = filtered.filter((unit) => matchesRentalCategory(unit, activeCategory));
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (unit) =>
          unit.title?.toLowerCase().includes(searchQuery) ||
          unit.location?.toLowerCase().includes(searchQuery) ||
          unit.description?.toLowerCase().includes(searchQuery)
      );
    }

    setFilteredUnits(filtered);
  }, [activeCategory, units, searchQuery]);

  const handleApplyFilters = () => loadRentalUnits(filters);

  const handleClearFilters = () => {
    setFilters(emptyFilters);
    loadRentalUnits();
  };

  const activeFilterCount = [filters.location, filters.country, filters.min_price, filters.max_price, filters.bedrooms]
    .filter((v) => v !== '' && v != null).length;

  return (
    <Box sx={{ bgcolor: colors.surface, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader onRequestProperty={() => setRequestOpen(true)} />
      <CategoryBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      <Container maxWidth="xl" sx={{ py: 3, flex: 1 }}>
        <TrustBanner />

        {loadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loadError}
          </Alert>
        )}

        <RentalFiltersBar
          filters={filters}
          onChange={setFilters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress sx={{ color: colors.brand }} size={48} />
          </Box>
        ) : filteredUnits.length === 0 ? (
          <EmptyState
            icon={SearchOffIcon}
            title={units.length === 0 ? 'No published listings yet' : 'No homes match'}
            description={
              units.length === 0
                ? 'Only marketplace listings with at least 5 photos and Available/Taken status appear here. Create them under Owner → Units for rent.'
                : activeFilterCount > 0 || activeCategory !== 'All Units' || searchQuery
                  ? 'Try clearing filters or choosing All Units. Listings are filtered by country, price, and category — not by display currency.'
                  : 'Change filters or tell us what you need.'
            }
            actionLabel="Request a home"
            onAction={() => setRequestOpen(true)}
            secondaryActionLabel={activeFilterCount > 0 ? 'Clear filters' : undefined}
            onSecondaryAction={activeFilterCount > 0 ? handleClearFilters : undefined}
          />
        ) : (
          <Grid container spacing={2.5}>
            {filteredUnits.map((unit) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={unit.id}>
                <PropertyCard property={unit} onClick={() => navigate(`/rental/${unit.id}`)} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <RequestPropertyDialog open={requestOpen} onClose={() => setRequestOpen(false)} />
      <Footer />
      <SocialMediaFloatButtons />
    </Box>
  );
};

export default PublicRentals;
