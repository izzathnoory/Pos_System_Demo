import React from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';
import { ExternalLink, ClipboardList } from 'lucide-react';

export const ActiveOrdersPage: React.FC = () => {
  const { orders } = useSystemStore();

  // Strict filter for active orders with non-cancelled items
  const activeOrders = orders.filter((o) => {
    if (o.status !== 'Active') return false;
    if (!o.miniOrders || o.miniOrders.length === 0) return false;
    const hasActiveItems = o.miniOrders.some((mo) =>
      mo.items.some((item) => item.status !== 'Cancelled')
    );
    return hasActiveItems;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-bold text-slate-800 text-base sm:text-lg">Active Kitchen & Dining Queue</h2>
          <p className="text-xs text-slate-500">Live order status tracker across all tables & take-away counter</p>
        </div>
        <span className="bg-[#0B4EAE] text-white text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
          {activeOrders.length} Active Orders
        </span>
      </div>

      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Active Orders in Queue</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All kitchen tickets have been served and paid for. Open POS to start a new order.
          </p>
          <Link to="/order-entry">
            <Button variant="primary" size="sm" className="mt-2">
              Start New Order
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {activeOrders.map((order) => {
            const validMiniOrders = order.miniOrders.filter((mo) =>
              mo.items.some((item) => item.status !== 'Cancelled')
            );

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-mono font-bold text-xs text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                        {order.orderNumber}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm mt-1">
                        {order.tableNumber || 'Take-Away'}
                      </h3>
                    </div>
                    <StatusBadge status={order.paymentStatus} />
                  </div>

                  {/* Valid Active Items List */}
                  <div className="space-y-3 pt-3">
                    {validMiniOrders.map((mo) => {
                      const activeItems = mo.items.filter((item) => item.status !== 'Cancelled');

                      return (
                        <div key={mo.id} className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                          <div className="flex justify-between text-[11px] font-bold text-slate-600">
                            <span>Mini-Order {mo.id}</span>
                            <span>{activeItems.length} Items</span>
                          </div>

                          {activeItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-xs py-1 border-t border-slate-200/60">
                              <div>
                                <span className="font-semibold text-slate-800">{item.quantity}x {item.name}</span>
                                {item.sentToKitchenAt && (
                                  <p className="text-[10px] text-slate-400">Sent at {item.sentToKitchenAt}</p>
                                )}
                              </div>
                              <StatusBadge status={item.status} size="sm" />
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#0B4EAE]">
                    LKR {order.grandTotal.toLocaleString()}
                  </span>
                  <Link to={`/order-entry?orderId=${order.id}`}>
                    <Button variant="outline" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                      Open POS
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
