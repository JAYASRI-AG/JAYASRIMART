export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  productCount?: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  active: boolean;
}

export interface ProductVariant {
  id?: number;
  variantName: string;
  variantValue: string;
  additionalPrice?: number;
  stockQuantity: number;
  sku?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  stockQuantity: number;
  category?: Category;
  brand?: Brand;
  imageUrl: string;
  images?: string[];
  variants?: ProductVariant[];
  active: boolean;
  featured: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt?: string;
}

export interface ProductPageResponse {
  content: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
  itemTotal: number;
  inStock: boolean;
  availableStock?: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImageUrl: string;
  price: number;
  discountPrice?: number;
  inStock: boolean;
  createdAt?: string;
}

export interface Wishlist {
  id: number;
  items: WishlistItem[];
  itemCount: number;
}

export interface Address {
  id?: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  userId?: number;
  userEmail?: string;
  userName?: string;
  orderNumber: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  transactionId?: string;
  shippingAddress: string;
  billingAddress?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface Review {
  id: number;
  userId?: number;
  userName: string;
  productId: number;
  productName?: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  startDate?: string;
  expiryDate?: string;
  usageLimit?: number;
  usedCount?: number;
  active: boolean;
}

export interface AdminDashboard {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: Order[];
  lowStockItems: Product[];
}
