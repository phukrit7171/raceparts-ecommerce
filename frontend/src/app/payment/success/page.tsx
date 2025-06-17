'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function PaymentSuccessPage() {
  const { fetchCart } = useCart();

  // On successful payment, the backend should clear the cart.
  // We refetch the cart here to update the UI state.
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <div className="container text-center py-5">
      <div className="display-1 text-success mb-3">✅</div>
      <h1 className="display-4 fw-bold">Payment Successful!</h1>
      <p className="lead text-muted my-4">
        Thank you for your purchase. Your order is being processed and you will receive a confirmation email shortly.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <Link href="/" className="btn btn-primary btn-lg">
          Go to Homepage
        </Link>
        <Link href="/products" className="btn btn-outline-secondary btn-lg">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}