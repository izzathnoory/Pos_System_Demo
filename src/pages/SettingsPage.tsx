import React, { useState } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Save, Building, Percent, FileText } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSystemSettings } = useSystemStore();

  const [hotelName, setHotelName] = useState<string>(settings.hotelName);
  const [tagline, setTagline] = useState<string>(settings.tagline);
  const [address, setAddress] = useState<string>(settings.address);
  const [phone, setPhone] = useState<string>(settings.phone);
  const [email, setEmail] = useState<string>(settings.email);
  const [currency, setCurrency] = useState<string>(settings.currency);
  const [taxRate, setTaxRate] = useState<number>(settings.taxRate);
  const [serviceChargeRate, setServiceChargeRate] = useState<number>(settings.serviceChargeRate);
  const [receiptFooter, setReceiptFooter] = useState<string>(settings.receiptFooter);
  const [enableAutoPrintKitchen, setEnableAutoPrintKitchen] = useState<boolean>(settings.enableAutoPrintKitchen);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      hotelName,
      tagline,
      address,
      phone,
      email,
      currency,
      taxRate: Number(taxRate) || 0,
      serviceChargeRate: Number(serviceChargeRate) || 0,
      receiptFooter,
      enableAutoPrintKitchen,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Hotel System Preferences</h2>
          <p className="text-xs text-slate-500">Configure global tax rules, branding, currency & hardware preferences</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hotel Profile Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building className="w-5 h-5 text-[#0B4EAE]" />
            <span>Hotel Profile & Contact Info</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hotel Name"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              required
            />
            <Input
              label="Tagline / Motto"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Official Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Input
            label="Property Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Financial Rates Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <Percent className="w-5 h-5 text-[#0B4EAE]" />
            <span>Financial Rates & Currency</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="System Currency Symbol"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
            <Input
              label="Default Govt Tax Rate (%)"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Dine-In Service Charge (%)"
              type="number"
              value={serviceChargeRate}
              onChange={(e) => setServiceChargeRate(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Receipt & Printing Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0B4EAE]" />
            <span>Receipt & Printing Options</span>
          </h3>

          <Input
            label="Tax Receipt Footer Disclaimer"
            value={receiptFooter}
            onChange={(e) => setReceiptFooter(e.target.value)}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="autoPrint"
              checked={enableAutoPrintKitchen}
              onChange={(e) => setEnableAutoPrintKitchen(e.target.checked)}
              className="w-4 h-4 text-[#0B4EAE] rounded border-slate-300"
            />
            <label htmlFor="autoPrint" className="text-xs font-semibold text-slate-700">
              Automatically trigger kitchen print preview when sending orders
            </label>
          </div>
        </div>

        <Button variant="primary" size="lg" icon={<Save className="w-4 h-4" />} type="submit">
          Save All System Settings
        </Button>
      </form>
    </div>
  );
};
