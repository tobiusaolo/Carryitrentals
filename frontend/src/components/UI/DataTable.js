import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography,
  Skeleton,
  Button,
} from '@mui/material';
import EmptyState from './EmptyState';
import TableControlsBar from './TableControlsBar';
import {
  colors,
  tableShellSx,
  tableHeadCellSx,
  tableBodyCellSx,
  tableFooterSx,
  getTableRowSx,
} from '../../theme/designTokens';
import { filterTableRows, paginateRows, getPageRangeLabel } from '../../utils/tableControls';

const LoadingRows = ({ columns, rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRow key={`sk-${i}`}>
        {columns.map((col) => (
          <TableCell key={col.id} sx={tableBodyCellSx}>
            <Skeleton variant="text" width={col.width || `${55 + (i % 3) * 12}%`} height={18} />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

const EmptyBodyRow = ({ columns, children }) => (
  <TableRow>
    <TableCell colSpan={columns.length} sx={{ py: 0, border: 'none' }}>
      {children}
    </TableCell>
  </TableRow>
);

const DataTable = ({
  columns,
  rows = [],
  loading = false,
  title,
  subtitle,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyIcon,
  emptyActionLabel,
  onEmptyAction,
  noResultsTitle = 'No matches',
  noResultsDescription = 'Try another search.',
  pageSize: defaultPageSize = 10,
  pageSizeOptions = [10, 25, 50],
  getRowId = (row) => row.id,
  stickyHeader = true,
  maxHeight = 520,
  dense = false,
  onRowClick,
  toolbar,
  searchable = true,
  searchPlaceholder,
  hidePaginationWhenEmpty = false,
}) => {
  const safeRows = Array.isArray(rows) ? rows : [];

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
  const [search, setSearch] = useState('');

  const filteredRows = useMemo(
    () => (searchable ? filterTableRows(safeRows, search, columns) : safeRows),
    [safeRows, search, columns, searchable]
  );

  const paginatedRows = useMemo(
    () => paginateRows(filteredRows, page, rowsPerPage),
    [filteredRows, page, rowsPerPage]
  );

  useEffect(() => {
    setPage(0);
  }, [search, safeRows.length]);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= filteredRows.length) {
      setPage(0);
    }
  }, [filteredRows.length, page, rowsPerPage]);

  const { start, end } = getPageRangeLabel(page, rowsPerPage, filteredRows.length);
  const isEmpty = !loading && safeRows.length === 0;
  const isFilteredEmpty = !loading && safeRows.length > 0 && filteredRows.length === 0;
  const showPagination = !loading && (!hidePaginationWhenEmpty || filteredRows.length > 0);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
  };

  const renderEmptyContent = () => {
    if (isFilteredEmpty) {
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text, mb: 0.5 }}>
            {noResultsTitle}
          </Typography>
          <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mb: 1.5 }}>
            {noResultsDescription}
          </Typography>
          <Button size="small" variant="outlined" onClick={() => handleSearchChange('')}>
            Clear
          </Button>
        </Box>
      );
    }

    return (
      <EmptyState
        compact
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  };

  return (
    <Paper sx={tableShellSx} elevation={0}>
      <TableControlsBar
        title={title}
        subtitle={subtitle}
        totalCount={safeRows.length}
        filteredCount={filteredRows.length}
        search={search}
        onSearchChange={searchable ? handleSearchChange : undefined}
        searchPlaceholder={searchPlaceholder}
        searchable={searchable}
        toolbar={toolbar}
      />

      <TableContainer sx={{ maxHeight: stickyHeader ? maxHeight : undefined }}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  width={col.width}
                  sx={{ ...tableHeadCellSx, ...(col.headerSx || {}) }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <LoadingRows columns={columns} />
            ) : isEmpty || isFilteredEmpty ? (
              <EmptyBodyRow columns={columns}>{renderEmptyContent()}</EmptyBodyRow>
            ) : (
              paginatedRows.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  hover
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{
                    ...getTableRowSx(),
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      align={col.align || 'left'}
                      sx={{ ...tableBodyCellSx, ...(col.cellSx || {}) }}
                    >
                      {col.render ? col.render(row) : row[col.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && (
        <Box sx={tableFooterSx}>
          <Typography variant="caption" sx={{ color: colors.textMuted, fontWeight: 500, pl: 0.5 }}>
            {filteredRows.length === 0
              ? '0 rows'
              : `${start}–${end} of ${filteredRows.length}`}
          </Typography>
          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={pageSizeOptions}
            labelRowsPerPage="Per page"
          />
        </Box>
      )}
    </Paper>
  );
};

export default DataTable;
