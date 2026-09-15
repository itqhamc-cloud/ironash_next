export interface Product {
  id: string;
  title: string;
  name?: string;
  description: string;
  price: number; // In PKR
  originalPrice?: number; // Pre-discount regular price in PKR
  discountPercent?: number; // Optional custom or calculated discount %
  batchNumber?: string; // Authentic harvest batch tracking (e.g. Batch #SK-841)
  unit: string;
  category: string;
  tags?: string[];
  imageUrl: string;
  images?: string[]; // Up to 4 or more gallery images
  dimensions?: string;
  origin?: string;
  purity?: string;
  stock?: number;
  inStock: boolean;
  rating?: number;
  reviewsCount?: number;
  benefits?: string[];
  usageInstructions?: string;
  labTested?: boolean;
  harvestAltitude?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  paymentMethod: 'Cash on Delivery';
  shippingFee: number;
  items: OrderItem[];
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered';
  syncedToGoogleSheet?: boolean;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email?: string;
  deliveryAddress: string;
  notes?: string;
  paymentMethod: string;
}

