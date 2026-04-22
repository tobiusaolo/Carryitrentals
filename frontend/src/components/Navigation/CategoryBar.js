import React from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Container,
  styled,
} from '@mui/material';
import {
  Apartment,
  HomeWork,
  Studio,
  Bed,
  KingBed,
  Villa,
  HolidayVillage,
  Weekend,
  Pool,
  Nature,
  LocalFireDepartment,
  BeachAccess,
} from '@mui/icons-material';

const StyledTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    backgroundColor: '#222',
    height: 2,
  },
  '& .MuiTabs-flexContainer': {
    gap: '32px',
  }
});

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  padding: '12px 0px',
  fontWeight: 600,
  fontSize: '0.75rem',
  color: '#717171',
  opacity: 1,
  transition: 'all 0.2s ease',
  '&:hover': {
    color: '#222',
    '& .tab-icon': { transform: 'scale(1.1)' }
  },
  '&.Mui-selected': {
    color: '#222',
    fontWeight: 800,
  },
}));

const categories = [
  { label: 'All Units', icon: <HomeWork className="tab-icon" /> },
  { label: 'Apartments', icon: <Apartment className="tab-icon" /> },
  { label: 'Studios', icon: <Weekend className="tab-icon" /> },
  { label: 'One Bedroom', icon: <Bed className="tab-icon" /> },
  { label: 'Two Bedroom', icon: <KingBed className="tab-icon" /> },
  { label: 'Penthouses', icon: <Villa className="tab-icon" /> },
  { label: 'Villas', icon: <HolidayVillage className="tab-icon" /> },
  { label: 'Furnished', icon: <Weekend className="tab-icon" /> },
  { label: 'With Pool', icon: <Pool className="tab-icon" /> },
  { label: 'Garden', icon: <Nature className="tab-icon" /> },
  { label: 'Top Rated', icon: <LocalFireDepartment className="tab-icon" /> },
  { label: 'Beachfront', icon: <BeachAccess className="tab-icon" /> },
];

const CategoryBar = ({ activeCategory, onCategoryChange }) => {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #EBEBEB',
        position: 'sticky',
        top: { xs: '56px', sm: '80px' },
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      }}
    >
      <Container maxWidth="xl">
        <StyledTabs
          value={activeCategory}
          onChange={(e, newValue) => onCategoryChange(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-scrollButtons': {
              borderRadius: '50%',
              width: 28,
              height: 28,
              border: '1px solid #DDD',
              alignSelf: 'center',
              bgcolor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&.Mui-disabled': { opacity: 0 },
            }
          }}
        >
          {categories.map((cat, index) => (
            <StyledTab
              key={index}
              icon={cat.icon}
              label={cat.label}
              value={cat.label}
              iconPosition="top"
              sx={{
                '& .tab-icon': { 
                  fontSize: 24, 
                  mb: 0.5,
                  transition: 'transform 0.2s ease',
                  color: activeCategory === cat.label ? '#222' : '#717171'
                }
              }}
            />
          ))}
        </StyledTabs>
      </Container>
    </Box>
  );
};

export default CategoryBar;
