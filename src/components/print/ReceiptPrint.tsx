import React from 'react';
import type { Order } from '../../types';

interface ReceiptPrintProps {
  data: Order & {
    paymentMethod?: string;
    amountReceived?: number;
    changeGiven?: number;
    paidAt?: string;
  };
}

export const ReceiptPrint: React.FC<ReceiptPrintProps> = ({ data }) => {
  return (
    <div className="font-mono text-xs leading-tight max-w-sm mx-auto p-5 border border-slate-300 rounded bg-white text-black">
      <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
        <h1 className="font-bold text-lg">POS SYSTEM BY NEXZOA</h1>
        <p className="text-[10px]">No. 42 Marine Drive, Colombo 03</p>
        <p className="text-[10px]">Tel: +94 11 234 5678</p>
        <h2 className="font-bold text-xs mt-2 uppercase">Official Tax Receipt</h2>
      </div>

      <div className="space-y-1 mb-3 text-[11px]">
        <div className="flex justify-between"><span>Bill No:</span> <strong>{data.orderNumber}</strong></div>
        <div className="flex justify-between"><span>Date/Time:</span> <span>{new Date(data.paidAt || data.updatedAt).toLocaleString()}</span></div>
        <div className="flex justify-between"><span>Type:</span> <span>{data.type}</span></div>
        {data.tableNumber && <div className="flex justify-between"><span>Table:</span> <span>{data.tableNumber}</span></div>}
        {data.customerName && <div className="flex justify-between"><span>Customer:</span> <span>{data.customerName}</span></div>}
      </div>

      <table className="w-full text-left mb-3 border-t border-b border-dashed border-slate-400 py-2">
        <thead>
          <tr className="border-b border-slate-200 text-[10px]">
            <th className="py-1">Item</th>
            <th className="text-center py-1">Qty</th>
            <th className="text-right py-1">Price</th>
            <th className="text-right py-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.miniOrders?.flatMap((mo) => mo.items).map((item, idx) => (
            <tr key={idx} className="border-b border-slate-100">
              <td className="py-1">{item.name}</td>
              <td className="text-center py-1">{item.quantity}</td>
              <td className="text-right py-1">{item.price.toLocaleString()}</td>
              <td className="text-right py-1">{(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 text-right mb-3 text-[11px]">
        <div className="flex justify-between"><span>Subtotal:</span> <span>LKR {data.subtotal.toLocaleString()}</span></div>
        {data.discountAmount > 0 && (
          <div className="flex justify-between text-rose-600"><span>Discount ({data.discountPercentage}%):</span> <span>-LKR {data.discountAmount.toLocaleString()}</span></div>
        )}
        <div className="flex justify-between"><span>Tax ({data.taxPercentage}%):</span> <span>LKR {data.taxAmount.toLocaleString()}</span></div>
        {data.serviceChargeAmount > 0 && (
          <div className="flex justify-between"><span>Service Charge ({data.serviceChargePercentage}%):</span> <span>LKR {data.serviceChargeAmount.toLocaleString()}</span></div>
        )}
        <div className="flex justify-between font-bold text-sm border-t border-slate-400 pt-1 mt-1">
          <span>NET TOTAL:</span> <span>LKR {data.grandTotal.toLocaleString()}</span>
        </div>
      </div>

      {data.paymentMethod && (
        <div className="border-t border-dashed border-slate-400 pt-2 mb-3 text-[11px]">
          <div className="flex justify-between"><span>Payment Method:</span> <strong>{data.paymentMethod}</strong></div>
          {data.amountReceived && <div className="flex justify-between"><span>Paid Amount:</span> <span>LKR {data.amountReceived.toLocaleString()}</span></div>}
          {data.changeGiven !== undefined && data.changeGiven > 0 && (
            <div className="flex justify-between font-bold"><span>Balance Change:</span> <span>LKR {data.changeGiven.toLocaleString()}</span></div>
          )}
        </div>
      )}

      <div className="text-center text-[10px] border-t border-dashed border-slate-400 pt-3">
        <p>Thank you for choosing POS System By Nexzoa!</p>
        <p className="text-[9px] text-slate-500 mt-1">Software Powered by POS System By Nexzoa</p>
      </div>
    </div>
  );
};
