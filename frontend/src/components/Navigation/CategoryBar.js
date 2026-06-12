import React from 'react';
import { Box, Container, Chip } from '@mui/material';
import { colors } from '../../theme/designTokens';

const categories = [
  'All Units',
  'Apartments',
  'One Bedroom',
  'Two Bedroom',
  'Villas',
  'Furnished',
];

const CategoryBar = ({ activeCategory, onCategoryChange }) => (
  <Box
    sx={{
      bgcolor: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      position: 'sticky',
      top: 64,
      zIndex: 1000,
    }}
  >
    <Container maxWidth="xl" sx={{ py: 1.5, display: 'flex', gap: 1, overflowX: 'auto', flexWrap: 'nowrap' }}>
      {categories.map((label) => {
        const selected = activeCategory === label;
        return (
          <Chip
            key={label}
            label={label}
            onClick={() => onCategoryChange(label)}
            sx={{
              fontWeight: selected ? 700 : 500,
              fontSize: '0.8125rem',
              borderRadius: '8px',
              bgcolor: selected ? colors.text : 'transparent',
              color: selected ? '#fff' : colors.textMuted,
              border: selected ? 'none' : `1px solid ${colors.border}`,
              '&:hover': {
                bgcolor: selected ? colors.text : colors.surfaceMuted,
              },
            }}
          />
        );
      })}
    </Container>
  </Box>
);

export default CategoryBar;
