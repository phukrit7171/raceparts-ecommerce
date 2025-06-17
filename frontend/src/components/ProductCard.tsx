'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { showAlert } from '@/lib/api';
import styles from './ProductCard.module.css';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  slug: string;
  images: string[];
  stock_quantity?: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showAlert.error('Please login to add items to cart');
      return;
    }

    await addToCart(product.id, 1);
  };

  const formatPrice = (price: number) => {
    const formattedPrice = new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
    return `${formattedPrice} THB`;
  };

  return (
    <div className="col-lg-4 col-md-6 col-sm-12 mb-4">
      <div className="card h-100 shadow-sm border-0">
        <div className="position-relative">
          {product.images && product.images.length > 0 ? (
            <div className={`card-img-top ${styles.cardImageContainer}`}>
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className={styles.cardImage}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className={`card-img-top ${styles.placeholderContainer}`}>
              <span className="text-muted">🏎️ No Image</span>
            </div>
          )}
          {product.stock_quantity !== undefined && product.stock_quantity <= 5 && (
            <span className="position-absolute top-0 end-0 badge bg-warning m-2">
              Low Stock: {product.stock_quantity}
            </span>
          )}
        </div>

        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{product.name}</h5>
          {product.description && (
            <p className="card-text text-muted small flex-grow-1">
              {product.description.length > 100
                ? `${product.description.substring(0, 100)}...`
                : product.description}
            </p>
          )}
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center">
              <span className="h5 text-primary mb-0">
                {formatPrice(product.price)}
              </span>
              <div className="btn-group">
                <Link
                  href={`/products/${product.slug}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  View Details
                </Link>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAddToCart}
                  disabled={
                    !user ||
                    (product.stock_quantity !== undefined &&
                      product.stock_quantity <= 0)
                  }
                >
                  {!user
                    ? 'Login to Buy'
                    : product.stock_quantity === 0
                    ? 'Out of Stock'
                    : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
