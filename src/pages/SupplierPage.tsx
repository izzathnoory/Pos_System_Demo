import React, { useState } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import type { Supplier } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Truck, Plus, Phone, Mail, MapPin, Edit2 } from 'lucide-react';

export const SupplierPage: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier } = useSystemStore();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    category: '',
    address: '',
    outstandingBalance: '0',
  });

  const handleOpenModal = (sup?: Supplier) => {
    if (sup) {
      setEditingSupplier(sup);
      setFormData({
        companyName: sup.companyName,
        contactPerson: sup.contactPerson,
        phone: sup.phone,
        email: sup.email,
        category: sup.category,
        address: sup.address,
        outstandingBalance: sup.outstandingBalance.toString(),
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        category: 'Fresh Seafood',
        address: '',
        outstandingBalance: '0',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, {
        ...formData,
        outstandingBalance: parseFloat(formData.outstandingBalance) || 0,
      });
    } else {
      addSupplier({
        ...formData,
        outstandingBalance: parseFloat(formData.outstandingBalance) || 0,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-bold text-slate-800 text-base sm:text-lg">Supplier Directory & Accounts ({suppliers.length})</h2>
          <p className="text-xs text-slate-500">Manage vendor contact details and payables</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto"
        >
          Add New Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {suppliers.map((sup) => (
          <div
            key={sup.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-[#0B4EAE]/10 text-[#0B4EAE] rounded-xl">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {sup.category}
                </span>
              </div>

              <h3 className="font-bold text-slate-800 text-base">{sup.companyName}</h3>
              <p className="text-xs text-slate-500 mb-3">Contact: {sup.contactPerson}</p>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sup.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sup.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sup.address}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Outstanding Payables</span>
                <span className={`text-sm font-extrabold ${sup.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  LKR {sup.outstandingBalance.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => handleOpenModal(sup)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier Details' : 'Add New Supplier'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Supplier
            </Button>
          </div>
        }
      >
        <form className="space-y-3">
          <Input
            label="Company Name"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="e.g. Mirissa Ocean Catch Co."
            required
          />
          <Input
            label="Contact Person"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            placeholder="e.g. Kamal Silva"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+94 77 ..."
            />
            <Input
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="orders@supplier.lk"
            />
          </div>
          <Input
            label="Category / Supplied Items"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g. Fresh Seafood"
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. Harbour Road, Mirissa"
          />
          <Input
            label="Outstanding Payable Balance (LKR)"
            type="number"
            value={formData.outstandingBalance}
            onChange={(e) => setFormData({ ...formData, outstandingBalance: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};
