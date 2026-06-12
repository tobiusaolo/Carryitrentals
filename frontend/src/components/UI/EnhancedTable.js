import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Box,
  Checkbox,
  IconButton,
  Collapse,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import TableControlsBar from './TableControlsBar';
import EmptyState from './EmptyState';
import {
  colors,
  tableShellSx,
  tableHeadCellSx,
  tableBodyCellSx,
  tableFooterSx,
  getTableRowSx,
} from '../../theme/designTokens';
import { filterTableRows, paginateRows, getPageRangeLabel } from '../../utils/tableControls';

export const ExpandableTableRow = ({ row, columns, renderExpanded, selected, onSelect, rowIndex = 0 }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow
        hover
        sx={{
          ...getTableRowSx(),
          cursor: 'pointer',
          bgcolor: selected ? `${colors.brand}12` : undefined,
        }}
      >
        {onSelect && (
          <TableCell padding="checkbox" sx={tableBodyCellSx}>
            <Checkbox
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(row.id);
              }}
            />
          </TableCell>
        )}
        {renderExpanded && (
          <TableCell sx={tableBodyCellSx}>
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
        )}
        {columns.map((column) => (
          <TableCell key={column.id} align={column.align || 'left'} sx={{ ...tableBodyCellSx, ...column.sx }}>
            {column.render ? column.render(row) : row[column.id]}
          </TableCell>
        ))}
      </TableRow>
      {renderExpanded && (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columns.length + 2}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ py: 2, px: 2 }}>{renderExpanded(row)}</Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export const EnhancedTable = ({
  columns,
  rows = [],
  defaultOrderBy,
  expandable = false,
  selectable = false,
  onRowClick,
  renderExpanded,
  emptyTitle = 'No records yet',
  emptyDescription = 'There is nothing to show in this table yet.',
  title,
  subtitle,
  searchable = true,
  pageSize: defaultPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
}) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(defaultOrderBy || columns[0]?.id);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
  const [search, setSearch] = useState('');

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(rows.map((row) => row.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]));
  };

  const searchedRows = useMemo(
    () => (searchable ? filterTableRows(rows, search, columns) : rows),
    [rows, search, columns, searchable]
  );

  const sortedRows = useMemo(() => {
    if (!orderBy) return searchedRows;

    const sorted = [...searchedRows].sort((a, b) => {
      const column = columns.find((col) => col.id === orderBy);
      const aValue = column?.getValue ? column.getValue(a) : a[orderBy];
      const bValue = column?.getValue ? column.getValue(b) : b[orderBy];

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [searchedRows, order, orderBy, columns]);

  const paginatedRows = useMemo(
    () => paginateRows(sortedRows, page, rowsPerPage),
    [sortedRows, page, rowsPerPage]
  );

  useEffect(() => {
    setPage(0);
  }, [search, rows.length]);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= sortedRows.length) {
      setPage(0);
    }
  }, [sortedRows.length, page, rowsPerPage]);

  const { start, end } = getPageRangeLabel(page, rowsPerPage, sortedRows.length);
  const isEmpty = rows.length === 0;
  const isFilteredEmpty = rows.length > 0 && sortedRows.length === 0;

  return (
    <Paper sx={tableShellSx}>
      <TableControlsBar
        title={title}
        subtitle={subtitle}
        totalCount={rows.length}
        filteredCount={sortedRows.length}
        search={search}
        onSearchChange={searchable ? setSearch : undefined}
        searchable={searchable}
      />

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox" sx={tableHeadCellSx}>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < rows.length}
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {expandable && <TableCell sx={tableHeadCellSx} />}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sortDirection={orderBy === column.id ? order : false}
                  sx={tableHeadCellSx}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isEmpty || isFilteredEmpty ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)}
                  sx={{ py: 0, border: 'none' }}
                >
                  {isFilteredEmpty ? (
                    <Box sx={{ py: 5, textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                        No matching records
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textMuted, mb: 2 }}>
                        Try a different search term.
                      </Typography>
                      <Button size="small" variant="outlined" onClick={() => setSearch('')}>
                        Clear search
                      </Button>
                    </Box>
                  ) : (
                    <EmptyState compact title={emptyTitle} description={emptyDescription} />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, index) =>
                expandable || selectable ? (
                  <ExpandableTableRow
                    key={row.id}
                    row={row}
                    columns={columns}
                    renderExpanded={renderExpanded}
                    selected={selected.includes(row.id)}
                    onSelect={selectable ? handleSelect : null}
                    rowIndex={page * rowsPerPage + index}
                  />
                ) : (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => onRowClick && onRowClick(row)}
                    sx={{
                      ...getTableRowSx(),
                      cursor: onRowClick ? 'pointer' : 'default',
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align || 'left'}
                        sx={{ ...tableBodyCellSx, ...column.sx }}
                      >
                        {column.render ? column.render(row) : row[column.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={tableFooterSx}>
        <Typography variant="caption" sx={{ color: colors.textMuted, fontWeight: 500 }}>
          {sortedRows.length === 0 ? 'Showing 0 of 0' : `Showing ${start}–${end} of ${sortedRows.length}`}
        </Typography>
        <TablePagination
          component="div"
          count={sortedRows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={pageSizeOptions}
          labelRowsPerPage="Rows"
        />
      </Box>

      {selectable && selected.length > 0 && (
        <Box sx={{ ...tableFooterSx, justifyContent: 'center', borderTop: `1px solid ${colors.border}` }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: colors.text }}>
            {selected.length} item{selected.length > 1 ? 's' : ''} selected
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default EnhancedTable;
