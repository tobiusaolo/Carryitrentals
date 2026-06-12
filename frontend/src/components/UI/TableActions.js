import React, { useState } from 'react';
import { Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { colors } from '../../theme/designTokens';

/**
 * Row actions rendered as a vertical three-dots (kebab) menu.
 * actions: [{ icon, label, onClick, disabled, hidden, danger }]
 *
 * Set `inline` to render as plain icon buttons instead of a menu.
 */
const TableActions = ({ actions = [], inline = false, tooltip = 'Actions' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const visibleActions = actions.filter((a) => a && !a.hidden);
  if (visibleActions.length === 0) return null;

  const handleOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = (e) => {
    e?.stopPropagation?.();
    setAnchorEl(null);
  };

  const handleAction = (e, action) => {
    e.stopPropagation();
    setAnchorEl(null);
    action.onClick?.(e);
  };

  if (inline) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, justifyContent: 'flex-end' }}>
        {visibleActions.map((action) => (
          <Tooltip key={action.label} title={action.label}>
            <span>
              <IconButton
                size="small"
                disabled={action.disabled}
                onClick={(e) => handleAction(e, action)}
                sx={{
                  color: action.danger ? colors.error : colors.textMuted,
                  '&:hover': { color: action.danger ? colors.error : colors.text, bgcolor: colors.surfaceMuted },
                }}
              >
                {action.icon}
              </IconButton>
            </span>
          </Tooltip>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'inline-flex', justifyContent: 'flex-end' }}>
      <Tooltip title={tooltip}>
        <IconButton
          size="small"
          onClick={handleOpen}
          sx={{
            color: colors.textMuted,
            '&:hover': { color: colors.text, bgcolor: colors.surfaceMuted },
          }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 0.5,
            minWidth: 180,
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            '& .MuiMenuItem-root': {
              py: 1,
              px: 1.5,
              fontSize: '0.875rem',
              borderRadius: '8px',
              mx: 0.5,
              my: 0.25,
            },
          },
        }}
      >
        {visibleActions.map((action) => (
          <MenuItem
            key={action.label}
            disabled={action.disabled}
            onClick={(e) => handleAction(e, action)}
            sx={{ color: action.danger ? colors.error : colors.text }}
          >
            {action.icon && (
              <ListItemIcon sx={{ color: action.danger ? colors.error : colors.textMuted, minWidth: 32 }}>
                {action.icon}
              </ListItemIcon>
            )}
            <ListItemText primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {action.label}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default TableActions;
