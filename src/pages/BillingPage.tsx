import React, { useState, useEffect } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import type { Order } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { StatusBadge } from '../components/common/StatusBadge';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Receipt, CreditCard, User, Phone } from 'lucide-react';

export const BillingPage: React.FC = () => {
  const { orders, updateOrderDiscountsAndTaxes } = useSystemStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryOrderId = searchParams.get('orderId');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  useEffect(() => {
    if (queryOrderId) {
      const found = orders.find((o) => o.id === queryOrderId);
      if (found) {
        setSelectedOrder(found);
        setDiscountPercent(found.discountPercentage || 0);
        setCustomerName(found.customerName || '');
        setCustomerPhone(found.customerPhone || '');
      }
    } else {
      const active = orders.find((o) => o.status === 'Active' || o.paymentStatus === 'Unpaid');
      if (active) {
        setSelectedOrder(active);
        setDiscountPercent(active.discountPercentage || 0);
        setCustomerName(active.customerName || '');
        setCustomerPhone(active.customerPhone || '');
      }
    }
  }, [queryOrderId, orders]);

  const handleApplyDiscount = (pct: number) => {
    setDiscountPercent(pct);
    if (selectedOrder) {
      updateOrderDiscountsAndTaxes(selectedOrder.id, pct);
    }
  };

  const activeBillingOrders = orders.filter((o) => o.paymentStatus === 'Unpaid');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Selector Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Billing & Invoice Preparation</h2>
          <p className="text-xs text-slate-500">Combine mini-orders, apply discounts & generate final invoice</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Select Unpaid Order:</label>
          <select
            value={selectedOrder?.id || ''}
            onChange={(e) => {
              const found = orders.find((o) => o.id === e.target.value);
              if (found) setSelectedOrder(found);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800"
          >
            {activeBillingOrders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} ({o.type} - {o.tableNumber || o.customerName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Itemized Mini-Orders List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedOrder.orderNumber}
                </span>
                <h3 className="font-bold text-slate-800 text-base mt-1">
                  {selectedOrder.type} • {selectedOrder.tableNumber || 'Take Away'}
                </h3>
              </div>
              <StatusBadge status={selectedOrder.paymentStatus} />
            </div>

            {/* Mini Orders Breakdown Table */}
            <div className="space-y-4">
              {selectedOrder.miniOrders.map((mo) => (
                <div key={mo.id} className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50/40">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Mini-Order {mo.id} ({mo.items.length} Items)</span>
                    <span className="text-slate-500">{new Date(mo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-200">
                        <th className="py-1">Dish Name</th>
                        <th className="py-1 text-center">Qty</th>
                        <th className="py-1 text-right">Unit Price</th>
                        <th className="py-1 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mo.items.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="py-1.5 font-medium text-slate-800">{item.name}</td>
                          <td className="py-1.5 text-center">{item.quantity}</td>
                          <td className="py-1.5 text-right">LKR {item.price.toLocaleString()}</td>
                          <td className="py-1.5 text-right font-bold text-slate-900">
                            LKR {(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Customer Details Attachment */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                placeholder="e.g. Mr. Perera"
              />
              <Input
                label="Phone Number (for Loyalty Points)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                icon={<Phone className="w-4 h-4" />}
                placeholder="e.g. +94 77 123 4567"
              />
            </div>
          </div>

          {/* Right Column: Billing Summary & Discounts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
                Invoice Breakdown
              </h3>

              {/* Quick Discount Buttons */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Apply Discount Percentage
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => handleApplyDiscount(pct)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        discountPercent === pct
                          ? 'bg-[#0B4EAE] text-white border-[#0B4EAE]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pct === 0 ? 'None' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Financial Totals List */}
              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">
                    LKR {selectedOrder.subtotal.toLocaleString()}
                  </span>
                </div>

                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount ({selectedOrder.discountPercentage}%):</span>
                    <span className="font-semibold">
                      -LKR {selectedOrder.discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Government Tax ({selectedOrder.taxPercentage}%):</span>
                  <span className="font-semibold text-slate-800">
                    LKR {selectedOrder.taxAmount.toLocaleString()}
                  </span>
                </div>

                {selectedOrder.serviceChargeAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Service Charge ({selectedOrder.serviceChargePercentage}%):</span>
                    <span className="font-semibold text-slate-800">
                      LKR {selectedOrder.serviceChargeAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-extrabold text-base text-slate-900 border-t border-slate-200 pt-3 mt-2">
                  <span>Grand Total:</span>
                  <span className="text-[#0B4EAE]">
                    LKR {selectedOrder.grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full bg-[#0B4EAE] hover:bg-[#093D89]"
              icon={<CreditCard className="w-4 h-4" />}
              onClick={() => navigate(`/payment?orderId=${selectedOrder.id}`)}
            >
              Proceed to Payment Checkout
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="font-medium text-slate-600">No active unpaid orders selected for billing.</p>
        </div>
      )}
    </div>
  );
};
