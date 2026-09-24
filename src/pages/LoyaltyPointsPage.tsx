import React, { useState } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import type { Customer } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Award, Search, Plus } from 'lucide-react';

export const LoyaltyPointsPage: React.FC = () => {
  const { customers, addCustomer, addLoyaltyPoints } = useSystemStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [adjustingCust, setAdjustingCust] = useState<Customer | null>(null);
  const [ptsDelta, setPtsDelta] = useState<string>('50');

  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer({ ...formData, lastVisit: new Date().toISOString().split('T')[0] });
    setIsModalOpen(false);
    setFormData({ name: '', phone: '', email: '' });
  };

  const handleConfirmAdjust = () => {
    if (adjustingCust) {
      addLoyaltyPoints(adjustingCust.id, parseInt(ptsDelta) || 0);
      setAdjustingCust(null);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Customer Loyalty & Rewards Program ({customers.length})</h2>
          <p className="text-xs text-slate-500">Track frequent diners, points tier progression & reward redemptions</p>
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="w-64"
          />
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            Register Member
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    cust.tier === 'Platinum'
                      ? 'bg-purple-100 text-purple-800'
                      : cust.tier === 'Gold'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {cust.tier} Tier
                </span>
              </div>

              <h3 className="font-bold text-slate-800 text-base">{cust.name}</h3>
              <p className="text-xs text-slate-500 mb-3">{cust.phone} • {cust.email}</p>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block">Total Visits</span>
                  <strong className="text-slate-800 font-bold">{cust.totalVisits} Times</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Spent</span>
                  <strong className="text-slate-800 font-bold">LKR {cust.totalSpent.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Loyalty Points</span>
                <p className="text-lg font-extrabold text-[#0B4EAE]">{cust.loyaltyPoints} PTS</p>
              </div>
              <button
                onClick={() => setAdjustingCust(cust)}
                className="px-3 py-1.5 rounded-lg bg-[#0B4EAE]/10 text-[#0B4EAE] hover:bg-[#0B4EAE]/20 text-xs font-semibold"
              >
                Add Points
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Register Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Loyalty Member"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveCustomer}>
              Register Customer
            </Button>
          </div>
        }
      >
        <form className="space-y-3">
          <Input
            label="Customer Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Kasun Wickramasinghe"
            required
          />
          <Input
            label="Mobile Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="e.g. +94 77 123 4567"
            required
          />
          <Input
            label="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. kasun@gmail.com"
          />
        </form>
      </Modal>

      {/* Adjust Points Modal */}
      <Modal
        isOpen={!!adjustingCust}
        onClose={() => setAdjustingCust(null)}
        title={`Adjust Loyalty Points - ${adjustingCust?.name}`}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setAdjustingCust(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmAdjust}>
              Update Points
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p>Current Points Balance: <strong>{adjustingCust?.loyaltyPoints} PTS</strong></p>
          <Input
            label="Points Delta (+ to award, - to redeem)"
            type="number"
            value={ptsDelta}
            onChange={(e) => setPtsDelta(e.target.value)}
            placeholder="e.g. 100"
          />
        </div>
      </Modal>
    </div>
  );
};
