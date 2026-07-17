import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { LangOpsApiClient } from '../../services/api';
import type { GetProductFilters } from '../../types/types';

const client = new LangOpsApiClient();
const DEFAULT_LIMIT = 25; // Define a global fallback constraint

export function UnifiedProductTable() {
  const [localSearch, setLocalSearch] = useState('');

  const [queryParams, setQueryParams] = useState<GetProductFilters>({
    targetLanguage: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    productCode: undefined,
    mediaGroups: undefined,
    search: undefined,
    limit: DEFAULT_LIMIT,
    offset: 0,
    archivedOnly: undefined,
    publishedOnly: undefined,
    unpublishedOnly: undefined,
    excludeDeleted: undefined
  });

  // Fetch data with TanStack Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => client.fetchProducts(queryParams),
    placeholderData: keepPreviousData, 
    staleTime: 5000,
  });

  // Fix signature: forms require React.FormEvent, not ChangeEvent
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryParams((prev) => ({
      ...prev,
      search: localSearch,
      offset: 0, 
    }));
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    setQueryParams((prev) => ({
      ...prev,
      search: undefined,
      offset: 0,
    }));
  };

  if (isLoading) return <div>Loading records...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  const currentLimit = queryParams.limit ?? DEFAULT_LIMIT;
  const currentOffset = queryParams.offset ?? 0;
  
  const hasMoreItems = data ? data.total === currentLimit : false;

  return (
    <div className="table-container">
      
      <form onSubmit={handleSearchSubmit} className="controls" style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search product code..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        <button type="submit">Search</button>
        
        {queryParams.search && (
          <button type="button" onClick={handleClearSearch} style={{ marginLeft: '0.5rem' }}>
            Clear
          </button>
        )}

        <select
          style={{ marginLeft: '1rem' }}
          value={currentLimit}
          onChange={(e) => setQueryParams(prev => ({ ...prev, limit: Number(e.target.value), offset: 0 }))}
        >
          {[10, 25, 50, 100].map(size => (
            <option key={size} value={size}>Show {size}</option>
          ))}
        </select>
      </form>

      <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Product Code</th>
            <th>Target Language</th>
            <th>Date Created</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((product) => (
            <tr key={product.id}>
              <td>{product.trelloData.productCode}</td>
              <td>{product.trelloData.targetLanguage}</td>
              <td>{new Date(product.dateCreated).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button 
          disabled={currentOffset === 0} 
          onClick={() => setQueryParams((prev) => {
            const innerOffset = prev.offset ?? 0;
            const innerLimit = prev.limit ?? DEFAULT_LIMIT;
            return { 
                ...prev, 
                offset: Math.max(0, innerOffset - innerLimit) 
            };
          })}
        >
          Previous Page
        </button>

        <span>
          Showing items starting at index {currentOffset + 1}
        </span>

        <button 
          disabled={!hasMoreItems} 
          onClick={() => setQueryParams((prev) => {
            const innerOffset = prev.offset ?? 0;
            const innerLimit = prev.limit ?? DEFAULT_LIMIT;
            return { 
                ...prev, 
                offset: innerOffset + innerLimit 
            };
          })}
        >
          Next Page
        </button>
      </div>
    </div>
  );
}
