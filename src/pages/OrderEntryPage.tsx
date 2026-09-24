import React, { useState, useEffect } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import type { MenuItem } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { StatusBadge } from '../components/common/StatusBadge';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getReservationWarningInfo } from '../utils/reservationUtils';
import {
  Search,
  Send,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Check,
  Receipt,
  RotateCcw,
  X,
  AlertTriangle,
} from 'lucide-react';

export const OrderEntryPage: React.FC = () => {
  const {
    menuItems,
    categories,
    tables,
    orders,
    createOrder,
    addItemsToOrder,
    cancelOrderItem,
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

  // Cart draft items before appending as a new mini order
  const [draftItems, setDraftItems] = useState<
    { menuItem: MenuItem; quantity: number; notes?: string }[]
  >([]);

  const handleClearDraft = () => {
    setDraftItems([]);
    addToast('Draft cart cleared', 'info');
  };

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
    } else if (!selectedOrderId && orders.length > 0) {
      const activeDineIn = orders.find((o) => o.status === 'Active' && o.type === 'Dine-In');
      if (activeDineIn) {
        setSelectedOrderId(activeDineIn.id);
        setOrderType('Dine-In');
      } else {
        setOrderType('Dine-In');
      }
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
    }

    const newOrder = createOrder('Dine-In', tableId);
    setSelectedOrderId(newOrder.id);
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

  const handleAddDishToDraft = (dish: MenuItem) => {
    if (orderType === 'Dine-In' && (!currentOrder || !currentOrder.tableId)) {
      setTableWarning(true);
      addToast('Please select a table first before adding items to order!', 'warning');
      return;
    }

    setTableWarning(false);
    setDraftItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.menuItem.id === dish.id);
      if (existingIndex > -1) {
        return prev.map((item, index) =>
          index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { menuItem: dish, quantity: 1, notes: '' }];
    });
  };

  const handleUpdateDraftQty = (menuItemId: string, delta: number) => {
    setDraftItems((prev) =>
      prev
        .map((item) => {
          if (item.menuItem.id === menuItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { menuItem: MenuItem; quantity: number; notes?: string }[]
    );
  };

  const handleUpdateDraftNotes = (menuItemId: string, notes: string) => {
    setDraftItems((prev) =>
      prev.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, notes } : item
      )
    );
  };

  const handleAppendMiniOrder = () => {
    let targetOrder = currentOrder;
    if (!targetOrder) {
      if (orderType === 'Dine-In') {
        setTableWarning(true);
        addToast('Please select a table first before starting order!', 'warning');
        return;
      }
      targetOrder = createOrder('Take-Away');
      setSelectedOrderId(targetOrder.id);
    }
    if (draftItems.length === 0) return;

    addItemsToOrder(targetOrder.id, draftItems);
    setDraftItems([]);
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCat =
      selectedCategory === 'All' || item.categoryId === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Columns: Product Catalog & Menu Grid */}
      <div className="lg:col-span-2 flex flex-col space-y-4 overflow-hidden">
        {/* Top Order Type Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleOrderType('Dine-In')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                orderType === 'Dine-In'
                  ? 'bg-[#0B4EAE] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Dine-In Order
            </button>
            <button
              onClick={() => handleToggleOrderType('Take-Away')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                orderType === 'Take-Away'
                  ? 'bg-[#0B4EAE] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Take-Away Counter
            </button>
          </div>

          {/* Table Selector Dropdown if Dine-In */}
          {orderType === 'Dine-In' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Selected Table:</span>
              <select
                value={currentOrder?.tableId || ''}
                onChange={(e) => handleSelectTable(e.target.value)}
                className={`rounded-lg border bg-white px-3 py-1.5 text-xs font-bold transition-all ${
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {currentOrder ? currentOrder.orderNumber : 'Select Order'}
            </span>
          </div>
        </div>

        {/* Warning Banner when Dine-In and No Table Selected */}
        {orderType === 'Dine-In' && (!currentOrder || !currentOrder.tableId) && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between font-semibold shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Please select a table above before start ordering dishes for Dine-In.</span>
            </div>
          </div>
        )}

        {/* Warning Banner when Selected Table has Upcoming Reservation within 1 Hour */}
        {orderType === 'Dine-In' && currentOrder?.tableId && (() => {
          const selectedTable = tables.find((t) => t.id === currentOrder.tableId);
          const resWarn = selectedTable ? getReservationWarningInfo(selectedTable) : null;
          if (!resWarn) return null;
          return (
            <div className="bg-rose-50 border border-rose-300 text-rose-900 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between font-semibold shadow-xs animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{resWarn.message}</span>
              </div>
            </div>
          );
        })()}

        {/* Search & Category Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-[#0B4EAE] text-white'
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
                    ? 'bg-[#0B4EAE] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Dish Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredMenuItems.map((dish) => {
            const draftItem = draftItems.find((i) => i.menuItem.id === dish.id);
            const draftQty = draftItem ? draftItem.quantity : 0;

            const orderedQty = currentOrder
              ? currentOrder.miniOrders.reduce((sum, mo) => {
                  const item = mo.items.find((i) => i.menuItemId === dish.id && i.status !== 'Cancelled');
                  return sum + (item ? item.quantity : 0);
                }, 0)
              : 0;

            const totalSelectedQty = draftQty + orderedQty;
            const isSelected = totalSelectedQty > 0;

            return (
              <div
                key={dish.id}
                onClick={() => dish.isAvailable && handleAddDishToDraft(dish)}
                className={`relative bg-white rounded-2xl border p-3 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                  !dish.isAvailable
                    ? 'opacity-50 cursor-not-allowed border-slate-200'
                    : isSelected
                    ? 'border-[#0B4EAE] bg-blue-50/20 ring-2 ring-[#0B4EAE]/30 shadow-sm'
                    : 'border-slate-200 hover:border-[#0B4EAE]/60'
                }`}
              >
                <div className="space-y-2">
                  <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-100">
                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-slate-900/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                      {dish.code}
                    </span>

                    {isSelected && (
                      <span className="absolute top-2 right-2 bg-[#0B4EAE] text-white font-extrabold text-[11px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {totalSelectedQty}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{dish.name}</h4>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-extrabold text-[#0B4EAE]">
                    LKR {dish.price.toLocaleString()}
                  </span>
                  {isSelected ? (
                    <span className="px-2 py-0.5 rounded-lg bg-[#0B4EAE] text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs">
                      <Check className="w-3 h-3" /> {totalSelectedQty} Selected
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

      {/* Right Column: Live Order Cart & Mini-Orders Ticket Drawer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Order Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Current Cart & Tickets</h3>
              <p className="text-xs text-slate-500">
                {currentOrder ? `${currentOrder.type} • ${currentOrder.tableNumber || 'Take Away'}` : 'No Order'}
              </p>
            </div>
            {currentOrder && (
              <Button
                variant="outline"
                size="sm"
                icon={<Receipt className="w-3.5 h-3.5" />}
                onClick={() => navigate(`/billing?orderId=${currentOrder.id}`)}
              >
                Go to Billing
              </Button>
            )}
          </div>

          {/* Section 1: Draft Items Pending Append */}
          {draftItems.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span>New Items (Draft)</span>
                <div className="flex items-center gap-2">
                  <span>{draftItems.reduce((s, i) => s + i.quantity, 0)} Items</span>
                  <button
                    onClick={handleClearDraft}
                    className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100/70 hover:bg-rose-200 px-2 py-0.5 rounded-lg transition-colors"
                    title="Clear Draft Cart"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Cart</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {draftItems.map((item) => (
                  <div key={item.menuItem.id} className="p-2 rounded-lg bg-white border border-amber-100 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>{item.menuItem.name}</span>
                      <span>LKR {(item.menuItem.price * item.quantity).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <input
                        type="text"
                        placeholder="Add special note..."
                        value={item.notes || ''}
                        onChange={(e) => handleUpdateDraftNotes(item.menuItem.id, e.target.value)}
                        className="text-[11px] bg-slate-50 border border-slate-200 rounded px-2 py-0.5 w-32 focus:outline-none"
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateDraftQty(item.menuItem.id, -1)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateDraftQty(item.menuItem.id, 1)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300 text-amber-900 hover:bg-amber-100"
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={handleClearDraft}
                >
                  Clear
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={handleAppendMiniOrder}
                >
                  Confirm Items & Create Mini-Order
                </Button>
              </div>
            </div>
          )}

          {/* Section 2: Sent & Appended Mini Orders List */}
          {currentOrder?.miniOrders.map((miniOrder) => (
            <div key={miniOrder.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{miniOrder.id} (Mini-Order #{miniOrder.miniOrderNumber})</span>
                <StatusBadge status={miniOrder.status} size="sm" />
              </div>

              <div className="space-y-1.5">
                {miniOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                    <div>
                      <span className={`font-semibold ${item.status === 'Cancelled' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {item.quantity}x {item.name}
                      </span>
                      {item.specialNotes && <p className="text-[10px] text-slate-500 italic">Note: {item.specialNotes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${item.status === 'Cancelled' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        LKR {(item.price * item.quantity).toLocaleString()}
                      </span>

                      {item.status === 'Cancelled' ? (
                        <StatusBadge status="Cancelled" size="sm" />
                      ) : (
                        <button
                          onClick={() => cancelOrderItem(currentOrder.id, miniOrder.id, item.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                          title="Cancel Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!miniOrder.isSentToKitchen && (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full mt-2"
                  icon={<Send className="w-3.5 h-3.5" />}
                  onClick={() => sendMiniOrderToKitchen(currentOrder.id, miniOrder.id)}
                >
                  Send to Kitchen (Print Ticket)
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Footer Summary & Proceed */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">
                LKR {(currentOrder?.subtotal || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between font-bold text-sm text-slate-800 pt-1 border-t border-slate-100">
              <span>Grand Total:</span>
              <span className="text-[#0B4EAE]">
                LKR {(currentOrder?.grandTotal || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full bg-[#0B4EAE] hover:bg-[#093D89]"
            disabled={!currentOrder || currentOrder.miniOrders.length === 0}
            onClick={() => currentOrder && navigate(`/billing?orderId=${currentOrder.id}`)}
          >
            Proceed to Billing Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};
