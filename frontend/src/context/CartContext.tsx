'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { cartAPI, showAlert } from '@/lib/api';
import { useAuth } from './AuthContext';

interface CartItem {
  id: number;
  quantity: number;
  Product: {
    id: number;
    name: string;
    price: number;
    slug: string;
    images: string[];
  };
}

interface CartData {
  items: CartItem[];
  subtotal: number;
}

interface CartContextType {
  cart: CartData | null;
  loading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  fetchCart: () => Promise<void>;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = React.useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCart(response.data.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ items: [], subtotal: 0 });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addToCart = async (productId: number, quantity: number) => {
    try {
      await cartAPI.addToCart({ productId, quantity });
      await fetchCart();
      showAlert.success('Product added to cart!');
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        showAlert.error(
          (error as { response: { data: { message: string } } }).response.data.message
        );
      } else {
        showAlert.error('Failed to add product to cart');
      }
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      await cartAPI.updateCartItem(itemId, { quantity });
      await fetchCart();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        showAlert.error((error as { response: { data: { message: string } } }).response.data.message);
      } else {
        showAlert.error('Failed to update quantity');
      }
    }
  };

  const removeFromCart = async (itemId: number) => {
    const result = await showAlert.confirm('Remove Item', 'Are you sure you want to remove this item?');
    if (result.isConfirmed) {
      try {
        await cartAPI.removeFromCart(itemId);
        await fetchCart();
        showAlert.success('Item removed from cart!');
      } catch (error: unknown) {
        if (
          error &&
          typeof error === 'object' &&
          'response' in error &&
          error.response &&
          typeof error.response === 'object' &&
          'data' in error.response &&
          error.response.data &&
          typeof error.response.data === 'object' &&
          'message' in error.response.data
        ) {
          showAlert.error(
            (error as { response: { data: { message: string } } }).response.data.message
          );
        } else {
          showAlert.error('Failed to remove item');
        }
      }
    }
  };

  const getCartItemCount = () => {
    return cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, fetchCart, getCartItemCount }}>
      {children}
    </CartContext.Provider>
  );
};