import React, { useState } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import type { Category } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';

export const CategoryManagementPage: React.FC = () => {
  const { categories, menuItems, addCategory, updateCategory, deleteCategory } = useSystemStore();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({ name: cat.name, description: cat.description || '', isActive: cat.isActive });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      addCategory(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-bold text-slate-800 text-base sm:text-lg">Menu Categories ({categories.length})</h2>
          <p className="text-xs text-slate-500">Organize food and beverage offerings into structured menu groups</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto"
        >
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {categories.map((cat) => {
          const itemCount = menuItems.filter((m) => m.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-[#0B4EAE]/10 text-[#0B4EAE] rounded-xl mb-3">
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {itemCount} Dishes
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-base">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{cat.description || 'No description provided.'}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    cat.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {cat.isActive ? 'Active' : 'Disabled'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(cat)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(cat.id)}
                    className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Category
            </Button>
          </div>
        }
      >
        <form className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Seafood Specials"
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Fresh ocean catches cooked to perfection"
          />
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="catActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-[#0B4EAE] rounded border-slate-300"
            />
            <label htmlFor="catActive" className="text-xs font-semibold text-slate-700">
              Active Category (Visible on POS & Customer Menu)
            </label>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Confirm Category Deletion"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deletingId) deleteCategory(deletingId);
                setDeletingId(null);
              }}
            >
              Delete Category
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this menu category?
        </p>
      </Modal>
    </div>
  );
};
