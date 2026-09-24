import React, { useState } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import type { MenuItem } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Drawer } from '../components/common/Drawer';
import { Modal } from '../components/common/Modal';
import { Search, Plus, Edit2, Trash2, Clock, Check, X, Star } from 'lucide-react';

export const MenuManagementPage: React.FC = () => {
  const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability } = useSystemStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    price: '',
    description: '',
    image: '',
    preparationTimeMinutes: '15',
    isPopular: false,
  });

  const handleOpenDrawer = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        name: item.name,
        categoryId: item.categoryId,
        price: item.price.toString(),
        description: item.description,
        image: item.image,
        preparationTimeMinutes: item.preparationTimeMinutes.toString(),
        isPopular: item.isPopular || false,
      });
    } else {
      setEditingItem(null);
      setFormData({
        code: `SF0${menuItems.length + 1}`,
        name: '',
        categoryId: categories[0]?.id || '',
        price: '',
        description: '',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        preparationTimeMinutes: '15',
        isPopular: false,
      });
    }
    setIsDrawerOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === formData.categoryId);
    const categoryName = cat ? cat.name : 'Uncategorized';

    if (editingItem) {
      updateMenuItem(editingItem.id, {
        code: formData.code,
        name: formData.name,
        categoryId: formData.categoryId,
        categoryName,
        price: parseFloat(formData.price) || 0,
        description: formData.description,
        image: formData.image,
        preparationTimeMinutes: parseInt(formData.preparationTimeMinutes) || 15,
        isPopular: formData.isPopular,
      });
    } else {
      addMenuItem({
        code: formData.code,
        name: formData.name,
        categoryId: formData.categoryId,
        categoryName,
        price: parseFloat(formData.price) || 0,
        description: formData.description,
        image: formData.image,
        isAvailable: true,
        preparationTimeMinutes: parseInt(formData.preparationTimeMinutes) || 15,
        isPopular: formData.isPopular,
      });
    }
    setIsDrawerOpen(false);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.categoryId === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search dish by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="w-full sm:w-72"
          />
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-[#0B4EAE] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#0B4EAE] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenDrawer()}
          className="w-full sm:w-auto"
        >
          Add New Dish
        </Button>
      </div>

      {/* Menu Item Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
              !item.isAvailable ? 'opacity-60 bg-slate-50 border-slate-200' : 'border-slate-200/80'
            }`}
          >
            <div>
              {/* Dish Image & Badges */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-slate-900/80 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {item.code}
                </div>
                {item.isPopular && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-current" />
                    Popular
                  </div>
                )}
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white font-bold text-sm uppercase tracking-wider backdrop-blur-xs">
                    Sold Out / Unavailable
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-1">{item.name}</h3>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">{item.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400 font-medium">{item.categoryName}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {item.preparationTimeMinutes} mins
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Price & Controls */}
            <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-base font-extrabold text-[#0B4EAE]">
                LKR {item.price.toLocaleString()}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleMenuItemAvailability(item.id)}
                  className={`p-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    item.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                  }`}
                  title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                >
                  {item.isAvailable ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleOpenDrawer(item)}
                  className="p-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-colors"
                  title="Edit Dish"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(item.id)}
                  className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors"
                  title="Delete Dish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingItem ? 'Edit Dish Item' : 'Add New Menu Item'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {editingItem ? 'Update Dish' : 'Save Dish'}
            </Button>
          </div>
        }
      >
        <form className="space-y-4">
          <Input
            label="Dish Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g. SF01"
            required
          />
          <Input
            label="Dish Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Grilled Ocean Lobster"
            required
          />
          <Select
            label="Category"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
          <Input
            label="Price (LKR)"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g. 4800"
            required
          />
          <Input
            label="Preparation Time (Minutes)"
            type="number"
            value={formData.preparationTimeMinutes}
            onChange={(e) => setFormData({ ...formData, preparationTimeMinutes: e.target.value })}
            placeholder="e.g. 20"
          />
          <Input
            label="Image URL"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <textarea
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4EAE]/30"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter dish description..."
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPopular"
              checked={formData.isPopular}
              onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
              className="w-4 h-4 text-[#0B4EAE] rounded border-slate-300"
            />
            <label htmlFor="isPopular" className="text-xs font-semibold text-slate-700">
              Mark as Chef Special / Popular Dish
            </label>
          </div>
        </form>
      </Drawer>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Confirm Dish Deletion"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deletingId) deleteMenuItem(deletingId);
                setDeletingId(null);
              }}
            >
              Delete Dish
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to permanently remove this dish from the ocean chef menu catalog?
        </p>
      </Modal>
    </div>
  );
};
