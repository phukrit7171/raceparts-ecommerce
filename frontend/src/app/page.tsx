'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  slug: string;
  image_url?: string;
  stock_quantity?: number;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productsAPI.getProducts({ limit: 6 });
        setFeaturedProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Premium Racing Parts
              </h1>
              <p className="lead mb-4">
                Discover high-quality racing components designed for performance
                enthusiasts. From brake systems to engine parts, we have
                everything you need to enhance your racing experience.
              </p>
              <div className="d-flex gap-3">
                <Link href="/products" className="btn btn-light btn-lg">
                  Shop Now
                </Link>
                <Link href="/products" className="btn btn-outline-light btn-lg">
                  Browse Categories
                </Link>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className="display-1">🏎️</div>
              <h3 className="mt-3">Built for Speed</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 text-center mb-4">
              <div className="display-4 text-primary mb-3">🚀</div>
              <h4>High Performance</h4>
              <p className="text-muted">
                All our parts are tested and certified for maximum performance
                on the track.
              </p>
            </div>
            <div className="col-lg-4 text-center mb-4">
              <div className="display-4 text-primary mb-3">🛡️</div>
              <h4>Quality Guaranteed</h4>
              <p className="text-muted">
                We stand behind our products with comprehensive warranties and
                quality assurance.
              </p>
            </div>
            <div className="col-lg-4 text-center mb-4">
              <div className="display-4 text-primary mb-3">🚚</div>
              <h4>Fast Shipping</h4>
              <p className="text-muted">
                Quick and secure delivery to get your parts when you need them
                most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="display-5 fw-bold">Featured Products</h2>
              <p className="lead text-muted">
                Check out our most popular racing components
              </p>
            </div>
          </div>

          {loading ? (
            <div className="row">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="col-lg-4 col-md-6 mb-4">
                  <div className="card h-100">
                    <div
                      className="card-img-top bg-secondary"
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
          ) : featuredProducts.length > 0 ? (
            <div className="row">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <h4>No products available</h4>
              <p className="text-muted">Check back later for new products!</p>
            </div>
          )}

          <div className="row">
            <div className="col-12 text-center mt-4">
              <Link href="/products" className="btn btn-primary btn-lg">
                View All Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-5 bg-dark text-white">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-4">Ready to Race?</h2>
          <p className="lead mb-4">
            Join thousands of racing enthusiasts who trust RaceParts for their
            performance needs.
          </p>
          <Link href="/products" className="btn btn-primary btn-lg">
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}