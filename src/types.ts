export type UserRole = "CUSTOMER" | "ADMIN";

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
  createdAt: string;
}

export interface OrderHistoryEvent {
  id: string;
  orderId: string;
  userEmail: string;
  action: "CREATED" | "STATUS_UPDATE";
  totalAmount: number | null;
  status: string;
  details: string;
  eventTime: string;
}

export interface OrderHistoryStats {
  userEmail: string;
  totalOrders: number;
  totalSpent: number;
  totalStatusUpdates: number;
  totalEvents: number;
}

export interface PrometheusMetrics {
  authRequests: number;
  catalogRequests: number;
  orderRequests: number;
  totalRequests: number;
  redisHits: number;
  redisMisses: number;
  kafkaPublished: number;
  kafkaConsumed: number;
}
