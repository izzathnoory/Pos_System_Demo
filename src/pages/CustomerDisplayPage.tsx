import React, { useState, useEffect } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import { Waves, Sparkles, ShoppingBag } from 'lucide-react';

export const CustomerDisplayPage: React.FC = () => {
  const { displaySettings, orders } = useSystemStore();

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Active active order to show on display (if any active checkout order exists)
  const activeOrder = orders.find((o) => o.status === 'Active' || o.paymentStatus === 'Unpaid');

  useEffect(() => {
    if (displaySettings.slides.length > 0) {
      const interval = setInterval(() => {
        setActiveSlideIndex((prev) => (prev + 1) % displaySettings.slides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [displaySettings.slides]);

  const currentSlide = displaySettings.slides[activeSlideIndex] || displaySettings.slides[0];

  return (
    <div className="min-h-screen w-full bg-[#0A192F] text-white flex flex-col justify-between p-4 sm:p-6 md:p-8 overflow-y-auto lg:overflow-hidden select-none">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-[#0B4EAE] rounded-2xl">
            <Waves className="w-6 h-6 sm:w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white">
              {displaySettings.bannerTitle}
            </h1>
            <p className="text-[11px] sm:text-xs text-cyan-400 font-semibold">{displaySettings.bannerSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-700 text-xs font-bold text-cyan-300">
          <Sparkles className="w-4 h-4" />
          <span>Customer Live Display</span>
        </div>
      </div>

      {/* Main Grid: Left Promotional Banner, Right Live Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 flex-1 py-4 sm:py-6 overflow-hidden">
        {/* Left Column: Promo Slideshow */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col justify-end p-6 sm:p-8 bg-slate-900 min-h-[260px] sm:min-h-[320px] lg:min-h-auto">
          <img
            src={currentSlide?.image}
            alt={currentSlide?.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <div className="relative z-10 space-y-2">
            <span className="bg-[#0B4EAE] text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              {currentSlide?.tag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentSlide?.title}
            </h2>
          </div>
        </div>

        {/* Right Column: Live Checkout Cart Items */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-base text-slate-200">Current Order Summary</span>
              <span className="text-xs text-cyan-400 font-mono">
                {activeOrder ? activeOrder.orderNumber : 'Welcome Guest'}
              </span>
            </div>

            {activeOrder && activeOrder.miniOrders.length > 0 ? (
              activeOrder.miniOrders.flatMap((mo) => mo.items).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#0B4EAE] text-white flex items-center justify-center font-bold text-xs">
                      {item.quantity}
                    </span>
                    <span className="font-semibold text-slate-100">{item.name}</span>
                  </div>
                  <span className="font-bold text-cyan-300">
                    LKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-2">
                <ShoppingBag className="w-10 h-10 text-slate-600" />
                <p className="text-sm font-medium">Items added at cashier counter will appear here live.</p>
              </div>
            )}
          </div>

          {/* Footer Total */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-sm font-bold text-slate-400 uppercase">Grand Total</span>
              <span className="text-3xl font-black text-cyan-400">
                LKR {(activeOrder?.grandTotal || 0).toLocaleString()}
              </span>
            </div>

            <p className="text-center text-xs text-slate-400 italic">
              {displaySettings.thankYouMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
