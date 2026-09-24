export type Role = 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  itemCount?: number;
  icon?: string;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  categoryName: string;
  price: number; // in LKR
  description: string;
  image: string;
  isAvailable: boolean;
  preparationTimeMinutes: number;
  ingredients?: { name: string; amount: number; unit: string }[];
  isPopular?: boolean;
}

export type TableStatus = 'Free' | 'Occupied' | 'Reserved' | 'Merged';

export interface Table {
  id: string;
  tableNumber: string; // e.g. "Table 01"
  capacity: number;
  location: 'Main Dining' | 'Terrace' | 'VIP Section' | 'Outdoor';
  status: TableStatus;
  currentOrderId?: string;
  guestCount?: number;
  mergedWith?: string[]; // IDs of merged tables
  reservationCustomerName?: string;
  reservationCustomerPhone?: string;
  reservationDateTime?: string;
}

export type OrderType = 'Dine-In' | 'Take-Away';
export type OrderItemStatus = 'Pending' | 'Ready' | 'Cancelled';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialNotes?: string;
  status: OrderItemStatus;
  sentToKitchenAt?: string;
}

export interface MiniOrder {
  id: string; // e.g. "#1001"
  orderId: string;
  miniOrderNumber: number;
  createdAt: string;
  items: OrderItem[];
  isSentToKitchen: boolean;
  status: 'Draft' | 'Sent' | 'Completed' | 'Cancelled';
}

export type PaymentMethod = 'Cash' | 'Card' | 'Online/QR' | 'Loyalty Points';
export type PaymentStatus = 'Unpaid' | 'Paid' | 'Partially Paid' | 'Refunded' | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string; // e.g. "ORD-2026-0818-01"
  type: OrderType;
  tableId?: string;
  tableNumber?: string;
  customerName?: string;
  customerPhone?: string;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
  miniOrders: MiniOrder[];
  status: 'Active' | 'Billing' | 'Paid' | 'Cancelled';
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number; // e.g. 10%
  taxAmount: number;
  serviceChargePercentage: number; // e.g. 5%
  serviceChargeAmount: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  amountReceived?: number;
  changeGiven?: number;
  transactionRef?: string;
  paidAt?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: 'kg' | 'g' | 'L' | 'ml' | 'pcs' | 'packs';
  minReorderLevel: number;
  unitCost: number;
  supplierId: string;
  supplierName: string;
  lastRestocked: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
  address: string;
  outstandingBalance: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  tier: 'Silver' | 'Gold' | 'Platinum';
  totalVisits: number;
  totalSpent: number;
  lastVisit: string;
}

export interface CustomerFeedback {
  id: string;
  customerName: string;
  rating: number; // 1 to 5
  comments: string;
  date: string;
}

export interface CustomerDisplaySettings {
  bannerTitle: string;
  bannerSubtitle: string;
  slides: { id: string; title: string; image: string; tag: string }[];
  thankYouMessage: string;
  showQRForPayment: boolean;
}

export interface SystemSettings {
  hotelName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  taxRate: number;
  serviceChargeRate: number;
  receiptFooter: string;
  enableAutoPrintKitchen: boolean;
  enableCustomerDisplay: boolean;
}

export interface DailySalesSummary {
  date: string;
  totalRevenue: number;
  totalOrders: number;
  dineInOrders: number;
  takeAwayOrders: number;
  cashSales: number;
  cardSales: number;
  digitalSales: number;
}

export interface BackupLog {
  id: string;
  timestamp: string;
  filename: string;
  size: string;
  status: 'Success' | 'Failed';
  type: 'Auto' | 'Manual';
}
