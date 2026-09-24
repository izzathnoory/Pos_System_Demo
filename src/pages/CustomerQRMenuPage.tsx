import React, { useState } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Search, Star, Clock, MessageSquare } from 'lucide-react';

export const CustomerQRMenuPage: React.FC = () => {
  const { menuItems, categories, addFeedback } = useSystemStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);

  // Feedback form
  const [custName, setCustName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState<string>('');

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.categoryId === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.isAvailable;
  });

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    addFeedback(custName, rating, comments);
    setIsFeedbackModalOpen(false);
    setCustName('');
    setComments('');
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Ocean Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0A192F] to-[#0B4EAE] text-white p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 max-w-xl space-y-3">
            <span className="bg-cyan-400/20 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-cyan-400/30">
              Welcome to Ocean Chef
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Fresh Seafood & Authentic Sri Lankan Cuisine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Explore our ocean-to-table gourmet dishes, fresh catches & signature mocktails.
            </p>
          </div>
          <div className="absolute right-[-10%] bottom-[-20%] w-80 h-80 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 sticky top-18 z-20">
          <Input
            placeholder="Search our ocean menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-[#0B4EAE] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Specials
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#0B4EAE] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Dish Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((dish) => (
            <div
              key={dish.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                  {dish.isPopular && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Chef Special
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-slate-800 text-base">{dish.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{dish.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Est. {dish.preparationTimeMinutes} Mins Prep Time</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-lg font-extrabold text-[#0B4EAE]">
                  LKR {dish.price.toLocaleString()}
                </span>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                  Available Now
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Rate Us Button */}
        <div className="fixed bottom-6 right-6 z-30">
          <Button
            variant="primary"
            size="lg"
            className="rounded-full shadow-2xl bg-[#0B4EAE] hover:bg-[#093D89]"
            icon={<MessageSquare className="w-5 h-5" />}
            onClick={() => setIsFeedbackModalOpen(true)}
          >
            Leave Dining Feedback
          </Button>
        </div>

        {/* Feedback Modal */}
        <Modal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          title="Rate Your Ocean Chef Dining Experience"
          footer={
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsFeedbackModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmitFeedback}>
                Submit Review
              </Button>
            </div>
          }
        >
          <form className="space-y-4">
            <Input
              label="Your Name (Optional)"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Star Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${star <= rating ? 'fill-current text-amber-400' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Comments & Feedback</label>
              <textarea
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4EAE]/30"
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Tell us about the food quality, service or atmosphere..."
                required
              />
            </div>
          </form>
        </Modal>
      </div>
    </CustomerLayout>
  );
};
