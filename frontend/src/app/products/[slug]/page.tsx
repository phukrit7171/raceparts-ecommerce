'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { productsAPI, showAlert } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

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

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const { slug } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setError('Product slug is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get the product by slug
        const response = await productsAPI.getProductBySlug(Array.isArray(slug) ? slug[0] : slug);
        
        if (response.data?.success && response.data.data) {
          setProduct(response.data.data);
        } else {
          throw new Error(response.data?.message || 'Product not found');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load product';
        console.error('Error fetching product:', errorMessage);
        setError(errorMessage);
        showAlert.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, router]);

  const handleAddToCart = async () => {
    if (!user) {
      showAlert.error('Please login to add items to cart');
      router.push('/auth/login');
      return;
    }

    if (!product) return;

    await addToCart(product.id, quantity);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5">
        <div className="row">
          <div className="col-12 text-center">
            <h2>Product Not Found</h2>
            <p className="text-muted">
              The product you&apos;re looking for doesn&apos;t exist or may have been removed.
            </p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => router.push('/products')}
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="container py-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <button
              className="btn btn-link p-0 text-decoration-none"
              onClick={() => router.push('/')}
            >
              Home
            </button>
          </li>
          <li className="breadcrumb-item">
            <button
              className="btn btn-link p-0 text-decoration-none"
              onClick={() => router.push('/products')}
            >
              Products
            </button>
          </li>
          {product.category && (
            <li className="breadcrumb-item">
              <button
                className="btn btn-link p-0 text-decoration-none"
                onClick={() => router.push(`/products?category=${product.category?.slug}`)}
              >
                {product.category.name}
              </button>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="row">
        {/* Product Image */}
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm">
            {product.images && product.images.length > 0 ? (
              <div className="position-relative w-100" style={{ height: '400px' }}>
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="rounded"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            ) : (
              <div
                className="card-img-top bg-light d-flex align-items-center justify-content-center rounded"
                style={{ height: '400px' }}
              >
                <div className="text-center">
                  <div className="display-1 text-muted">🏎️</div>
                  <p className="text-muted">No Image Available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="col-lg-6">
          <div className="mb-3">
            {product.category && (
              <span className="badge bg-secondary mb-2">
                {product.category.name}
              </span>
            )}
            <h1 className="display-5 fw-bold">{product.name}</h1>
          </div>

          <div className="mb-4">
            <span className="display-6 text-primary fw-bold">
              {formatPrice(product.price)}
            </span>
          </div>

          {product.description && (
            <div className="mb-4">
              <h5>Description</h5>
              <p className="text-muted">{product.description}</p>
            </div>
          )}

          {/* Stock Status */}
          <div className="mb-4">
            <h6>Availability</h6>
            {product.stock_quantity !== undefined ? (
              <div>
                {product.stock_quantity > 0 ? (
                  <span className="badge bg-success">
                    ✅ In Stock ({product.stock_quantity} available)
                  </span>
                ) : (
                  <span className="badge bg-danger">❌ Out of Stock</span>
                )}
                {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                  <small className="text-warning d-block mt-1">
                    ⚠️ Only {product.stock_quantity} left in stock!
                  </small>
                )}
              </div>
            ) : (
              <span className="badge bg-success">✅ Available</span>
            )}
          </div>

          {/* Quantity and Add to Cart */}
          <div className="mb-4">
            <div className="row align-items-end">
              <div className="col-md-4 mb-3">
                <label htmlFor="quantity" className="form-label">
                  Quantity
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="quantity"
                  min="1"
                  max={product.stock_quantity || 999}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  disabled={product.stock_quantity === 0}
                />
              </div>
              <div className="col-md-8 mb-3">
                <button
                  className="btn btn-primary btn-lg w-100"
                  onClick={handleAddToCart}
                  disabled={
                    !user ||
                    (product.stock_quantity !== undefined && product.stock_quantity <= 0)
                  }
                >
                  {!user
                    ? '🔒 Login to Purchase'
                    : product.stock_quantity === 0
                    ? '❌ Out of Stock'
                    : '🛒 Add to Cart'}
                </button>
              </div>
            </div>
          </div>

          {!user && (
            <div className="alert alert-info">
              <strong>Want to purchase this item?</strong>
              <br />
              <button
                className="btn btn-link p-0"
                onClick={() => router.push('/auth/login')}
              >
                Login
              </button>{' '}
              or{' '}
              <button
                className="btn btn-link p-0"
                onClick={() => router.push('/auth/register')}
              >
                create an account
              </button>{' '}
              to start shopping.
            </div>
          )}

          {/* Product Features */}
          <div className="card bg-light border-0">
            <div className="card-body">
              <h6 className="card-title">Why Choose RaceParts?</h6>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">🚀 High-performance components</li>
                <li className="mb-2">🛡️ Quality guaranteed</li>
                <li className="mb-2">🚚 Fast shipping</li>
                <li className="mb-0">🔧 Expert support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}