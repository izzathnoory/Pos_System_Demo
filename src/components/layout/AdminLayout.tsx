import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PrintModal } from '../print/PrintModal';
import { ToastContainer } from '../common/Toast';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex h-full">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-[#0A192F] h-full z-10 shadow-2xl flex flex-col">
            <Sidebar
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileSidebarOpen(false)}
              onClose={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-slate-50/70">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">{children}</div>
        </main>
      </div>

      {/* Print Preview & Toasts */}
      <PrintModal />
      <ToastContainer />
    </div>
  );
};
