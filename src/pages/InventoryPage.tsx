import React, { useState } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import type { InventoryItem } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { StatusBadge } from '../components/common/StatusBadge';
import { Drawer } from '../components/common/Drawer';
import { Modal } from '../components/common/Modal';
import { Search, Plus } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { inventory, suppliers, addInventoryItem, adjustStock } = useSystemStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [stockDelta, setStockDelta] = useState<string>('5');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Seafood',
    quantity: '10',
    unit: 'kg' as 'kg' | 'g' | 'L' | 'ml' | 'pcs' | 'packs',
    minReorderLevel: '5',
    unitCost: '1500',
    supplierId: suppliers[0]?.id || '',
  });

  const handleOpenDrawer = () => {
    setFormData({
      name: '',
      category: 'Seafood',
      quantity: '10',
      unit: 'kg',
      minReorderLevel: '5',
      unitCost: '1500',
      supplierId: suppliers[0]?.id || '',
    });
    setIsDrawerOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === formData.supplierId);
    addInventoryItem({
      name: formData.name,
      category: formData.category,
      quantity: parseFloat(formData.quantity) || 0,
      unit: formData.unit,
      minReorderLevel: parseFloat(formData.minReorderLevel) || 0,
      unitCost: parseFloat(formData.unitCost) || 0,
      supplierId: formData.supplierId,
      supplierName: sup ? sup.companyName : 'Local Market',
    });
    setIsDrawerOpen(false);
  };

  const handleConfirmStockAdjust = () => {
    if (adjustingItem) {
      adjustStock(adjustingItem.id, parseFloat(stockDelta) || 0);
      setAdjustingItem(null);
    }
  };

  const filteredInventory = inventory.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-bold text-slate-800 text-base sm:text-lg">Raw Ingredient & Stock Inventory</h2>
          <p className="text-xs text-slate-500">Monitor ingredient levels, reorder thresholds & supplier linkages</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search stock..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="w-full sm:w-64"
          />
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenDrawer}
            className="w-full sm:w-auto"
          >
            Add Ingredient
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Ingredient Name</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">Available Stock</th>
                <th className="p-4 text-center">Reorder Threshold</th>
                <th className="p-4 text-right">Unit Cost</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4 text-center">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">{item.name}</td>
                  <td className="p-4 text-slate-600">{item.category}</td>
                  <td className="p-4 text-center font-bold text-slate-900">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="p-4 text-center text-slate-500">
                    {item.minReorderLevel} {item.unit}
                  </td>
                  <td className="p-4 text-right font-medium text-slate-800">
                    LKR {item.unitCost.toLocaleString()}
                  </td>
                  <td className="p-4 text-slate-600">{item.supplierName}</td>
                  <td className="p-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setAdjustingItem(item)}
                      className="px-2.5 py-1 rounded-lg bg-[#0B4EAE]/10 text-[#0B4EAE] hover:bg-[#0B4EAE]/20 font-semibold text-xs transition-colors"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Add New Inventory Stock"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveItem}>
              Save Ingredient
            </Button>
          </div>
        }
      >
        <form className="space-y-4">
          <Input
            label="Ingredient Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Jumbo Prawns"
            required
          />
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g. Seafood"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
            <Select
              label="Unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
              options={[
                { label: 'Kilograms (kg)', value: 'kg' },
                { label: 'Grams (g)', value: 'g' },
                { label: 'Liters (L)', value: 'L' },
                { label: 'Pieces (pcs)', value: 'pcs' },
                { label: 'Packs', value: 'packs' },
              ]}
            />
          </div>
          <Input
            label="Min Reorder Level"
            type="number"
            value={formData.minReorderLevel}
            onChange={(e) => setFormData({ ...formData, minReorderLevel: e.target.value })}
          />
          <Input
            label="Unit Cost (LKR)"
            type="number"
            value={formData.unitCost}
            onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
          />
          <Select
            label="Supplier"
            value={formData.supplierId}
            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            options={suppliers.map((s) => ({ label: s.companyName, value: s.id }))}
          />
        </form>
      </Drawer>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={!!adjustingItem}
        onClose={() => setAdjustingItem(null)}
        title={`Adjust Stock - ${adjustingItem?.name}`}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setAdjustingItem(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmStockAdjust}>
              Update Stock
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p>
            Current Stock: <strong>{adjustingItem?.quantity} {adjustingItem?.unit}</strong>
          </p>
          <Input
            label="Stock Quantity Adjustment (+ for addition, - for deduction)"
            type="number"
            value={stockDelta}
            onChange={(e) => setStockDelta(e.target.value)}
            placeholder="e.g. 5 or -2"
          />
        </div>
      </Modal>
    </div>
  );
};
