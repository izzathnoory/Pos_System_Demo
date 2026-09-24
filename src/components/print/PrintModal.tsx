import React from 'react';
import { useSystemStore } from '../../context/SystemStoreContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { KitchenTicketPrint } from './KitchenTicketPrint';
import { ReceiptPrint } from './ReceiptPrint';
import { Printer } from 'lucide-react';

export const PrintModal: React.FC = () => {
  const { printData, setPrintData } = useSystemStore();

  if (!printData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={!!printData}
      onClose={() => setPrintData(null)}
      title={
        printData.type === 'kitchen'
          ? 'Kitchen Ticket Print Preview'
          : printData.type === 'receipt'
          ? 'Customer Receipt Print Preview'
          : 'Print Preview'
      }
      maxWidth="md"
      footer={
        <div className="flex gap-3 w-full justify-between">
          <Button variant="outline" onClick={() => setPrintData(null)}>
            Close
          </Button>
          <Button variant="primary" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Document
          </Button>
        </div>
      }
    >
      <div id="printable-area" className="py-2">
        {printData.type === 'kitchen' && <KitchenTicketPrint data={printData.data} />}
        {printData.type === 'receipt' && <ReceiptPrint data={printData.data} />}
      </div>
    </Modal>
  );
};
