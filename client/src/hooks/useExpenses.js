import { useState, useEffect, useCallback } from 'react';
import { api } from '../api.js';
import { useDebounce } from './useDebounce.js';
import { useAsync } from './useAsync.js';

const DEFAULT_PAGE_SIZE = 8;
const EMPTY = { items: [], total: 0, sum: 0, page: 1, totalPages: 1 };

/**
 * Owns the expense-list state: search (debounced), category filter and
 * pagination. Returns the current page of data plus the controls the UI
 * needs, so page components stay declarative.
 */
export function useExpenses(pageSize = DEFAULT_PAGE_SIZE) {
  const [search, setSearchRaw] = useState('');
  const [category, setCategoryRaw] = useState('All');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { data, loading, error, refetch } = useAsync(
    () => api.listExpenses({ search: debouncedSearch, category, page, limit: pageSize }),
    [debouncedSearch, category, page, pageSize]
  );

  // Any filter change should reset us to the first page.
  const setSearch = useCallback((value) => {
    setSearchRaw(value);
    setPage(1);
  }, []);
  const setCategory = useCallback((value) => {
    setCategoryRaw(value);
    setPage(1);
  }, []);

  // If a deletion empties the last page, step back to a valid one.
  useEffect(() => {
    if (data && page > data.totalPages) setPage(data.totalPages);
  }, [data, page]);

  const result = data || EMPTY;

  return {
    ...result,
    loading,
    error,
    refetch,
    search,
    setSearch,
    category,
    setCategory,
    page,
    setPage,
    pageSize,
  };
}
