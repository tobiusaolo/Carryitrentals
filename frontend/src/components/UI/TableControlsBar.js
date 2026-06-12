import React from 'react';
import { Box, TextField, InputAdornment, Typography, Chip } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { colors, tableToolbarSx } from '../../theme/designTokens';

/**
 * Table toolbar — count, search, actions. Keeps copy minimal.
 */
const TableControlsBar = ({
  title,
  subtitle,
  totalCount,
  filteredCount,
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  searchable = true,
  toolbar,
  children,
}) => {
  const showBar = title || subtitle || toolbar || searchable || children || totalCount != null;

  if (!showBar) return null;

  const count =
    filteredCount != null && totalCount != null && filteredCount !== totalCount
      ? filteredCount
      : totalCount;

  return (
    <Box sx={{ ...tableToolbarSx, flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: '1 1 auto' }}>
        {title && (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: colors.text, letterSpacing: '-0.01em' }}
          >
            {title}
          </Typography>
        )}
        {count != null && (
          <Chip
            size="small"
            label={count}
            sx={{
              height: 22,
              fontSize: '0.6875rem',
              fontWeight: 700,
              bgcolor: colors.surfaceMuted,
              color: colors.textMuted,
              border: `1px solid ${colors.border}`,
            }}
          />
        )}
        {subtitle && (
          <Typography variant="caption" sx={{ color: colors.textMuted, display: { xs: 'none', md: 'block' } }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
          flex: '0 1 auto',
          justifyContent: 'flex-end',
        }}
      >
        {searchable && onSearchChange && (
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              minWidth: { xs: '100%', sm: 200 },
              maxWidth: 280,
              '& .MuiOutlinedInput-root': {
                borderRadius: `${8}px`,
                bgcolor: colors.surfaceMuted,
                fontSize: '0.8125rem',
                height: 36,
                '& fieldset': { borderColor: colors.border },
                '&:hover fieldset': { borderColor: colors.borderStrong },
                '&.Mui-focused fieldset': { borderColor: colors.textMuted },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: colors.textMuted }} />
                </InputAdornment>
              ),
            }}
          />
        )}
        {toolbar}
        {children}
      </Box>
    </Box>
  );
};

export default TableControlsBar;
