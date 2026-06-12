import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import EmptyState from './EmptyState';
import TableControlsBar from './TableControlsBar';
import { tableShellSx, dataGridPanelSx } from '../../theme/designTokens';

const NoRowsOverlay = ({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  isFiltered,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 280,
      width: '100%',
    }}
  >
    <EmptyState
      compact
      icon={Icon}
      title={isFiltered ? 'No matching records' : title}
      description={
        isFiltered
          ? 'Try a different search term or clear the filter in the toolbar above.'
          : description
      }
      actionLabel={isFiltered ? undefined : actionLabel}
      onAction={isFiltered ? undefined : onAction}
    />
  </Box>
);

/**
 * Professional DataGrid — search toolbar, pagination, empty overlay.
 */
const DataGridPanel = ({
  rows = [],
  columns,
  loading = false,
  height = 520,
  pageSize = 10,
  title,
  subtitle,
  toolbar,
  emptyTitle = 'No records yet',
  emptyDescription = 'There is nothing to show in this table yet.',
  emptyIcon,
  emptyActionLabel,
  onEmptyAction,
  showToolbar = true,
  searchable = true,
  ...rest
}) => (
  <Paper sx={{ ...tableShellSx, width: '100%' }}>
    <TableControlsBar
      title={title}
      subtitle={subtitle}
      totalCount={rows.length}
      filteredCount={rows.length}
      searchable={false}
      toolbar={toolbar}
    />
    <div style={{ height, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize } } }}
        slots={{
          ...(showToolbar && searchable ? { toolbar: GridToolbar } : {}),
          noRowsOverlay: () => (
            <NoRowsOverlay
              title={emptyTitle}
              description={emptyDescription}
              icon={emptyIcon}
              actionLabel={emptyActionLabel}
              onAction={onEmptyAction}
            />
          ),
          noResultsOverlay: () => (
            <NoRowsOverlay
              title={emptyTitle}
              description={emptyDescription}
              icon={emptyIcon}
              isFiltered
            />
          ),
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: searchable,
            quickFilterProps: { debounceMs: 400, placeholder: 'Search records…' },
            printOptions: { disableToolbarButton: true },
            csvOptions: { disableToolbarButton: false },
          },
          pagination: {
            labelRowsPerPage: 'Rows',
          },
        }}
        sx={dataGridPanelSx}
        {...rest}
      />
    </div>
  </Paper>
);

export default DataGridPanel;
