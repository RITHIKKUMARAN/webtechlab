export interface Product {
  productId: string;
  productName: string;
  productPrice: number;
  category: string;
  quantity: number;
  description: string;
  image?: string;
  rating?: number;
  isFeatured?: boolean;
}

export interface User {
  username: string;
  emailId: string;
  age: number;
  password?: string;
  role: 'user' | 'admin';
  sessionVersion?: number;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  orderId: string;
  emailId: string;
  username: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  paymentMethod: string;
  status: 'Confirmed' | 'Processing' | 'Delivered';
  createdAt: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
