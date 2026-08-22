import React, { useState } from 'react';
import { Store } from '../types';
import { Search, MapPin, X, Plus, Sparkles } from 'lucide-react';

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStore: (newStore: Store) => void;
}

export const AddLocationModal: React.FC<AddLocationModalProps> = ({
  isOpen,
  onClose,
  onAddStore,
}) => {
  const [name, setName] = useState('');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Cafe & Bistro');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = 'store-' + Date.now();
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + locality.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const newStore: Store = {
      id: newId,
      name: name.trim(),
      slug: slug,
      tagline: 'Artisanal Flavors & Community Vibe',
      address: address.trim() || `${locality}, City Center`,
      locality: locality.trim() || 'Downtown',
      category: category,
      industry: 'cafe',
      phone: phone.trim() || '+1 (555) 019-2831',
      website: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      openingHours: 'Mon - Sun: 8:00 AM – 10:00 PM',
      photoUrl: photoUrl,
      rating: 4.9,
      userRatingsTotal: 12,
      googlePlaceId: 'ChIJ' + Math.random().toString(36).substring(2, 12),
      googleReviewUrl: `https://search.google.com/local/writereview?placeid=ChIJ${Math.random().toString(36).substring(2, 12)}`,
      socialLinks: {
        instagram: `https://instagram.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        whatsapp: phone.replace(/[^0-9]/g, '') || '15550192831',
      },
      nfcEnabled: true,
      privateFeedbackShield: true,
      autoPilot: {
        enabled: true,
        minRating: 4,
        tone: 'Warm & Grateful',
        ownerName: 'Store Management Team',
      },
    };

    onAddStore(newStore);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add New Store Branch
              </h3>
              <p className="text-xs text-slate-500">Add another location to your ReviewMyStore.AI dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Store / Branch Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cafe UrbanBite - Kakkanad"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Locality / Area
              </label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Infopark, Kakkanad"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98470 99999"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Main Avenue, Near Cyber Tower"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
            >
              Create Branch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
