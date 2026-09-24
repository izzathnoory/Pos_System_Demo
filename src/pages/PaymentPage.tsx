import React, { useState, useEffect } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import type { Order, PaymentMethod } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DollarSign, CreditCard, QrCode, Award, CheckCircle, ArrowLeft } from 'lucide-react';

export const PaymentPage: React.FC = () => {
  const { orders, processOrderPayment } = useSystemStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryOrderId = searchParams.get('orderId');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');

  useEffect(() => {
    if (queryOrderId) {
      const found = orders.find((o) => o.id === queryOrderId);
      if (found) {
        setSelectedOrder(found);
        setAmountReceived(found.grandTotal.toString());
      }
    } else {
      const unpaid = orders.find((o) => o.paymentStatus === 'Unpaid');
      if (unpaid) {
        setSelectedOrder(unpaid);
        setAmountReceived(unpaid.grandTotal.toString());
      }
    }
  }, [queryOrderId, orders]);

  const grandTotal = selectedOrder?.grandTotal || 0;
  const numAmountReceived = parseFloat(amountReceived) || 0;
  const changeGiven = paymentMethod === 'Cash' ? Math.max(0, numAmountReceived - grandTotal) : 0;

  const handleCompletePayment = () => {
    if (!selectedOrder) return;
    const success = processOrderPayment(
      selectedOrder.id,
      paymentMethod,
      numAmountReceived,
      transactionRef
    );
    if (success) {
      navigate('/order-history');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/billing')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 text-base sm:text-lg">Payment Checkout Terminal</h2>
            <p className="text-xs text-slate-500">Record customer payment and issue printed tax receipt</p>
          </div>
        </div>
        {selectedOrder && (
          <span className="text-xs font-mono font-bold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg shrink-0">
            {selectedOrder.orderNumber}
          </span>
        )}
      </div>

      {selectedOrder ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column: Order Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
              Payment Summary
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Order Type:</span>
                <span className="font-semibold text-slate-800">{selectedOrder.type}</span>
              </div>
              {selectedOrder.tableNumber && (
                <div className="flex justify-between">
                  <span>Table Number:</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.tableNumber}</span>
                </div>
              )}
              {selectedOrder.customerName && (
                <div className="flex justify-between">
                  <span>Customer Name:</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.customerName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">LKR {selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees:</span>
                <span className="font-semibold">
                  LKR {(selectedOrder.taxAmount + selectedOrder.serviceChargeAmount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-[#0B4EAE]/10 border border-[#0B4EAE]/20 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xs font-semibold text-[#0B4EAE] uppercase">Total Payable Amount</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B4EAE] mt-1">
                LKR {grandTotal.toLocaleString()}
              </h2>
            </div>
          </div>

          {/* Right Column: Payment Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
              Select Payment Method
            </h3>

            {/* Payment Method Selector Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {[
                { method: 'Cash' as PaymentMethod, icon: DollarSign, label: 'Cash Payment' },
                { method: 'Card' as PaymentMethod, icon: CreditCard, label: 'Credit/Debit Card' },
                { method: 'Online/QR' as PaymentMethod, icon: QrCode, label: 'Digital / QR Code' },
                { method: 'Loyalty Points' as PaymentMethod, icon: Award, label: 'Loyalty Points' },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.method}
                    onClick={() => setPaymentMethod(m.method)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === m.method
                        ? 'bg-[#0B4EAE] text-white border-[#0B4EAE] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-bold">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Method-Specific Inputs */}
            {paymentMethod === 'Cash' && (
              <div className="space-y-3 pt-2">
                <Input
                  label="Amount Received (LKR)"
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder="Enter cash amount..."
                />
                <div className="grid grid-cols-3 gap-2">
                  {[2000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmountReceived(amt.toString())}
                      className="py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      LKR {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                  <span>Balance Change to Return:</span>
                  <span className="font-extrabold text-sm">LKR {changeGiven.toLocaleString()}</span>
                </div>
              </div>
            )}

            {paymentMethod === 'Card' && (
              <Input
                label="Card Transaction Reference / Terminal Approval Code"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. TXN-98745612"
              />
            )}

            {paymentMethod === 'Online/QR' && (
              <Input
                label="LankaQR / Digital Wallet Ref Number"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. QR- CeylonPay-4411"
              />
            )}

            <Button
              variant="success"
              size="lg"
              className="w-full"
              icon={<CheckCircle className="w-4 h-4" />}
              onClick={handleCompletePayment}
            >
              Complete Payment & Print Receipt
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          No unpaid order selected for payment.
        </div>
      )}
    </div>
  );
};
