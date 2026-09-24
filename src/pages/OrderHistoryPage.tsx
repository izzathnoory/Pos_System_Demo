import React, { useState } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import type { Order } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { Search, Printer, Eye, X } from 'lucide-react';

export const OrderHistoryPage: React.FC = () => {
  const { orders, setPrintData } = useSystemStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Historical Order Invoices ({orders.length})</h2>
          <p className="text-xs text-slate-500">Complete audit log of all dine-in and take-away transactions</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Input
            placeholder="Search by Order # or Customer..."
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
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Order Number</th>
                <th className="p-4">Type & Table</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Date / Time</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4 text-right">Grand Total</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-indigo-900">{order.orderNumber}</td>
                  <td className="p-4 font-medium text-slate-800">
                    {order.type} • {order.tableNumber || 'Take Away'}
                  </td>
                  <td className="p-4 text-slate-700">{order.customerName || 'Walk-in Guest'}</td>
                  <td className="p-4 text-slate-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 font-medium text-slate-700">{order.paymentMethod || 'N/A'}</td>
                  <td className="p-4 text-right font-extrabold text-[#0B4EAE]">
                    LKR {order.grandTotal.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedOrderDetails(order)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPrintData({ type: 'receipt', data: order })}
                        className="p-1.5 rounded-lg bg-[#0B4EAE]/10 hover:bg-[#0B4EAE]/20 text-[#0B4EAE] transition-colors"
                        title="Reprint Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrderDetails}
        onClose={() => setSelectedOrderDetails(null)}
        title={`Order Details - ${selectedOrderDetails?.orderNumber}`}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setSelectedOrderDetails(null)}>
              Close
            </Button>
            {selectedOrderDetails && (
              <Button
                variant="primary"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => {
                  setPrintData({ type: 'receipt', data: selectedOrderDetails });
                  setSelectedOrderDetails(null);
                }}
              >
                Print Tax Receipt
              </Button>
            )}
          </div>
        }
      >
        {selectedOrderDetails && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
              <div><span className="text-slate-500">Customer:</span> <strong>{selectedOrderDetails.customerName}</strong></div>
              <div><span className="text-slate-500">Phone:</span> <strong>{selectedOrderDetails.customerPhone || 'N/A'}</strong></div>
              <div><span className="text-slate-500">Type:</span> <strong>{selectedOrderDetails.type}</strong></div>
              <div><span className="text-slate-500">Table:</span> <strong>{selectedOrderDetails.tableNumber || 'N/A'}</strong></div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-800">Purchased Items</h4>
              {selectedOrderDetails.miniOrders.flatMap((m) => m.items).map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-100">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-bold">LKR {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 text-right space-y-1 font-bold">
              <div>Subtotal: LKR {selectedOrderDetails.subtotal.toLocaleString()}</div>
              <div>Tax (10%): LKR {selectedOrderDetails.taxAmount.toLocaleString()}</div>
              <div className="text-[#0B4EAE] text-sm pt-1">
                Grand Total: LKR {selectedOrderDetails.grandTotal.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
