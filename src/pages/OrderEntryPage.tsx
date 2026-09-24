import React, { useState, useEffect } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import type { MenuItem } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getReservationWarningInfo } from '../utils/reservationUtils';
import {
  Search,
  Send,
  Trash2,
  Plus,
  Minus,
  Check,
  Receipt,
  X,
  AlertTriangle,
  ShoppingBag,
  UtensilsCrossed,
  ArrowRight,
} from 'lucide-react';

export const OrderEntryPage: React.FC = () => {
  const {
    menuItems,
    categories,
    tables,
    orders,
    createOrder,
    addDishDirectlyToOrder,
    updateItemQuantity,
    removeItemFromOrder,
    updateOrderItemNotes,
    clearOrder,
    sendMiniOrderToKitchen,
    addToast,
  } = useSystemStore();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryOrderId = searchParams.get('orderId');
  const queryTableId = searchParams.get('tableId');

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(queryOrderId || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderType, setOrderType] = useState<'Dine-In' | 'Take-Away'>('Dine-In');
  const [tableWarning, setTableWarning] = useState<boolean>(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'menu' | 'cart'>('menu');

  // Initialize or fetch target order ID
  useEffect(() => {
    if (queryOrderId) {
      setSelectedOrderId(queryOrderId);
      const target = orders.find((o) => o.id === queryOrderId);
      if (target) setOrderType(target.type);
    } else if (queryTableId) {
      setOrderType('Dine-In');
      const table = tables.find((t) => t.id === queryTableId);
      if (table && table.currentOrderId) {
        setSelectedOrderId(table.currentOrderId);
      } else {
        const newOrder = createOrder('Dine-In', queryTableId);
        setSelectedOrderId(newOrder.id);
      }
    } else {
      // Don't auto-load previous orders! Keep cart empty on clean entry
      setSelectedOrderId(null);
    }
  }, [queryOrderId, queryTableId]);

  // Derive current order in real-time from store orders state
  const currentOrder = orders.find((o) => o.id === selectedOrderId) || null;

  const handleSelectTable = (tableId: string) => {
    setOrderType('Dine-In');
    setTableWarning(false);
    if (!tableId) {
      setSelectedOrderId(null);
      return;
    }

    const selectedTable = tables.find((t) => t.id === tableId);
    if (selectedTable) {
      const resWarning = getReservationWarningInfo(selectedTable);
      if (resWarning) {
        addToast(resWarning.message, 'warning');
      }

      if (selectedTable.currentOrderId) {
        const existingOrder = orders.find((o) => o.id === selectedTable.currentOrderId && o.status === 'Active');
        if (existingOrder) {
          setSelectedOrderId(existingOrder.id);
          return;
        }
      }

      const newOrder = createOrder('Dine-In', tableId);
      setSelectedOrderId(newOrder.id);
    }
  };

  const handleToggleOrderType = (type: 'Dine-In' | 'Take-Away') => {
    setOrderType(type);
    setTableWarning(false);

    if (type === 'Dine-In') {
      if (currentOrder && currentOrder.type === 'Take-Away') {
        const activeDineIn = orders.find((o) => o.status === 'Active' && o.type === 'Dine-In');
        setSelectedOrderId(activeDineIn ? activeDineIn.id : null);
      }
    } else if (type === 'Take-Away') {
      if (!currentOrder || currentOrder.type !== 'Take-Away') {
        const activeTakeAway = orders.find((o) => o.status === 'Active' && o.type === 'Take-Away');
        if (activeTakeAway) {
          setSelectedOrderId(activeTakeAway.id);
        } else {
          const newOrder = createOrder('Take-Away');
          setSelectedOrderId(newOrder.id);
        }
      }
    }
  };

  // Add dish directly into active order on click
  const handleDishClick = (dish: MenuItem) => {
    let target = currentOrder;

    // If no order is currently selected, pick an available table or create take-away
    if (!target) {
      if (orderType === 'Dine-In') {
        const freeTable = tables.find((t) => t.status === 'Free') || tables[0];
        if (freeTable) {
          target = createOrder('Dine-In', freeTable.id);
          setSelectedOrderId(target.id);
        }
      } else {
        target = createOrder('Take-Away');
        setSelectedOrderId(target.id);
      }
    }

    if (target) {
      addDishDirectlyToOrder(target.id, dish);
      setTableWarning(false);
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCat =
      selectedCategory === 'All' || item.categoryId === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const cartItems = currentOrder
    ? currentOrder.miniOrders.flatMap((mo) =>
        mo.items.filter((i) => i.status !== 'Cancelled')
      )
    : [];

  const totalItemsCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const subtotal = currentOrder ? currentOrder.subtotal : 0;
  const taxRate = 10;
  const serviceRate = orderType === 'Dine-In' ? 5 : 0;
  const grandTotal = currentOrder ? currentOrder.grandTotal : 0;

  const handleProceedToBilling = () => {
    if (currentOrder && cartItems.length > 0) {
      navigate(`/billing?orderId=${currentOrder.id}`);
    }
  };

  const isEmpty = cartItems.length === 0;

  return (
    <div className="relative">
      {/* Mobile/Tablet View Switcher Bar (visible < lg) */}
      <div className="flex lg:hidden items-center bg-slate-200/90 p-1 rounded-xl mb-3 shadow-inner">
        <button
          onClick={() => setActiveMobileTab('menu')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeMobileTab === 'menu'
              ? 'bg-[#0B4EAE] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Menu Catalog ({filteredMenuItems.length})</span>
        </button>
        <button
          onClick={() => setActiveMobileTab('cart')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeMobileTab === 'cart'
              ? 'bg-[#0B4EAE] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Order Cart ({totalItemsCount})</span>
          {grandTotal > 0 && (
            <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
              LKR {grandTotal.toLocaleString()}
            </span>
          )}
        </button>
      </div>

      <div className="h-auto lg:h-[calc(100vh-100px)] flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 pb-20 lg:pb-0">
        {/* Left 2 Columns: Product Catalog & Menu Grid */}
        <div
          className={`lg:col-span-2 flex flex-col space-y-3 sm:space-y-4 overflow-hidden ${
            activeMobileTab === 'menu' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Top Order Type Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleOrderType('Dine-In')}
                className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                  orderType === 'Dine-In'
                    ? 'bg-[#0B4EAE] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Dine-In Order
              </button>
              <button
                onClick={() => handleToggleOrderType('Take-Away')}
                className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                  orderType === 'Take-Away'
                    ? 'bg-[#0B4EAE] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Take-Away Counter
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
              {/* Table Selector Dropdown if Dine-In */}
              {orderType === 'Dine-In' && (
                <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                  <span className="text-xs font-semibold text-slate-500 hidden xs:inline">Table:</span>
                  <select
                    value={currentOrder?.tableId || ''}
                    onChange={(e) => handleSelectTable(e.target.value)}
                    className={`w-full sm:w-auto rounded-lg border bg-white px-2.5 py-1.5 text-xs font-bold transition-all ${
                      tableWarning
                        ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-50 text-amber-900 animate-pulse'
                        : 'border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="">-- Select Table --</option>
                    {tables.map((t) => {
                      const resWarn = getReservationWarningInfo(t);
                      return (
                        <option key={t.id} value={t.id}>
                          {t.tableNumber} ({t.status}) {resWarn ? `⚠️ Reserved at ${resWarn.formattedTime}` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <span className="text-xs font-mono font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg shrink-0">
                {currentOrder ? currentOrder.orderNumber : 'No Active Order'}
              </span>
            </div>
          </div>

          {/* Warning Banner when Selected Table has Upcoming Reservation within 1 Hour */}
          {orderType === 'Dine-In' && currentOrder?.tableId && (() => {
            const selectedTable = tables.find((t) => t.id === currentOrder.tableId);
            const resWarn = selectedTable ? getReservationWarningInfo(selectedTable) : null;
            if (!resWarn) return null;
            return (
              <div className="bg-rose-50 border border-rose-300 text-rose-900 text-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center justify-between font-semibold shadow-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{resWarn.message}</span>
                </div>
              </div>
            );
          })()}

          {/* Search & Category Filter */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5 sm:space-y-3">
            <div className="relative w-full">
              <Input
                placeholder="Search dish by code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-[#0B4EAE] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Items
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-[#0B4EAE] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Dish Cards Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredMenuItems.map((dish) => {
              const orderedQty = currentOrder
                ? currentOrder.miniOrders
                    .flatMap((mo) => mo.items)
                    .filter((i) => i.menuItemId === dish.id && i.status !== 'Cancelled')
                    .reduce((sum, i) => sum + i.quantity, 0)
                : 0;

              const isSelected = orderedQty > 0;

              return (
                <div
                  key={dish.id}
                  onClick={() => dish.isAvailable && handleDishClick(dish)}
                  className={`relative bg-white rounded-2xl border p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                    !dish.isAvailable
                      ? 'opacity-50 cursor-not-allowed border-slate-200'
                      : isSelected
                      ? 'border-[#0B4EAE] bg-blue-50/20 ring-2 ring-[#0B4EAE]/30 shadow-sm'
                      : 'border-slate-200 hover:border-[#0B4EAE]/60'
                  }`}
                >
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="relative h-24 sm:h-28 w-full rounded-xl overflow-hidden bg-slate-100">
                      <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                      <span className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                        {dish.code}
                      </span>

                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 bg-[#0B4EAE] text-white font-extrabold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {orderedQty}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{dish.name}</h4>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 sm:pt-2">
                    <span className="text-xs font-extrabold text-[#0B4EAE]">
                      LKR {dish.price.toLocaleString()}
                    </span>
                    {isSelected ? (
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-lg bg-[#0B4EAE] text-white text-[10px] sm:text-[11px] font-extrabold flex items-center gap-0.5 shadow-xs">
                        <Check className="w-3 h-3" /> {orderedQty}
                      </span>
                    ) : (
                      <span className="p-1 rounded-lg bg-[#0B4EAE]/10 text-[#0B4EAE] hover:bg-[#0B4EAE] hover:text-white transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Order Cart */}
        <div
          className={`bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between overflow-hidden ${
            activeMobileTab === 'cart' ? 'flex' : 'hidden lg:flex'
          }`}
        >
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Order Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Current Cart</h3>
              <p className="text-xs text-slate-500">
                {currentOrder
                  ? `${currentOrder.type} • ${currentOrder.tableNumber || 'Take Away'}`
                  : 'No Active Order (Select Table or Dish)'}
              </p>
            </div>
            {!isEmpty && currentOrder && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => clearOrder(currentOrder.id)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg transition-colors border border-rose-200"
                  title="Clear Cart"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Receipt className="w-3.5 h-3.5" />}
                  onClick={handleProceedToBilling}
                >
                  Billing
                </Button>
              </div>
            )}
          </div>

          {/* Empty Cart State */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400 space-y-3">
              <div className="p-4 bg-slate-100 rounded-full text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-700">Order Cart is Empty</p>
                <p className="text-xs text-slate-400 max-w-[220px]">
                  Click any dish from the menu to add it directly to your cart.
                </p>
              </div>
            </div>
          )}

          {/* Order Items List */}
          {!isEmpty && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                <span>Order Items ({totalItemsCount})</span>
                <span>Line Total</span>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2 hover:border-[#0B4EAE]/30 transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span className="font-bold">{item.name}</span>
                    <span className="font-mono text-[#0B4EAE] font-bold">
                      LKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <input
                      type="text"
                      placeholder="Add special note..."
                      value={item.specialNotes || ''}
                      onChange={(e) =>
                        currentOrder &&
                        updateOrderItemNotes(currentOrder.id, item.id, e.target.value)
                      }
                      className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1 w-32 focus:outline-none focus:ring-1 focus:ring-[#0B4EAE]"
                    />

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-slate-200 shadow-2xs">
                        <button
                          onClick={() =>
                            currentOrder && updateItemQuantity(currentOrder.id, item.id, -1)
                          }
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold w-5 text-center text-xs">{item.quantity}</span>
                        <button
                          onClick={() =>
                            currentOrder && updateItemQuantity(currentOrder.id, item.id, 1)
                          }
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          currentOrder && removeItemFromOrder(currentOrder.id, item.id)
                        }
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Print Kitchen Ticket Button */}
              {currentOrder && currentOrder.miniOrders.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 border-slate-300 text-slate-700 hover:bg-slate-100"
                  icon={<Send className="w-3.5 h-3.5" />}
                  onClick={() =>
                    currentOrder &&
                    currentOrder.miniOrders[0] &&
                    sendMiniOrderToKitchen(currentOrder.id, currentOrder.miniOrders[0].id)
                  }
                >
                  Print Kitchen Ticket
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer Summary & Proceed */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">
                LKR {subtotal.toLocaleString()}
              </span>
            </div>
            {subtotal > 0 && (
              <>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Govt Tax ({taxRate}%):</span>
                  <span>LKR {(currentOrder?.taxAmount || 0).toLocaleString()}</span>
                </div>
                {serviceRate > 0 && (
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Service Charge ({serviceRate}%):</span>
                    <span>LKR {(currentOrder?.serviceChargeAmount || 0).toLocaleString()}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-800 pt-1 border-t border-slate-100">
              <span>Grand Total:</span>
              <span className="text-[#0B4EAE]">
                LKR {grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full bg-[#0B4EAE] hover:bg-[#093D89]"
            disabled={isEmpty}
            onClick={handleProceedToBilling}
          >
            Proceed to Billing Checkout
          </Button>
        </div>
      </div>
    </div>

      {/* Floating Bottom Cart Bar for Mobile & Tablet when in Menu Catalog Tab */}
      {activeMobileTab === 'menu' && totalItemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden animate-fade-in">
          <button
            onClick={() => setActiveMobileTab('cart')}
            className="w-full bg-[#0B4EAE] hover:bg-[#093D89] text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between font-bold text-xs border border-blue-400/40 backdrop-blur-md transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-extrabold">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
              </span>
              <span className="font-extrabold text-sm">LKR {grandTotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-300 font-extrabold">
              <span>View Cart & Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
