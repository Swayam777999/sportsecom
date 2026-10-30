export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  specifications: Record<string, string>;
  stockQuantity: number;
  inStock: boolean;
}

export interface CartItem {
  itemId: string;
  productId: string;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  currency: string;
  quantity: number;
  lineTotal: number;
  stockQuantity: number;
  available: boolean;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  currency: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  createdAt: string;
}

export interface ProductQuery {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
  orderId?: string;
  tags?: string[];
}

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>; // 5: count, 4: count, etc.
}
