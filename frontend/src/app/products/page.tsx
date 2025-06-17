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
}

interface Category {
  id: number;
  name: string;
  slug: string;
  product_count: number;
}

interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
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
      const response = await productsAPI.getProducts(filters);
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const response = await productsAPI.getCategories();
      // Ensure we always set an array, even if the response is undefined/null
      setCategories(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesError('Failed to load categories. Please try again later.');
      setCategories([]); // Ensure categories is always an array
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key: keyof typeof filters, value: string | number) => {
    setFilters(prev => {
      // Convert value to number for numeric fields
      const convertedValue = (key === 'page' || key === 'limit') 
        ? Number(value) 
        : value;
      
      return {
        ...prev,
        [key]: convertedValue,
        page: key !== 'page' ? 1 : Number(convertedValue), // Explicitly convert to number
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
                <label htmlFor="category" className="form-label">Category</label>
                <select
                  id="category"
                  className="form-select"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categoriesLoading ? (
                    <option disabled>Loading categories...</option>
                  ) : categoriesError ? (
                    <option disabled>{categoriesError}</option>
                  ) : categories.length === 0 ? (
                    <option disabled>No categories available</option>
                  ) : (
                    categories.map(category => (
                      <option key={category.id} value={category.slug}>
                        {category.name} ({category.product_count})
                      </option>
                    ))
                  )}
                </select>
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
                Showing {products.length} of {pagination.totalItems} products
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
          ) : products.length > 0 ? (
            <>
              <div className="row">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

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
