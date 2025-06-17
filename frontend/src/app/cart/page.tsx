'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { paymentAPI, showAlert } from '@/lib/api';
import { getStripe } from '@/lib/stripe';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  if (!isClient || !user || loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    return (
      <div className="container text-center py-5">
        <div className="display-1 text-muted mb-3">🛒</div>
        <h2 className="mb-3">Your cart is empty</h2>
        <p className="text-muted mb-4">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link href="/products" className="btn btn-primary btn-lg">
          Start Shopping
        </Link>
      </div>
    );
  }
  
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      console.log('Initiating checkout process...');
      
      // 1. Create checkout session
      const response = await paymentAPI.createCheckoutSession({
        origin: window.location.origin,
      });
      
      console.log('Checkout session response:', response);
      
      if (!response.data || !response.data.id) {
        throw new Error('Invalid response from server: Missing session id');
      }
      
      const { id: sessionId } = response.data;
      console.log('Retrieved session id:', sessionId);

      // 2. Load Stripe.js
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe.js failed to load. Please try again.');
      }
      
      console.log('Redirecting to Stripe Checkout with session id:', sessionId);
      
      // 3. Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });
      
      if (error) {
        console.error('Stripe redirect error:', error);
        throw new Error(error.message || 'Failed to redirect to checkout.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Could not initiate checkout. Please try again.';
      showAlert.error(errorMessage);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };
  


  return (
    <div className="container py-5">
      <h1 className="display-5 fw-bold mb-4">Your Shopping Cart</h1>
      <div className="row">
        <div className="col-lg-8">
          {cart.items.map((item) => (
            <div key={item.id} className="card mb-3 shadow-sm">
              <div className="card-body">
                <div className="row g-3 align-items-center">
                  <div className="col-md-2 col-4">
                    <div className="position-relative" style={{ width: '100%', aspectRatio: '1/1' }}>
                      <Image
                        src={item?.Product?.images?.[0] || '/placeholder.svg'}
                        alt={item?.Product?.name || 'Product image'}
                        fill
                        className="img-fluid rounded"
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, 150px"
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-8">
                    <h5 className="mb-1">{item?.Product?.name || 'Unnamed Product'}</h5>
                    <p className="text-muted small mb-0">Price: {item?.Product?.price ? formatPrice(item.Product.price) : 'N/A'}</p>
                  </div>
                  <div className="col-md-3 col-6">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">Qty</span>
                      <input
                        type="number"
                        className="form-control"
                        value={item.quantity}
                        min="1"
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="col-md-2 col-4 text-end">
                    <p className="fw-bold mb-0">{item?.Product?.price ? formatPrice(item.Product.price * item.quantity) : 'N/A'}</p>
                  </div>
                  <div className="col-md-1 col-2 text-end">
                    <button 
                      className="btn btn-sm btn-outline-danger" 
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title">Order Summary</h4>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Subtotal
                  <span>{formatPrice(cart.subtotal)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Shipping
                  <span className="text-success">Free</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center fw-bold h5">
                  Total
                  <span>{formatPrice(cart.subtotal)}</span>
                </li>
              </ul>
              <button 
                className="btn btn-primary w-100 mt-3 btn-lg" 
                onClick={handleCheckout} 
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}