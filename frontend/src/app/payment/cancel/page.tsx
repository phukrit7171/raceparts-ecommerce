'use client';

import React from 'react';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="container text-center py-5">
      <div className="display-1 text-warning mb-3">⚠️</div>
      <h1 className="display-4 fw-bold">Payment Cancelled</h1>
      <p className="lead text-muted my-4">
        Your payment was not completed. Your cart has been saved, and you can return to it at any time.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <Link href="/cart" className="btn btn-primary btn-lg">
          Return to Cart
        </Link>
        <Link href="/products" className="btn btn-outline-secondary btn-lg">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}