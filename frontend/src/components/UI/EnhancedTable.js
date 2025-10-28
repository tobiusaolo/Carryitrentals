import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Box,
  Checkbox,
  IconButton,
  Collapse,
  Typography,
  Chip
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

// Enhanced Table Row with expandable details
export const ExpandableTableRow = ({ row, columns, renderExpanded, selected, onSelect }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow
        hover
        sx={{
          cursor: 'pointer',
          bgcolor: selected ? 'action.selected' : 'inherit',
          '&:hover': { bgcolor: 'action.hover' },
          transition: 'background-color 0.2s'
        }}
      >
        {onSelect && (
          <TableCell padding="checkbox">
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
          <TableCell>
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
        )}
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.align || 'left'}
            sx={column.sx}
          >
            {column.render ? column.render(row) : row[column.id]}
          </TableCell>
        ))}
      </TableRow>
      {renderExpanded && (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columns.length + 2}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ py: 2 }}>
                {renderExpanded(row)}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

// Enhanced Table with sorting
export const EnhancedTable = ({
  columns,
  rows,
  defaultOrderBy,
  expandable = false,
  selectable = false,
  onRowClick,
  renderExpanded,
  emptyMessage = 'No data available'
}) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(defaultOrderBy || columns[0]?.id);
  const [selected, setSelected] = useState([]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(rows.map(row => row.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const sortedRows = React.useMemo(() => {
    if (!orderBy) return rows;
    
    const sorted = [...rows].sort((a, b) => {
      const column = columns.find(col => col.id === orderBy);
      const aValue = column?.getValue ? column.getValue(a) : a[orderBy];
      const bValue = column?.getValue ? column.getValue(b) : b[orderBy];
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [rows, order, orderBy, columns]);

  return (
    <TableContainer>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {selectable && (
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < rows.length}
                  checked={rows.length > 0 && selected.length === rows.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
            )}
            {expandable && <TableCell />}
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                sortDirection={orderBy === column.id ? order : false}
                sx={{ fontWeight: 600, bgcolor: 'grey.50' }}
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
          {sortedRows.length > 0 ? (
            sortedRows.map((row) => (
              expandable || selectable ? (
                <ExpandableTableRow
                  key={row.id}
                  row={row}
                  columns={columns}
                  renderExpanded={renderExpanded}
                  selected={selected.includes(row.id)}
                  onSelect={selectable ? handleSelect : null}
                />
              ) : (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={column.sx}
                    >
                      {column.render ? column.render(row) : row[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              )
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Selected count indicator */}
      {selectable && selected.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'primary.main',
            color: 'white',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            boxShadow: 4,
            zIndex: 1000
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {selected.length} item{selected.length > 1 ? 's' : ''} selected
          </Typography>
        </Box>
      )}
    </TableContainer>
  );
};

export default EnhancedTable;

