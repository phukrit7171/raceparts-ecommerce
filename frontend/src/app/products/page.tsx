'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { productsAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  slug: string;
  images: string[];
  stock_quantity?: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface BaseCategory {
  id: number;
  name: string;
  slug: string;
}

interface Category extends BaseCategory {
  product_count: number;
}

interface CategoryApiResponse extends BaseCategory {
  product_count?: number;
  productCount?: number;
}

interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export default function ProductsPage() {
  const [productsByCategory, setProductsByCategory] = useState<{[key: string]: Product[]}>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sort: 'createdAt',
    order: 'DESC',
    page: 1,
    limit: 12,
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Apply filters, including category if selected
      const apiFilters = {
        ...filters,
        limit: filters.limit,
        page: filters.page,
        search: filters.search,
        sort: filters.sort,
        order: filters.order,
        category: filters.category || undefined // Send undefined instead of empty string
      };
      
      const response = await productsAPI.getProducts(apiFilters);
      const products = response.data.data;
      
      // If a category is selected, just show those products without grouping
      if (filters.category) {
        setProductsByCategory({
          [filters.category]: products
        });
      } else {
        // Group products by category only when no category filter is applied
        const grouped: {[key: string]: Product[]} = {};
        
        // Add uncategorized products
        const uncategorized = products.filter((p: Product) => !p.category);
        if (uncategorized.length > 0) {
          grouped['uncategorized'] = uncategorized;
        }
        
        // Group by category
        products.forEach((product: Product) => {
          if (product.category) {
            const categorySlug = product.category.slug;
            if (!grouped[categorySlug]) {
              grouped[categorySlug] = [];
            }
            grouped[categorySlug].push(product);
          }
        });
        
        // Remove empty categories
        Object.keys(grouped).forEach(key => {
          if (grouped[key].length === 0) {
            delete grouped[key];
          }
        });
        
        setProductsByCategory(grouped);
      }
      
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    const formatCategoryName = (name: string | undefined): string => {
      if (!name) return 'Uncategorized';
      
      // Clean up the name by removing extra whitespace, newlines, and non-printable characters
      return name
        .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n/g, ' ')  // Replace newlines with space
        .trim()
        .split(' ')
        .filter(word => word.length > 0) // Remove empty strings
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      console.log('Fetching categories...');
      
      const response = await productsAPI.getCategories();
      console.log('Categories API response:', response);
      
      // Handle different possible response structures
      let categoriesData: CategoryApiResponse[] = [];
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      // Case 1: Response has a data array
      if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } 
      // Case 2: Response has a data object with a data array
      else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
        categoriesData = response.data.data;
      }
      
      console.log('Raw categories data:', categoriesData);
      
      // Process and clean up the categories
      const processedCategories: Category[] = categoriesData
        .filter((cat): cat is CategoryApiResponse => {
          const isValid = Boolean(cat?.id);
          if (!isValid) {
            console.warn('Invalid category data:', cat);
          }
          return isValid;
        })
        .map(cat => {
          const name = formatCategoryName(cat.name || '');
          return {
            id: cat.id,
            name,
            slug: cat.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            product_count: cat.product_count || cat.productCount || 0
          };
        });
      
      console.log('Processed categories:', processedCategories);
      
      if (processedCategories.length === 0) {
        console.warn('No valid categories found in the response');
      }
      
      setCategories(processedCategories);
      return processedCategories;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load categories';
      console.error('Error fetching categories:', error);
      setCategoriesError(`Error: ${errorMessage}. Please try again later.`);
      setCategories([]);
      return [];
    } finally {
      setCategoriesLoading(false);
    }
  }, []); // No dependencies needed as formatCategoryName is now inside the callback

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key: keyof typeof filters, value: string | number) => {
    setFilters(prev => {
      // Convert value to number for numeric fields
      const convertedValue = (key === 'page' || key === 'limit') 
        ? Number(value) 
        : value;
      
      // Reset to first page when filters change, except for page changes
      const shouldResetPage = key !== 'page';
      
      return {
        ...prev,
        [key]: convertedValue,
        page: shouldResetPage ? 1 : Number(convertedValue),
      };
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const generatePagination = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;

    // Always show first page
    if (totalPages > 0) {
      pages.push(1);
    }

    // Add ellipsis if needed
    if (currentPage > 3) {
      pages.push('...');
    }

    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <h1 className="display-5 fw-bold mb-4">Products</h1>
        </div>
      </div>

      <div className="row">
        {/* Filters Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Filters</h5>

              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="mb-3">
                <label htmlFor="search" className="form-label">Search</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    id="search"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search products..."
                  />
                  <button className="btn btn-outline-secondary" type="submit">
                    🔍
                  </button>
                </div>
              </form>

              {/* Categories */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label htmlFor="category" className="form-label mb-0">Category</label>
                  {!categoriesLoading && categoriesError && (
                    <button 
                      className="btn btn-sm btn-link text-danger p-0"
                      onClick={fetchCategories}
                      title="Retry loading categories"
                    >
                      Retry
                    </button>
                  )}
                </div>
                <div className="position-relative">
                  <select
                    id="category"
                    className={`form-select ${categoriesError ? 'is-invalid' : ''}`}
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    disabled={categoriesLoading}
                    aria-label="Select category"
                  >
                    <option value="">All Categories</option>
                    {categoriesLoading ? (
                      <option disabled>Loading categories...</option>
                    ) : categoriesError ? (
                      <option disabled value="">Failed to load categories</option>
                    ) : categories.length === 0 ? (
                      <option disabled>No categories available</option>
                    ) : (
                      [
                        ...categories
                          .filter(cat => cat.product_count > 0) // Only show categories with products
                          .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
                          .map(category => (
                            <option key={category.id} value={category.slug}>
                              {category.name} ({category.product_count})
                            </option>
                          ))
                      ]
                    )}
                  </select>
                  {categoriesLoading && (
                    <div className="position-absolute end-0 top-50 translate-middle-y me-2">
                      <div className="spinner-border spinner-border-sm text-secondary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}
                </div>
                {categoriesError && (
                  <div className="invalid-feedback d-block">
                    {categoriesError}
                  </div>
                )}
                {!categoriesLoading && categories.length === 0 && !categoriesError && (
                  <div className="form-text text-muted">
                    No categories found. Products will be listed as uncategorized.
                  </div>
                )}
              </div>

              {/* Sort */}
              <div className="mb-3">
                <label htmlFor="sort" className="form-label">Sort By</label>
                <select
                  id="sort"
                  className="form-select"
                  value={`${filters.sort}-${filters.order}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    handleFilterChange('sort', sort);
                    handleFilterChange('order', order);
                  }}
                >
                  <option value="createdAt-DESC">Newest First</option>
                  <option value="createdAt-ASC">Oldest First</option>
                  <option value="name-ASC">Name A-Z</option>
                  <option value="name-DESC">Name Z-A</option>
                  <option value="price-ASC">Price Low to High</option>
                  <option value="price-DESC">Price High to Low</option>
                </select>
              </div>

              {/* Items per page */}
              <div className="mb-3">
                <label htmlFor="limit" className="form-label">Items per page</label>
                <select
                  id="limit"
                  className="form-select"
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="col-lg-9">
          {/* Results Info */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <p className="mb-0">
                Showing {Object.values(productsByCategory).reduce((total, products) => total + products.length, 0)} of {pagination.totalItems} products
                {filters.search && ` for "${filters.search}"`}
                {filters.category && ` in category "${categories.find(c => c.slug === filters.category)?.name}"`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="row">
              {[...Array(filters.limit)].map((_, index) => (
                <div key={index} className="col-lg-4 col-md-6 mb-4">
                  <div className="card h-100">
                    <div
                      className="card-img-top bg-secondary placeholder"
                      style={{ height: '200px' }}
                    ></div>
                    <div className="card-body">
                      <div className="placeholder-glow">
                        <span className="placeholder col-6"></span>
                        <span className="placeholder col-4"></span>
                        <span className="placeholder col-8"></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(productsByCategory).length > 0 ? (
            <>
              {Object.entries(productsByCategory).map(([categorySlug, categoryProducts]) => {
                // Get the first product's category name for this group
                const firstProduct = categoryProducts[0];
                let categoryName = 'Other Products';
                
                // If we have a valid category on the product, use its name
                if (firstProduct.category?.name) {
                  // Clean up any potential whitespace or newlines in the category name
                  categoryName = firstProduct.category.name.trim();
                } else if (categorySlug !== 'uncategorized') {
                  // Try to find the category in the categories list
                  const category = categories.find(c => c.slug === categorySlug);
                  if (category?.name) {
                    categoryName = category.name.trim();
                  }
                }
                
                return (
                  <div key={categorySlug} className="mb-5">
                    <h2 className="h4 mb-3 border-bottom pb-2">
                      {categoryName} 
                      <span className="badge bg-secondary ms-2">
                        {categoryProducts.length} {categoryProducts.length === 1 ? 'item' : 'items'}
                      </span>
                    </h2>
                    <div className="row">
                      {categoryProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav aria-label="Product pagination">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    
                    {generatePagination().map((page, index) => (
                      <li key={index} className={`page-item ${
                        page === pagination.currentPage ? 'active' : ''
                      } ${page === '...' ? 'disabled' : ''}`}>
                        {page === '...' ? (
                          <span className="page-link">...</span>
                        ) : (
                          <button
                            className="page-link"
                            onClick={() => handleFilterChange('page', page)}
                          >
                            {page}
                          </button>
                        )}
                      </li>
                    ))}
                    
                    <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <div className="display-1 text-muted mb-3">🔍</div>
              <h4>No products found</h4>
              <p className="text-muted">
                {filters.search || filters.category
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No products are currently available.'}
              </p>
              {(filters.search || filters.category) && (
                <button
                  className="btn btn-primary"
                  onClick={() => setFilters({
                    ...filters,
                    search: '',
                    category: '',
                    page: 1,
                  })}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
