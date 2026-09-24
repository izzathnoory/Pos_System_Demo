import React, { useState } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import { StatCard } from '../components/common/StatCard';
import { Button } from '../components/common/Button';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Download } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { orders } = useSystemStore();
  const [timeRange, setTimeRange] = useState<'Today' | 'Week' | 'Month'>('Today');

  const paidOrders = orders.filter((o) => o.paymentStatus === 'Paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalOrdersCount = paidOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  const cashSales = paidOrders.filter((o) => o.paymentMethod === 'Cash').reduce((sum, o) => sum + o.grandTotal, 0);

  // Popular items calculation
  const itemSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  paidOrders.forEach((o) => {
    o.miniOrders.forEach((mo) => {
      mo.items.forEach((item) => {
        if (!itemSalesMap[item.name]) {
          itemSalesMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
        }
        itemSalesMap[item.name].qty += item.quantity;
        itemSalesMap[item.name].revenue += item.price * item.quantity;
      });
    });
  });

  const popularItems = Object.values(itemSalesMap).sort((a, b) => b.qty - a.qty);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-bold text-slate-800 text-base sm:text-lg">Financial & Sales Analytics</h2>
          <p className="text-xs text-slate-500">Executive performance metrics, dish popularity & revenue insights</p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['Today', 'Week', 'Month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  timeRange === r ? 'bg-[#0B4EAE] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard
          title="Total Gross Revenue"
          value={`LKR ${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          trend={{ value: '18.4% growth', isPositive: true }}
        />
        <StatCard
          title="Completed Orders"
          value={totalOrdersCount}
          icon={<ShoppingBag className="w-6 h-6" />}
          subtitle="Total fulfilled invoices"
        />
        <StatCard
          title="Average Check / Order"
          value={`LKR ${avgOrderValue.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6" />}
          subtitle="Per customer transaction"
        />
        <StatCard
          title="Cash vs Digital Split"
          value={`${Math.round((cashSales / (totalRevenue || 1)) * 100)}% Cash`}
          icon={<BarChart3 className="w-6 h-6" />}
          subtitle={`LKR ${cashSales.toLocaleString()} Cash`}
        />
      </div>

      {/* Reports Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Popular Dishes Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
            Top Performing Menu Items
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-200">
                  <th className="py-2">Rank</th>
                  <th className="py-2">Dish Name</th>
                  <th className="py-2 text-center">Quantity Sold</th>
                  <th className="py-2 text-right">Total Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {popularItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-3 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-3 text-center font-bold text-[#0B4EAE]">{item.qty}</td>
                    <td className="py-3 text-right font-extrabold text-slate-900">
                      LKR {item.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Order Type Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
            Revenue Channel Breakdown
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Dine-In Restaurant</span>
                <span className="text-[#0B4EAE]">
                  LKR {paidOrders.filter((o) => o.type === 'Dine-In').reduce((s, o) => s + o.grandTotal, 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#0B4EAE] h-full" style={{ width: '70%' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Take-Away Orders</span>
                <span className="text-[#0B4EAE]">
                  LKR {paidOrders.filter((o) => o.type === 'Take-Away').reduce((s, o) => s + o.grandTotal, 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full" style={{ width: '30%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
