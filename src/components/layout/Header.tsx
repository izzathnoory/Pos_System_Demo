import React, { useState, useEffect } from 'react';
import { useSystemStore } from '../../context/SystemStoreContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
  Clock,
  PlusCircle,
  Menu as MenuIcon,
  ExternalLink,
  AlertTriangle,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { inventory } = useSystemStore() as any;
  const { user, logout: authLogout } = useAuth();
  const location = useLocation();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const lowStockCount = inventory.filter((i: any) => i.status === 'Low Stock' || i.status === 'Out of Stock').length;

  const pageTitles: Record<string, string> = {
    '/': 'Executive Dashboard',
    '/order-entry': 'POS Order Entry',
    '/tables': 'Table Floor Management',
    '/active-orders': 'Active Live Orders',
    '/billing': 'Billing & Invoicing',
    '/payment': 'Payment Checkout',
    '/menu': 'Menu Item Management',
    '/categories': 'Category Management',
    '/order-history': 'Historical Order Records',
    '/inventory': 'Inventory & Stock Control',
    '/suppliers': 'Supplier Directory',
    '/reports': 'Financial & Sales Analytics',
    '/qr-codes': 'Table QR Code Generator',
    '/loyalty': 'Customer Loyalty Program',
    '/display-settings': 'Customer 2-Way Display Config',
    '/settings': 'Hotel System Settings',
    '/backup': 'Database Backup & System Security',
  };

  const currentTitle = pageTitles[location.pathname] || 'POS System By Nexzoa';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between z-20 shrink-0 shadow-xs">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 shrink-0"
          aria-label="Open Navigation Menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg font-bold text-slate-800 tracking-tight truncate">{currentTitle}</h1>
          <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">POS System By Nexzoa</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Auto Clock */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
          <Clock className="w-3.5 h-3.5 text-[#0B4EAE]" />
          <span>{time}</span>
        </div>

        {/* Low Stock Warning Pill */}
        {lowStockCount > 0 && (
          <Link
            to="/inventory"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{lowStockCount} Low Stock</span>
          </Link>
        )}

        {/* Quick POS Order Button */}
        <Link
          to="/order-entry"
          className="hidden lg:flex items-center gap-2 bg-[#0B4EAE] hover:bg-[#093D89] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New POS Order</span>
        </Link>

        {/* Customer Public Menu Link */}
        <a
          href="/customer-menu"
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold hover:bg-cyan-100 transition-colors"
          title="Open Public Customer QR Menu"
        >
          <ExternalLink className="w-3.5 h-3.5 text-cyan-600" />
          <span>QR Menu</span>
        </a>

        {/* User & Signout */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user?.role || 'Staff'}</p>
          </div>
          <button
            onClick={authLogout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
