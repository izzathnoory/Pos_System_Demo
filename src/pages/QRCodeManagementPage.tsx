import React, { useState } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Printer, Waves } from 'lucide-react';

export const QRCodeManagementPage: React.FC = () => {
  const { tables } = useSystemStore();
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || '');

  const selectedTable = tables.find((t) => t.id === selectedTableId) || tables[0];
  const qrUrl = `${window.location.origin}/customer-menu?table=${selectedTable?.tableNumber.replace(/\s+/g, '')}`;

  const handlePrintQR = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Table QR Stand Generator</h2>
          <p className="text-xs text-slate-500">Generate and print customer QR menu standees for dining tables</p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={selectedTableId}
            onChange={(e) => setSelectedTableId(e.target.value)}
            options={tables.map((t) => ({ label: `${t.tableNumber} (${t.location})`, value: t.id }))}
            className="w-56"
          />
          <Button variant="primary" icon={<Printer className="w-4 h-4" />} onClick={handlePrintQR}>
            Print QR Stand
          </Button>
        </div>
      </div>

      {/* QR Stand Preview Card */}
      <div className="flex justify-center">
        <div
          id="printable-area"
          className="w-full max-w-sm bg-white rounded-3xl border-2 border-slate-800 p-8 shadow-2xl text-center space-y-6 animate-fade-in"
        >
          {/* Header Brand */}
          <div className="flex flex-col items-center">
            <div className="p-3 bg-[#0A192F] text-cyan-400 rounded-2xl mb-2">
              <Waves className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-wider">OCEAN CHEF</h1>
            <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-widest">
              Hotel & Restaurant
            </p>
          </div>

          <div className="py-2 border-y border-dashed border-slate-300">
            <span className="text-2xl font-black text-[#0B4EAE]">
              {selectedTable?.tableNumber}
            </span>
            <p className="text-xs text-slate-500 font-semibold">{selectedTable?.location}</p>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 bg-slate-900 rounded-2xl shadow-inner border-4 border-[#0B4EAE]/30 inline-block">
              {/* Simulated SVG QR Code */}
              <svg className="w-48 h-48 text-white" viewBox="0 0 100 100" fill="currentColor">
                <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="10" y="10" width="15" height="15" />
                <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="75" y="10" width="15" height="15" />
                <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="10" y="75" width="15" height="15" />
                <rect x="40" y="10" width="20" height="20" />
                <rect x="35" y="40" width="30" height="30" />
                <rect x="70" y="70" width="20" height="20" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-800">SCAN TO VIEW DIGITAL MENU</p>
            <p className="text-[10px] text-slate-500">
              Browse ocean delicacies & prices directly on your mobile device
            </p>
          </div>

          <div className="text-[9px] text-slate-400 font-mono border-t border-slate-100 pt-3">
            {qrUrl}
          </div>
        </div>
      </div>
    </div>
  );
};
