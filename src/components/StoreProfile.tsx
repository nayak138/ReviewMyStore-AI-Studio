import React, { useState } from 'react';
import { Store } from '../types';
import {
  Store as StoreIcon,
  MapPin,
  Phone,
  Globe,
  Clock,
  Instagram,
  Facebook,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Save,
  Plus,
  RefreshCw,
  Sparkles,
  Link2
} from 'lucide-react';

interface StoreProfileProps {
  store: Store;
  allStores: Store[];
  onUpdateStore: (updatedStore: Store) => void;
  onSelectStore: (storeId: string) => void;
  onAddNewLocation: () => void;
}

export const StoreProfile: React.FC<StoreProfileProps> = ({
  store,
  allStores,
  onUpdateStore,
  onSelectStore,
  onAddNewLocation,
}) => {
  const [formData, setFormData] = useState<Store>(store);
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncingBundleSocial, setIsSyncingBundleSocial] = useState(false);
  const [bundleConnected, setBundleConnected] = useState(true);

  React.useEffect(() => {
    setFormData(store);
  }, [store]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStore(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleSyncBundleSocial = () => {
    setIsSyncingBundleSocial(true);
    setTimeout(() => {
      setIsSyncingBundleSocial(false);
      setBundleConnected(true);
    }, 1200);
  };

  return (
    <div className="space-y-6" id="store-profile-section">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <StoreIcon className="w-3.5 h-3.5 text-blue-600" />
              Store & Location Management
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Store Profile & Google Places Sync
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Manage your store data, social handles, opening hours, and connected Google listings.
          </p>
        </div>

        {/* Location Switcher & Add Location Button */}
        <div className="flex items-center gap-3">
          <select
            value={store.id}
            onChange={(e) => onSelectStore(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {allStores.map((s) => (
              <option key={s.id} value={s.id}>
                📍 {s.name} ({s.locality})
              </option>
            ))}
          </select>

          <button
            onClick={onAddNewLocation}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-xs active:scale-95 transition-all"
            id="add-new-location-btn"
          >
            <Plus className="w-4 h-4" />
            Add Branch
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: General Store Details */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]"></span>
            Storefront Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Business / Store Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Locality / City Label
              </label>
              <input
                type="text"
                value={formData.locality}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                placeholder="e.g. Edappally, Kochi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Full Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Business Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Cafe & Specialty Bistro"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Industry Preset
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="cafe">Cafe & Restaurant</option>
                <option value="salon">Salon, Spa & Beauty</option>
                <option value="dental">Dental & Healthcare</option>
                <option value="automotive">Auto Repair & Detailing</option>
                <option value="gym">Fitness & Gym</option>
                <option value="retail">Boutique & Retail</option>
                <option value="services">Professional Services</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Phone Number (with country code)
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98470 12345"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Website URL
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourstore.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Opening Hours
              </label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                placeholder="e.g. Mon - Sun: 8:00 AM – 11:00 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Primary Photo Image URL
              </label>
              <input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Social Links Sub-section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Customer Social Links & Channels
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Instagram Link
                </label>
                <input
                  type="text"
                  value={formData.socialLinks?.instagram || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                    })
                  }
                  placeholder="https://instagram.com/yourhandle"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  WhatsApp Number (with country code)
                </label>
                <input
                  type="text"
                  value={formData.socialLinks?.whatsapp || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, whatsapp: e.target.value },
                    })
                  }
                  placeholder="+919847012345"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
              id="save-store-profile-btn"
            >
              <Save className="w-4 h-4" />
              {isSaved ? 'Changes Saved!' : 'Save Store Details'}
            </button>
          </div>
        </div>

        {/* Right Side: Google Place ID & Bundle Social Integration */}
        <div className="lg:col-span-4 space-y-6">
          {/* Bundle Social & Google Business Sync Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Integration Status
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" /> GMB Live
              </span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  Bundle Social API Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Connected with Google Business Profile to publish owner replies and fetch incoming reviews automatically.
              </p>
              <button
                type="button"
                onClick={handleSyncBundleSocial}
                disabled={isSyncingBundleSocial}
                className="w-full mt-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingBundleSocial ? 'animate-spin' : ''}`} />
                {isSyncingBundleSocial ? 'Syncing Places & Reviews...' : 'Sync Listing Now'}
              </button>
            </div>

            {/* Direct Google Place ID Info */}
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Google Place ID
              </label>
              <input
                type="text"
                value={formData.googlePlaceId}
                onChange={(e) => setFormData({ ...formData, googlePlaceId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-slate-400">
                Used to generate direct customer review links.
              </p>
            </div>

            {/* Private Negative Feedback Shield Option */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Private Negative Feedback Shield
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Intersects 1–3 star ratings with a private owner message form.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.privateFeedbackShield}
                  onChange={(e) =>
                    setFormData({ ...formData, privateFeedbackShield: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Store Preview Thumbnail Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Listing Preview
            </h4>
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <img
                src={formData.photoUrl}
                alt="Store cover"
                className="w-full h-32 object-cover"
              />
              <div className="p-3 bg-slate-50 dark:bg-slate-800 space-y-1">
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {formData.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {formData.locality}
                </div>
                <div className="text-[11px] font-bold text-amber-500">
                  ★ {formData.rating} ({formData.userRatingsTotal}+ reviews)
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
