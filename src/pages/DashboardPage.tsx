import React from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { Link, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Grid,
  AlertTriangle,
  PlusCircle,
  Receipt,
  ArrowRight,
  Boxes,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { orders, tables, inventory, createOrder } = useSystemStore();
  const navigate = useNavigate();

  // Calculate Metrics
  const todaySales = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const activeOrders = orders.filter((o) => {
    if (o.status !== 'Active') return false;
    if (!o.miniOrders || o.miniOrders.length === 0) return false;
    return o.miniOrders.some((mo) => mo.items.some((i) => i.status !== 'Cancelled'));
  });
  const activeOrdersCount = activeOrders.length;
  const occupiedTablesCount = tables.filter((t) => t.status === 'Occupied' || t.status === 'Merged').length;
  const lowStockItems = inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Out of Stock');

  const handleStartTakeAway = () => {
    const order = createOrder('Take-Away');
    navigate(`/order-entry?orderId=${order.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Low Stock Inventory Warning!</h4>
              <p className="text-xs text-amber-700">
                {lowStockItems.length} ingredient(s) ({lowStockItems.map((i) => i.name).join(', ')}) are below reorder level.
              </p>
            </div>
          </div>
          <Link to="/inventory">
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0">
              Manage Inventory
            </Button>
          </Link>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Today's Revenue"
          value={`LKR ${todaySales.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          trend={{ value: '14.2% vs yesterday', isPositive: true }}
        />
        <StatCard
          title="Active Live Orders"
          value={activeOrdersCount}
          icon={<ShoppingBag className="w-6 h-6" />}
          subtitle="Orders currently in kitchen/dining"
        />
        <StatCard
          title="Table Occupancy"
          value={`${occupiedTablesCount} / ${tables.length}`}
          icon={<Grid className="w-6 h-6" />}
          badge={`${Math.round((occupiedTablesCount / tables.length) * 100)}% Full`}
        />
        <StatCard
          title="Stock Alerts"
          value={lowStockItems.length}
          icon={<Boxes className="w-6 h-6" />}
          subtitle="Items needing restock"
        />
      </div>

      {/* Quick POS Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">Quick POS Terminal Controls</h3>
          <p className="text-xs text-slate-500">Initiate new orders or process instant billing</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Link to="/tables" className="w-full sm:w-auto">
            <Button variant="primary" icon={<PlusCircle className="w-4 h-4" />} className="w-full sm:w-auto">
              New Dine-In Order
            </Button>
          </Link>
          <Button variant="secondary" icon={<ShoppingBag className="w-4 h-4" />} onClick={handleStartTakeAway} className="w-full sm:w-auto">
            New Take-Away Order
          </Button>
          <Link to="/billing" className="w-full sm:w-auto">
            <Button variant="outline" icon={<Receipt className="w-4 h-4" />} className="w-full sm:w-auto">
              Go to Billing
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Layout: Tables Overview & Recent Active Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Table Status Grid (2 Cols span) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Live Dining Table Layout</h3>
              <p className="text-xs text-slate-500">Click occupied tables to view active order</p>
            </div>
            <Link to="/tables" className="text-xs font-semibold text-[#0B4EAE] hover:underline flex items-center gap-1">
              <span>Manage Floor Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {tables.map((table) => (
              <div
                key={table.id}
                onClick={() => {
                  if (table.currentOrderId) {
                    navigate(`/order-entry?orderId=${table.currentOrderId}`);
                  } else {
                    navigate(`/order-entry?tableId=${table.id}`);
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  table.status === 'Occupied'
                    ? 'bg-amber-50/60 border-amber-300 hover:border-amber-400'
                    : table.status === 'Reserved'
                    ? 'bg-indigo-50/60 border-indigo-300 hover:border-indigo-400'
                    : table.status === 'Merged'
                    ? 'bg-blue-50/60 border-blue-300 hover:border-blue-400'
                    : 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">{table.tableNumber}</span>
                  <StatusBadge status={table.status} size="sm" />
                </div>

                <div>
                  <p className="text-[11px] text-slate-500">{table.location} • Cap: {table.capacity}</p>
                  {table.currentOrderId && (
                    <p className="text-xs font-semibold text-amber-800 mt-1">Order Active</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Live Orders List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-base">Active Orders Queue</h3>
            <Link to="/active-orders" className="text-xs font-semibold text-[#0B4EAE] hover:underline">
              View All ({activeOrders.length})
            </Link>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {activeOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No active orders right now.</p>
            ) : (
              activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 transition-colors flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">{order.orderNumber}</span>
                      <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                        {order.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {order.tableNumber || order.customerName} • {order.miniOrders.length} Mini-Order(s)
                    </p>
                    <p className="text-xs font-bold text-[#0B4EAE]">
                      LKR {order.grandTotal.toLocaleString()}
                    </p>
                  </div>

                  <Link to={`/order-entry?orderId=${order.id}`}>
                    <Button variant="outline" size="sm">
                      Open POS
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
