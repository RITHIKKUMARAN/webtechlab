import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types/index.ts';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  couponCode: string;
  applyCoupon: (code: string) => boolean;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isDraggingProduct: boolean;
  setIsDraggingProduct: (dragging: boolean) => void;
  draggedProduct: Product | null;
  setDraggedProduct: (p: Product | null) => void;
  handleDropToCart: () => void;
  recentAddedId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'lumina_cart_storage';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDraggingProduct, setIsDraggingProduct] = useState(false);
  const [draggedProduct, setDraggedProduct] = useState<Product | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [recentAddedId, setRecentAddedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.productId === product.productId);
      if (existing) {
        return prev.map(item =>
          item.product.productId === product.productId
            ? { ...item, quantity: Math.min(product.quantity, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.quantity, quantity) }];
    });

    setRecentAddedId(product.productId);
    setTimeout(() => setRecentAddedId(null), 1800);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product.productId === productId) {
          const max = item.product.quantity;
          return { ...item, quantity: Math.min(max, quantity) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setDiscountPercent(0);
  };

  const applyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'LUMINA20') {
      setCouponCode(clean);
      setDiscountPercent(20);
      return true;
    }
    if (clean === 'MERNSTACK') {
      setCouponCode(clean);
      setDiscountPercent(15);
      return true;
    }
    return false;
  };

  const handleDropToCart = () => {
    if (draggedProduct) {
      addToCart(draggedProduct, 1);
      setDraggedProduct(null);
      setIsDraggingProduct(false);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.productPrice * item.quantity, 0);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const totalAmount = Math.max(0, subtotal - discount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        couponCode,
        applyCoupon,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
        isDraggingProduct,
        setIsDraggingProduct,
        draggedProduct,
        setDraggedProduct,
        handleDropToCart,
        recentAddedId
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
