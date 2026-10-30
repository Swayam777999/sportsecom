import axios from 'axios';
import { auth } from './firebase';
import type { Cart, Order, Product, ProductQuery, UserProfile } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  timeout: 15000,
});

// Attach the Firebase ID token (a JWT) to every request. getIdToken() refreshes it automatically when expired.
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response) {
      const message = (err.response.data as { message?: string } | undefined)?.message;
      if (err.response.status === 401) return 'Your session has expired. Please sign in again.';
      return message ?? `Request failed (${err.response.status})`;
    }
    return 'Cannot reach the server. Check your connection and try again.';
  }
  return err instanceof Error ? err.message : 'Something went wrong.';
}

// ---- Products (public) ----
export const getProducts = (query: ProductQuery = {}) =>
  api.get<Product[]>('/products', { params: query }).then((r) => r.data);

export const getProduct = (id: string) => api.get<Product>(`/products/${id}`).then((r) => r.data);

// ---- Cart ----
export const getCart = () => api.get<Cart>('/cart').then((r) => r.data);

export const addToCart = (productId: string, quantity: number) =>
  api.post<Cart>('/cart/items', { productId, quantity }).then((r) => r.data);

export const updateCartItem = (itemId: string, quantity: number) =>
  api.patch<Cart>(`/cart/items/${itemId}`, { quantity }).then((r) => r.data);

export const removeCartItem = (itemId: string) => api.delete<Cart>(`/cart/items/${itemId}`).then((r) => r.data);

// ---- Orders ----
export const placeOrder = (idempotencyKey: string) =>
  api.post<Order>('/orders', { idempotencyKey }).then((r) => r.data);

export const getOrders = () => api.get<Order[]>('/orders').then((r) => r.data);

export const getOrder = (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data);

// ---- User ----
export const getMe = () => api.get<UserProfile>('/users/me').then((r) => r.data);
