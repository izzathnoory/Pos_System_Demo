import React from 'react';
import { ToastContainer } from '../common/Toast';
import { Waves } from 'lucide-react';

export const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Customer Header */}
      <header className="bg-[#0A192F] text-white py-4 px-6 shadow-md border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0B4EAE] rounded-xl text-white">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide text-white leading-tight">
                POS SYSTEM BY NEXZOA
              </h1>
              <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                Restaurant & Hotel POS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-800 text-cyan-300 px-3 py-1 rounded-full font-medium border border-slate-700">
              Colombo 03
            </span>
          </div>
        </div>
      </header>

      {/* Main Public Page Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">{children}</main>

      <ToastContainer />
    </div>
  );
};
