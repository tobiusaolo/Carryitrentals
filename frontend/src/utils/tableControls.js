/**
 * Client-side search, filter, and pagination helpers for tables.
 */

export const filterTableRows = (rows, query, columns = []) => {
  if (!query?.trim()) return rows;
  const q = query.toLowerCase().trim();

  return rows.filter((row) =>
    columns.some((col) => {
      let val;
      if (typeof col.getSearchValue === 'function') {
        val = col.getSearchValue(row);
      } else if (typeof col.searchValue === 'function') {
        val = col.searchValue(row);
      } else if (col.id) {
        val = row[col.id];
      }
      if (val == null) return false;
      if (typeof val === 'object') {
        try {
          return JSON.stringify(val).toLowerCase().includes(q);
        } catch {
          return false;
        }
      }
      return String(val).toLowerCase().includes(q);
    })
  );
};

export const paginateRows = (rows, page, rowsPerPage) => {
  const start = page * rowsPerPage;
  return rows.slice(start, start + rowsPerPage);
};

export const getPageRangeLabel = (page, rowsPerPage, total) => {
  if (total === 0) return { start: 0, end: 0 };
  const start = page * rowsPerPage + 1;
  const end = Math.min((page + 1) * rowsPerPage, total);
  return { start, end };
};
