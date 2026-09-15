'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order } from '@/types/timber';
import { getStoredProducts, saveStoredProducts, INITIAL_PRODUCTS } from '@/lib/initial-products';

interface CartContextType {
  products: Product[];
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  successfulOrder: Order | null;
  setSuccessfulOrder: (order: Order | null) => void;
  selectedProduct: Product | null;
  isDetailModalOpen: boolean;
  isCheckoutDirect: boolean;
  setIsCheckoutDirect: (val: boolean) => void;
  handleSelectProduct: (product: Product) => void;
  setIsDetailModalOpen: (open: boolean) => void;
  handleAddToCart: (product: Product, quantity?: number) => void;
  handleBuyNow: (product: Product, quantity?: number) => void;
  handleUpdateQuantity: (productId: string, delta: number) => void;
  handleRemoveItem: (productId: string) => void;
  handleClearCart: () => void;
  totalCartCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{
  children: React.ReactNode;
  initialProducts?: Product[];
}> = ({ children, initialProducts }) => {
  const [products, setProducts] = useState<Product[]>(
    initialProducts && initialProducts.length > 0 ? initialProducts : INITIAL_PRODUCTS
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [successfulOrder, setSuccessfulOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isCheckoutDirect, setIsCheckoutDirect] = useState<boolean>(false);

  // Restore cart items from localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedCart = localStorage.getItem('ironash_cart_v1');
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Listen to manual or cross-tab admin updates
  useEffect(() => {
    const handleProductUpdate = () => {
      const stored = getStoredProducts();
      if (stored && stored.length > 0) {
        setProducts(stored);
      }
    };
    window.addEventListener('ironash_products_updated', handleProductUpdate);
    return () => {
      window.removeEventListener('ironash_products_updated', handleProductUpdate);
    };
  }, []);

  // Immediately revalidate latest products from server with no-store
  useEffect(() => {
    fetch('/api/products', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          saveStoredProducts(data.products);
        }
      })
      .catch((err) => console.warn('Failed to load server products:', err));
  }, []);

  const updateCartState = (items: CartItem[]) => {
    setCartItems(items);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ironash_cart_v1', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart', e);
      }
    }
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    const existingIndex = cartItems.findIndex((item) => item.product.id === product.id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...cartItems, { product, quantity }];
    }
    updateCartState(updated);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    handleAddToCart(product, quantity);
    setIsDetailModalOpen(false);
    setIsCheckoutDirect(true);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);
    updateCartState(updated);
  };

  const handleRemoveItem = (productId: string) => {
    const updated = cartItems.filter((item) => item.product.id !== productId);
    updateCartState(updated);
  };

  const handleClearCart = () => {
    updateCartState([]);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        products,
        cartItems,
        isCartOpen,
        setIsCartOpen,
        successfulOrder,
        setSuccessfulOrder,
        selectedProduct,
        isDetailModalOpen,
        isCheckoutDirect,
        setIsCheckoutDirect,
        handleSelectProduct,
        setIsDetailModalOpen,
        handleAddToCart,
        handleBuyNow,
        handleUpdateQuantity,
        handleRemoveItem,
        handleClearCart,
        totalCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
