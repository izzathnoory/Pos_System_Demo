import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  Grid,
  ClipboardList,
  BarChart3,
  History,
  Clock,
  Boxes,
  Truck,
  QrCode,
  Award,
  Monitor,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Waves,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Order Entry / POS', path: '/order-entry', icon: ClipboardList },
    { label: 'Table Management', path: '/tables', icon: Grid },
    { label: 'Active Orders', path: '/active-orders', icon: Clock },
    { label: 'Menu Items', path: '/menu', icon: UtensilsCrossed },
    { label: 'Categories', path: '/categories', icon: Layers },
    { label: 'Order History', path: '/order-history', icon: History },
    { label: 'Inventory & Stock', path: '/inventory', icon: Boxes },
    { label: 'Suppliers', path: '/suppliers', icon: Truck },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { label: 'QR Code Generator', path: '/qr-codes', icon: QrCode },
    { label: 'Loyalty Program', path: '/loyalty', icon: Award },
    { label: 'Customer Display Mgmt', path: '/display-settings', icon: Monitor },
    { label: 'System Settings', path: '/settings', icon: Settings },
    { label: 'Backup & Security', path: '/backup', icon: ShieldCheck },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between bg-[#0A192F] text-slate-300 transition-all duration-300 z-30 shadow-2xl border-r border-slate-800 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header / Brand */}
      <div>
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2.5 bg-gradient-to-tr from-[#0B4EAE] to-[#00D2FF] text-white rounded-xl shadow-lg shrink-0">
              <Waves className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-white tracking-wide text-base leading-tight">
                  OCEAN CHEF
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
                  Hotel System
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-[#0B4EAE] text-white shadow-md shadow-[#0B4EAE]/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#061026]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40">
          <div className="flex items-center gap-3 overflow-hidden">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-cyan-400 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#0B4EAE] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.[0] || 'A'}
              </div>
            )}
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-white truncate">{user?.name}</span>
                <span className="text-[10px] text-slate-400 capitalize">{user?.role}</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
