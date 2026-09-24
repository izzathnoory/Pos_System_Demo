import React, { useState } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ExternalLink, Save } from 'lucide-react';

export const CustomerDisplayManagementPage: React.FC = () => {
  const { displaySettings, updateDisplaySettings } = useSystemStore();

  const [bannerTitle, setBannerTitle] = useState<string>(displaySettings.bannerTitle);
  const [bannerSubtitle, setBannerSubtitle] = useState<string>(displaySettings.bannerSubtitle);
  const [thankYouMessage, setThankYouMessage] = useState<string>(displaySettings.thankYouMessage);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDisplaySettings({
      bannerTitle,
      bannerSubtitle,
      thankYouMessage,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Customer 2-Way Display Configuration</h2>
          <p className="text-xs text-slate-500">Configure promotional slides, headers and messaging for customer pole displays</p>
        </div>

        <a
          href="/customer-display"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-[#0B4EAE] hover:bg-[#093D89] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Launch 2-Way Display Screen</span>
        </a>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
          Display Header & Message Banner
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Banner Header Title"
            value={bannerTitle}
            onChange={(e) => setBannerTitle(e.target.value)}
            placeholder="e.g. Welcome to POS System By Nexzoa"
          />

          <Input
            label="Banner Subtitle / Tagline"
            value={bannerSubtitle}
            onChange={(e) => setBannerSubtitle(e.target.value)}
            placeholder="e.g. Experience Smart Dining & Quick Service POS"
          />

          <Input
            label="Thank You Footer Message"
            value={thankYouMessage}
            onChange={(e) => setThankYouMessage(e.target.value)}
            placeholder="e.g. Thank you for dining with us! Please come again."
          />

          <Button variant="primary" icon={<Save className="w-4 h-4" />} type="submit">
            Save Display Settings
          </Button>
        </form>
      </div>

      {/* Slide Preview Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
          Promotional Slides ({displaySettings.slides.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {displaySettings.slides.map((slide) => (
            <div key={slide.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <img src={slide.image} alt={slide.title} className="h-32 w-full object-cover" />
              <div className="p-3">
                <span className="text-[10px] font-bold text-[#0B4EAE] uppercase block">{slide.tag}</span>
                <p className="text-xs font-bold text-slate-800 truncate">{slide.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
