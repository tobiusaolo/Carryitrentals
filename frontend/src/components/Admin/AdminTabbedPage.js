import React from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import { colors, layout } from '../../theme/designTokens';

/**
 * Standard admin tabbed layout — tabs in a bordered panel below page actions.
 */
export default function AdminTabbedPage({ tabs = [], activeTab = 0, onTabChange, children, sx }) {
  return (
    <Box sx={sx}>
      <Paper
        elevation={0}
        sx={{
          mb: 2.5,
          borderRadius: `${layout.radius.md}px`,
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={onTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            borderBottom: `1px solid ${colors.border}`,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              minHeight: 48,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab key={tab.id || index} label={tab.label} icon={tab.icon} iconPosition="start" />
          ))}
        </Tabs>
      </Paper>
      {children}
    </Box>
  );
}
