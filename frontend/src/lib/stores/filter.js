import { writable } from 'svelte/store';

// Default filter state
const defaultFilters = {
  category: '',
  minPrice: 0,
  maxPrice: 1000,
  sortBy: 'name',
  sortOrder: 'asc'
};

export const filters = writable(defaultFilters);

// Reset filters to default
export function resetFilters() {
  filters.set(defaultFilters);
}
