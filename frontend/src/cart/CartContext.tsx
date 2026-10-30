import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { addToCart, getCart, removeCartItem, updateCartItem, getErrorMessage } from '../services/api';
import { useAuth } from '../auth/AuthContext';
import type { Cart } from '../types';

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  add: (productId: string, quantity: number) => Promise<void>;
  update: (itemId: string, quantity: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCart(await getCart());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // The cart lives on the server, so it survives refreshes and new devices.
  useEffect(() => {
    if (user) {
      void refresh();
    } else {
      setCart(null);
    }
  }, [user, refresh]);

  // Mutations throw on failure so the calling page can show the message next to the button.
  const add = async (productId: string, quantity: number) => setCart(await addToCart(productId, quantity));
  const update = async (itemId: string, quantity: number) => setCart(await updateCartItem(itemId, quantity));
  const remove = async (itemId: string) => setCart(await removeCartItem(itemId));

  return (
    <CartContext.Provider value={{ cart, loading, error, refresh, add, update, remove }}>
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
