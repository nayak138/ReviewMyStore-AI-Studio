import React, { useState } from 'react';
import { BrandLogo, StoreAwningIcon } from './BrandLogo';
import { Store } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Inbox,
  QrCode,
  Sparkles,
  Store as StoreIcon,
  BarChart3,
  ExternalLink,
  ChevronDown,
  Plus,
  ShieldCheck,
  Globe,
  Home,
  Database,
  User,
  LogOut,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'inbox' | 'qr-stand' | 'keywords' | 'analytics' | 'settings';
  onChangeTab: (tab: 'inbox' | 'qr-stand' | 'keywords' | 'analytics' | 'settings') => void;
  currentStore: Store;
  allStores: Store[];
  onSelectStore: (storeId: string) => void;
  onAddNewLocation: () => void;
  onOpenCustomerView: () => void;
  onGoToLanding: () => void;
  onOpenAuthModal: () => void;
  pendingReviewsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  currentStore,
  allStores,
  onSelectStore,
  onAddNewLocation,
  onOpenCustomerView,
  onGoToLanding,
  onOpenAuthModal,
  pendingReviewsCount,
}) => {
  const { user, profile, signOut, isConfigured } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Home Link */}
        <div className="flex items-center gap-6">
          <button onClick={onGoToLanding} className="text-left focus:outline-none cursor-pointer" title="Back to Home">
            <BrandLogo size="sm" showTagline={false} />
          </button>

          {/* Location Dropdown Switcher */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <select
              value={currentStore.id}
              onChange={(e) => {
                if (e.target.value === 'NEW') {
                  onAddNewLocation();
                } else {
                  onSelectStore(e.target.value);
                }
              }}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {allStores.map((s) => (
                <option key={s.id} value={s.id} className="dark:bg-slate-900">
                  📍 {s.name} ({s.locality})
                </option>
              ))}
              <option value="NEW" className="dark:bg-slate-900 text-blue-600 font-bold">
                + Add New Store Location
              </option>
            </select>
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          {[
            {
              id: 'inbox',
              label: 'Review Inbox',
              icon: Inbox,
              badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
            },
            { id: 'qr-stand', label: '6"×4" QR Stand', icon: QrCode },
            { id: 'keywords', label: 'Keywords & Prompts', icon: Sparkles },
            { id: 'analytics', label: 'Social & Insights', icon: BarChart3 },
            { id: 'settings', label: 'Store Settings', icon: StoreIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-extrabold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Live Customer Portal, Supabase Status & Auth Profile */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenCustomerView}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-all shadow-xs active:scale-95 cursor-pointer"
            id="nav-customer-portal-btn"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Customer Portal</span>
          </button>

          {/* User Account / Sign In Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <img
                  src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt="Avatar"
                  className="w-6 h-6 rounded-lg object-cover"
                />
                <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
                  {profile?.fullName || user.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {profile?.fullName || 'Store Owner'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-extrabold text-[10px] uppercase tracking-wider">
                        {profile?.plan || 'Growth'} Plan
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      signOut();
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Merchant Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Bar on smaller screens */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 py-2 px-2 bg-white dark:bg-slate-900 overflow-x-auto text-xs">
        {[
          { id: 'inbox', label: 'Inbox', icon: Inbox },
          { id: 'qr-stand', label: '6"×4" Stand', icon: QrCode },
          { id: 'keywords', label: 'Keywords', icon: Sparkles },
          { id: 'analytics', label: 'Socials', icon: BarChart3 },
          { id: 'settings', label: 'Store', icon: StoreIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                isActive ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/50' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

