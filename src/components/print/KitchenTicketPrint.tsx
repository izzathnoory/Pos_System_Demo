import React from 'react';

interface KitchenTicketProps {
  data: {
    orderNumber: string;
    tableNumber: string;
    orderType: string;
    miniOrderId: string;
    items: { name: string; quantity: number; specialNotes?: string }[];
    timestamp: string;
  };
}

export const KitchenTicketPrint: React.FC<KitchenTicketProps> = ({ data }) => {
  return (
    <div className="font-mono text-sm leading-tight max-w-xs mx-auto p-4 border border-slate-300 rounded bg-white text-black">
      <div className="text-center border-b border-dashed border-slate-400 pb-2 mb-2">
        <h2 className="font-bold text-lg">KITCHEN TICKET</h2>
        <p className="text-xs">OCEAN CHEF HOTEL</p>
      </div>

      <div className="flex justify-between text-xs mb-2">
        <span>Order: <strong>{data.orderNumber}</strong></span>
        <span>Mini-Ord: <strong>{data.miniOrderId}</strong></span>
      </div>

      <div className="flex justify-between text-xs border-b border-dashed border-slate-400 pb-2 mb-2">
        <span>Type: <strong>{data.orderType}</strong></span>
        <span>Table: <strong>{data.tableNumber}</strong></span>
      </div>

      <div className="space-y-2 mb-4">
        {data.items.map((item, idx) => (
          <div key={idx} className="border-b border-slate-200 pb-1">
            <div className="flex justify-between font-bold">
              <span>{item.quantity}x {item.name}</span>
            </div>
            {item.specialNotes && (
              <p className="text-xs italic text-slate-700 pl-2">Note: {item.specialNotes}</p>
            )}
          </div>
        ))}
      </div>

      <div className="text-center border-t border-dashed border-slate-400 pt-2 text-xs">
        <p>Time: {data.timestamp}</p>
        <p className="font-bold mt-1">*** END OF TICKET ***</p>
      </div>
    </div>
  );
};
