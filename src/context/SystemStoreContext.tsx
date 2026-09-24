import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Category,
  MenuItem,
  Table,
  Order,
  MiniOrder,
  InventoryItem,
  Supplier,
  Customer,
  CustomerFeedback,
  CustomerDisplaySettings,
  SystemSettings,
  BackupLog,
  PaymentMethod,
} from '../types';
import {
  initialCategories,
  initialMenuItems,
  initialTables,
  initialOrders,
  initialInventory,
  initialSuppliers,
  initialCustomers,
  initialFeedbacks,
  initialDisplaySettings,
  initialSettings,
  initialBackupLogs,
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface SystemStoreType {
  categories: Category[];
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  customers: Customer[];
  feedbacks: CustomerFeedback[];
  displaySettings: CustomerDisplaySettings;
  settings: SystemSettings;
  backupLogs: BackupLog[];
  toasts: ToastMessage[];

  // Print Preview state
  printData: { type: 'kitchen' | 'receipt' | 'qr'; data: any } | null;
  setPrintData: (data: { type: 'kitchen' | 'receipt' | 'qr'; data: any } | null) => void;

  // Actions
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Menu & Category
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleMenuItemAvailability: (id: string) => void;

  // Table
  addTable: (table: Omit<Table, 'id' | 'status'>) => void;
  deleteTable: (tableId: string) => void;
  updateTableStatus: (tableId: string, status: Table['status'], currentOrderId?: string) => void;
  reserveTable: (tableId: string, details: { customerName: string; customerPhone?: string; dateTime: string; guestCount: number }) => void;
  cancelReservation: (tableId: string) => void;
  mergeTables: (primaryTableId: string, secondaryTableIds: string[]) => void;
  unmergeTable: (tableId: string) => void;

  // Orders & POS
  createOrder: (type: 'Dine-In' | 'Take-Away', tableId?: string, customerName?: string, customerPhone?: string) => Order;
  addItemsToOrder: (orderId: string, items: { menuItem: MenuItem; quantity: number; notes?: string }[]) => void;
  cancelOrderItem: (orderId: string, miniOrderId: string, itemId: string) => void;
  sendMiniOrderToKitchen: (orderId: string, miniOrderId: string) => void;
  updateOrderDiscountsAndTaxes: (orderId: string, discountPercentage: number, taxPercentage?: number, serviceChargePercentage?: number) => void;
  processOrderPayment: (orderId: string, method: PaymentMethod, amountReceived: number, transactionRef?: string) => boolean;

  // Inventory
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'status' | 'lastRestocked'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  adjustStock: (id: string, delta: number) => void;

  // Supplier
  addSupplier: (sup: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, sup: Partial<Supplier>) => void;

  // Customer & Loyalty
  addCustomer: (cust: Omit<Customer, 'id' | 'loyaltyPoints' | 'tier' | 'totalVisits' | 'totalSpent'>) => void;
  addLoyaltyPoints: (customerId: string, points: number) => void;

  // Feedback
  addFeedback: (name: string, rating: number, comments: string) => void;

  // Settings
  updateDisplaySettings: (settings: Partial<CustomerDisplaySettings>) => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  createManualBackup: () => void;
}

const SystemStoreContext = createContext<SystemStoreType | undefined>(undefined);

export const SystemStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('oceanchef_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('oceanchef_menu');
    return saved ? JSON.parse(saved) : initialMenuItems;
  });

  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('oceanchef_tables');
    return saved ? JSON.parse(saved) : initialTables;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('oceanchef_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('oceanchef_inventory');
    return saved ? JSON.parse(saved) : initialInventory;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('oceanchef_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('oceanchef_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>(() => {
    const saved = localStorage.getItem('oceanchef_feedbacks');
    return saved ? JSON.parse(saved) : initialFeedbacks;
  });

  const [displaySettings, setDisplaySettings] = useState<CustomerDisplaySettings>(() => {
    const saved = localStorage.getItem('oceanchef_display_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.bannerTitle && parsed.bannerTitle.includes('Ocean Chef')) {
          parsed.bannerTitle = 'Welcome to POS System By Nexzoa';
        }
        return parsed;
      } catch {
        return initialDisplaySettings;
      }
    }
    return initialDisplaySettings;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('oceanchef_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.hotelName && parsed.hotelName.includes('Ocean Chef')) {
          parsed.hotelName = 'POS System By Nexzoa';
        }
        return parsed;
      } catch {
        return initialSettings;
      }
    }
    return initialSettings;
  });

  const [backupLogs, setBackupLogs] = useState<BackupLog[]>(() => {
    const saved = localStorage.getItem('oceanchef_backups');
    return saved ? JSON.parse(saved) : initialBackupLogs;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [printData, setPrintData] = useState<{ type: 'kitchen' | 'receipt' | 'qr'; data: any } | null>(null);

  // Persistence
  useEffect(() => { localStorage.setItem('oceanchef_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('oceanchef_menu', JSON.stringify(menuItems)); }, [menuItems]);
  useEffect(() => { localStorage.setItem('oceanchef_tables', JSON.stringify(tables)); }, [tables]);
  useEffect(() => { localStorage.setItem('oceanchef_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('oceanchef_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('oceanchef_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('oceanchef_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('oceanchef_feedbacks', JSON.stringify(feedbacks)); }, [feedbacks]);
  useEffect(() => { localStorage.setItem('oceanchef_display_settings', JSON.stringify(displaySettings)); }, [displaySettings]);
  useEffect(() => { localStorage.setItem('oceanchef_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('oceanchef_backups', JSON.stringify(backupLogs)); }, [backupLogs]);

  // Toast Helpers
  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Menu & Category Actions
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}` };
    setCategories((prev) => [...prev, newCat]);
    addToast(`Category "${cat.name}" added successfully!`, 'success');
  };

  const updateCategory = (id: string, cat: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...cat } : c)));
    addToast('Category updated', 'info');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addToast('Category deleted', 'warning');
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = { ...item, id: `m-${Date.now()}` };
    setMenuItems((prev) => [...prev, newItem]);
    addToast(`Menu item "${item.name}" added!`, 'success');
  };

  const updateMenuItem = (id: string, item: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...item } : m)));
    addToast('Menu item updated', 'info');
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
    addToast('Menu item deleted', 'warning');
  };

  const toggleMenuItemAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const next = !m.isAvailable;
          addToast(`"${m.name}" is now ${next ? 'Available' : 'Unavailable'}`, 'info');
          return { ...m, isAvailable: next };
        }
        return m;
      })
    );
  };

  // Table Actions
  const addTable = (tableData: Omit<Table, 'id' | 'status'>) => {
    const newTable: Table = {
      ...tableData,
      id: `t-${Date.now()}`,
      status: 'Free',
    };
    setTables((prev) => [...prev, newTable]);
    addToast(`Table "${tableData.tableNumber}" added successfully!`, 'success');
  };

  const deleteTable = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (table && table.status === 'Occupied') {
      addToast('Cannot remove an occupied table with an active order!', 'error');
      return;
    }
    setTables((prev) => prev.filter((t) => t.id !== tableId));
    addToast(`Table "${table?.tableNumber || tableId}" deleted`, 'warning');
  };

  const updateTableStatus = (tableId: string, status: Table['status'], currentOrderId?: string) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== tableId) return t;
        if (status === 'Free') {
          return {
            ...t,
            status: 'Free',
            currentOrderId: undefined,
            reservationCustomerName: undefined,
            reservationCustomerPhone: undefined,
            reservationDateTime: undefined,
          };
        }
        return {
          ...t,
          status,
          currentOrderId: currentOrderId !== undefined ? currentOrderId : t.currentOrderId,
        };
      })
    );

    if (status === 'Free') {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.tableId === tableId && o.status === 'Active') {
            return { ...o, tableId: undefined };
          }
          return o;
        })
      );
    }
  };

  const reserveTable = (tableId: string, details: { customerName: string; customerPhone?: string; dateTime: string; guestCount: number }) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status: 'Reserved',
            reservationCustomerName: details.customerName,
            reservationCustomerPhone: details.customerPhone,
            reservationDateTime: details.dateTime,
            guestCount: details.guestCount,
          };
        }
        return t;
      })
    );
    addToast(`Table reserved for ${details.customerName}`, 'success');
  };

  const cancelReservation = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status: 'Free',
            reservationCustomerName: undefined,
            reservationCustomerPhone: undefined,
            reservationDateTime: undefined,
          };
        }
        return t;
      })
    );
    addToast('Table reservation cancelled', 'info');
  };

  const mergeTables = (primaryTableId: string, secondaryTableIds: string[]) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === primaryTableId) {
          return { ...t, status: 'Merged', mergedWith: secondaryTableIds };
        }
        if (secondaryTableIds.includes(t.id)) {
          return { ...t, status: 'Merged', mergedWith: [primaryTableId] };
        }
        return t;
      })
    );
    addToast('Tables merged successfully!', 'success');
  };

  const unmergeTable = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId || t.mergedWith?.includes(tableId)) {
          return { ...t, status: 'Free', mergedWith: undefined };
        }
        return t;
      })
    );
    addToast('Table unmerged', 'info');
  };

  // Order Actions
  const createOrder = (type: 'Dine-In' | 'Take-Away', tableId?: string, customerName?: string, customerPhone?: string): Order => {
    const existingEmpty = orders.find(
      (o) =>
        o.status === 'Active' &&
        o.type === type &&
        ((tableId && o.tableId === tableId) || (!tableId && !o.tableId)) &&
        o.miniOrders.length === 0
    );

    if (existingEmpty) {
      return existingEmpty;
    }

    const table = tableId ? tables.find((t) => t.id === tableId) : undefined;
    const now = new Date().toISOString();
    const orderNum = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(orders.length + 1).padStart(2, '0')}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      type,
      tableId,
      tableNumber: table ? table.tableNumber : undefined,
      customerName: customerName || (type === 'Take-Away' ? 'Walk-in Guest' : 'Table Guest'),
      customerPhone,
      createdAt: now,
      updatedAt: now,
      status: 'Active',
      miniOrders: [],
      subtotal: 0,
      discountPercentage: 0,
      discountAmount: 0,
      taxPercentage: settings.taxRate,
      taxAmount: 0,
      serviceChargePercentage: type === 'Dine-In' ? settings.serviceChargeRate : 0,
      serviceChargeAmount: 0,
      grandTotal: 0,
      paymentStatus: 'Unpaid',
    };

    setOrders((prev) => [newOrder, ...prev]);

    if (type === 'Dine-In' && tableId) {
      updateTableStatus(tableId, 'Occupied', newOrder.id);
    }

    addToast(`New ${type} order created (${newOrder.orderNumber})`, 'success');
    return newOrder;
  };

  const calculateOrderTotals = (order: Order): Order => {
    let subtotal = 0;
    order.miniOrders.forEach((mo) => {
      mo.items.forEach((item) => {
        if (item.status !== 'Cancelled') {
          subtotal += item.price * item.quantity;
        }
      });
    });

    const discountAmount = (subtotal * (order.discountPercentage || 0)) / 100;
    const taxableTotal = subtotal - discountAmount;
    const taxAmount = (taxableTotal * (order.taxPercentage || 0)) / 100;
    const serviceChargeAmount = (taxableTotal * (order.serviceChargePercentage || 0)) / 100;
    const grandTotal = Math.round(taxableTotal + taxAmount + serviceChargeAmount);

    return {
      ...order,
      subtotal,
      discountAmount,
      taxAmount,
      serviceChargeAmount,
      grandTotal,
      updatedAt: new Date().toISOString(),
    };
  };

  const addItemsToOrder = (orderId: string, items: { menuItem: MenuItem; quantity: number; notes?: string }[]) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const miniOrderNumber = order.miniOrders.length + 1;
        const newMiniOrder: MiniOrder = {
          id: `#${1000 + miniOrderNumber}`,
          orderId,
          miniOrderNumber,
          createdAt: new Date().toISOString(),
          isSentToKitchen: false,
          status: 'Draft',
          items: items.map((i, idx) => ({
            id: `item-${Date.now()}-${idx}`,
            menuItemId: i.menuItem.id,
            name: i.menuItem.name,
            price: i.menuItem.price,
            quantity: i.quantity,
            specialNotes: i.notes,
            status: 'Pending',
          })),
        };

        const updatedOrder = {
          ...order,
          miniOrders: [...order.miniOrders, newMiniOrder],
        };

        return calculateOrderTotals(updatedOrder);
      })
    );

    addToast('Items added to draft order!', 'info');
  };

  const cancelOrderItem = (orderId: string, miniOrderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const updatedMiniOrders = order.miniOrders.map((mo) => {
          if (mo.id !== miniOrderId) return mo;
          return {
            ...mo,
            items: mo.items.map((item) => (item.id === itemId ? { ...item, status: 'Cancelled' as const } : item)),
          };
        });

        const calculated = calculateOrderTotals({ ...order, miniOrders: updatedMiniOrders });

        const totalItemsCount = calculated.miniOrders.reduce((sum, m) => sum + m.items.length, 0);
        const cancelledItemsCount = calculated.miniOrders.reduce(
          (sum, m) => sum + m.items.filter((i) => i.status === 'Cancelled').length,
          0
        );

        if (totalItemsCount > 0 && totalItemsCount === cancelledItemsCount) {
          if (calculated.tableId) {
            updateTableStatus(calculated.tableId, 'Free');
          }
          return { ...calculated, status: 'Cancelled', paymentStatus: 'Cancelled' };
        }

        return calculated;
      })
    );

    addToast('Item cancelled', 'warning');
  };

  const sendMiniOrderToKitchen = (orderId: string, miniOrderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const miniOrder = order.miniOrders.find((m) => m.id === miniOrderId);
    if (!miniOrder) return;

    const sentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updatedMiniOrders = o.miniOrders.map((mo) => {
          if (mo.id !== miniOrderId) return mo;
          return {
            ...mo,
            isSentToKitchen: true,
            status: 'Sent' as const,
            items: mo.items.map((i) => ({ ...i, status: 'Ready' as const, sentToKitchenAt: sentTime })),
          };
        });
        return { ...o, miniOrders: updatedMiniOrders };
      })
    );

    // Auto trigger kitchen print preview
    setPrintData({
      type: 'kitchen',
      data: {
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber || 'Take Away',
        orderType: order.type,
        miniOrderId: miniOrder.id,
        items: miniOrder.items,
        timestamp: new Date().toLocaleString(),
      },
    });

    addToast(`Mini-Order ${miniOrderId} sent to Kitchen!`, 'success');
  };

  const updateOrderDiscountsAndTaxes = (orderId: string, discountPercentage: number, taxPercentage?: number, serviceChargePercentage?: number) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updated = {
          ...order,
          discountPercentage,
          taxPercentage: taxPercentage ?? order.taxPercentage,
          serviceChargePercentage: serviceChargePercentage ?? order.serviceChargePercentage,
        };
        return calculateOrderTotals(updated);
      })
    );
    addToast('Order calculation updated', 'info');
  };

  const processOrderPayment = (orderId: string, method: PaymentMethod, amountReceived: number, transactionRef?: string): boolean => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return false;

    const grandTotal = targetOrder.grandTotal;
    if (amountReceived < grandTotal && method === 'Cash') {
      addToast('Amount received is less than grand total!', 'error');
      return false;
    }

    const changeGiven = method === 'Cash' ? Math.max(0, amountReceived - grandTotal) : 0;
    const paidAt = new Date().toISOString();

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: 'Paid',
          paymentStatus: 'Paid',
          paymentMethod: method,
          amountReceived,
          changeGiven,
          transactionRef,
          paidAt,
        };
      })
    );

    // If table assigned, free table
    if (targetOrder.tableId) {
      updateTableStatus(targetOrder.tableId, 'Free');
    }

    // Award loyalty points if customer linked
    if (targetOrder.customerPhone) {
      const pointsEarned = Math.floor(grandTotal / 100);
      const cust = customers.find((c) => c.phone === targetOrder.customerPhone || c.name === targetOrder.customerName);
      if (cust) {
        addLoyaltyPoints(cust.id, pointsEarned);
      }
    }

    // Auto trigger receipt print preview
    setPrintData({
      type: 'receipt',
      data: {
        ...targetOrder,
        paymentMethod: method,
        amountReceived,
        changeGiven,
        paidAt,
      },
    });

    addToast(`Payment of LKR ${grandTotal.toLocaleString()} processed successfully!`, 'success');
    return true;
  };

  // Inventory Actions
  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'status' | 'lastRestocked'>) => {
    const status = item.quantity <= item.minReorderLevel ? (item.quantity <= 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock';
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      status,
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    setInventory((prev) => [...prev, newItem]);
    addToast(`Inventory item "${item.name}" added`, 'success');
  };

  const updateInventoryItem = (id: string, item: Partial<InventoryItem>) => {
    setInventory((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const updated = { ...i, ...item };
          updated.status = updated.quantity <= updated.minReorderLevel ? (updated.quantity <= 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock';
          return updated;
        }
        return i;
      })
    );
    addToast('Inventory item updated', 'info');
  };

  const adjustStock = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const newQty = Math.max(0, i.quantity + delta);
          const status = newQty <= i.minReorderLevel ? (newQty <= 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock';
          return { ...i, quantity: newQty, status, lastRestocked: new Date().toISOString().split('T')[0] };
        }
        return i;
      })
    );
    addToast(`Stock adjusted by ${delta > 0 ? '+' : ''}${delta}`, 'info');
  };

  // Supplier Actions
  const addSupplier = (sup: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = { ...sup, id: `sup-${Date.now()}` };
    setSuppliers((prev) => [...prev, newSup]);
    addToast(`Supplier "${sup.companyName}" added!`, 'success');
  };

  const updateSupplier = (id: string, sup: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...sup } : s)));
    addToast('Supplier details updated', 'info');
  };

  // Customer Actions
  const addCustomer = (cust: Omit<Customer, 'id' | 'loyaltyPoints' | 'tier' | 'totalVisits' | 'totalSpent'>) => {
    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      loyaltyPoints: 0,
      tier: 'Silver',
      totalVisits: 1,
      totalSpent: 0,
      lastVisit: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [...prev, newCust]);
    addToast(`Customer "${cust.name}" registered!`, 'success');
  };

  const addLoyaltyPoints = (customerId: string, points: number) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newPoints = c.loyaltyPoints + points;
          const tier = newPoints > 800 ? 'Platinum' : newPoints > 300 ? 'Gold' : 'Silver';
          return { ...c, loyaltyPoints: newPoints, tier };
        }
        return c;
      })
    );
  };

  // Feedback Action
  const addFeedback = (name: string, rating: number, comments: string) => {
    const newFb: CustomerFeedback = {
      id: `fb-${Date.now()}`,
      customerName: name || 'Anonymous',
      rating,
      comments,
      date: new Date().toISOString().split('T')[0],
    };
    setFeedbacks((prev) => [newFb, ...prev]);
    addToast('Thank you for your valuable feedback!', 'success');
  };

  // Settings Actions
  const updateDisplaySettings = (newSettings: Partial<CustomerDisplaySettings>) => {
    setDisplaySettings((prev) => ({ ...prev, ...newSettings }));
    addToast('Customer display settings saved!', 'success');
  };

  const updateSystemSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('System settings updated!', 'success');
  };

  const createManualBackup = () => {
    const newLog: BackupLog = {
      id: `b-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      filename: `pos_nexzoa_backup_${Date.now()}.json`,
      size: '2.5 MB',
      status: 'Success',
      type: 'Manual',
    };
    setBackupLogs((prev) => [newLog, ...prev]);
    addToast('System backup file generated!', 'success');
  };

  return (
    <SystemStoreContext.Provider
      value={{
        categories,
        menuItems,
        tables,
        orders,
        inventory,
        suppliers,
        customers,
        feedbacks,
        displaySettings,
        settings,
        backupLogs,
        toasts,
        printData,
        setPrintData,
        addToast,
        removeToast,
        addCategory,
        updateCategory,
        deleteCategory,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleMenuItemAvailability,
        addTable,
        deleteTable,
        updateTableStatus,
        reserveTable,
        cancelReservation,
        mergeTables,
        unmergeTable,
        createOrder,
        addItemsToOrder,
        cancelOrderItem,
        sendMiniOrderToKitchen,
        updateOrderDiscountsAndTaxes,
        processOrderPayment,
        addInventoryItem,
        updateInventoryItem,
        adjustStock,
        addSupplier,
        updateSupplier,
        addCustomer,
        addLoyaltyPoints,
        addFeedback,
        updateDisplaySettings,
        updateSystemSettings,
        createManualBackup,
      }}
    >
      {children}
    </SystemStoreContext.Provider>
  );
};

export const useSystemStore = (): SystemStoreType => {
  const context = useContext(SystemStoreContext);
  if (!context) {
    throw new Error('useSystemStore must be used within a SystemStoreProvider');
  }
  return context;
};
