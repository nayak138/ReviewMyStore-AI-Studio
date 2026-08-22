import React, { useState, useEffect, useRef } from 'react';
import { BrandLogo, StoreAwningIcon } from './BrandLogo';
import { Store } from '../types';
import {
  Search,
  MapPin,
  Star,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Bot,
  CheckCircle2,
  Phone,
  Wifi,
  Bookmark,
  Coffee,
  HeartPulse,
  Car,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Layers,
  X,
  Loader2
} from 'lucide-react';

interface LandingPageProps {
  onClaimStore: (placeData: any) => void;
  onEnterDashboardDirectly: () => void;
  onOpenAuth?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onClaimStore,
  onEnterDashboardDirectly,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const justSelectedRef = useRef(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Autocomplete via Places API endpoint (Name & Place search)
  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch('/api/places/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });
        const data = await res.json();
        
        // Only open if the user didn't just select a business
        if (!justSelectedRef.current) {
          const places = data.places || [];
          setSearchResults(places);
          setIsOpen(places.length > 0);
          setActiveIndex(-1);
        }
      } catch (err) {
        console.error('Failed to search places', err);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectBusiness = (place: any) => {
    justSelectedRef.current = true;
    setSelectedPlace(place);
    setSearchQuery(place.name);
    setSearchResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedPlace(null);
    setSearchResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || searchResults.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleProceedToSetup();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && searchResults[activeIndex]) {
        handleSelectBusiness(searchResults[activeIndex]);
      } else if (searchResults.length > 0) {
        handleSelectBusiness(searchResults[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleProceedToSetup = () => {
    if (selectedPlace) {
      onClaimStore(selectedPlace);
    } else if (searchResults.length > 0 && isOpen) {
      handleSelectBusiness(searchResults[0]);
    } else {
      onEnterDashboardDirectly();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white" id="landing-page">
      {/* Top Google-style Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <BrandLogo size="md" showTagline={false} />

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#qr-stands" className="hover:text-blue-600 transition-colors">
              6"×4" QR Stands
            </a>
            <a href="#ai-replies" className="hover:text-blue-600 transition-colors">
              AI Auto-Replies
            </a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">
              Multi-Location Plans
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAuth || onEnterDashboardDirectly}
              className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onOpenAuth || onEnterDashboardDirectly}
              className="px-5 py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              id="header-cta-btn"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Google Business Search */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6">
        {/* Subtle Google 4-Color Ambient Glows (isolated in overflow-hidden container so dropdown is never clipped) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-red-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI Google Review Engine & Smart Response Suite for Small Businesses</span>
          </div>

          {/* Headline with Google colors accent - clean without ugly strike underline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Turn Every Customer Visit into a{' '}
            <span className="inline-block">
              <span className="text-[#4285F4]">5-Star</span>{' '}
              <span className="text-[#EA4335]">Google</span>{' '}
              <span className="text-[#FBBC05]">Review</span>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Customers tap industry keywords, and our cost-effective Gemini AI writes authentic, detailed Google reviews in 5 seconds. Plus, auto-pilot replies acknowledge exact dishes and staff mentioned.
          </p>

          {/* Hero Google Places Search Bar */}
          <div ref={containerRef} className="pt-4 max-w-2xl mx-auto text-left relative z-30" id="hero-places-search-container">
            <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-2 transition-all p-2 flex items-center gap-2 ${
              isOpen
                ? 'border-blue-600 ring-4 ring-blue-100 dark:ring-blue-950'
                : selectedPlace
                ? 'border-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-950/50'
                : 'border-blue-500/80 focus-within:ring-4 focus-within:ring-blue-100 dark:focus-within:ring-blue-950'
            }`}>
              <div className="p-2 text-slate-400 pl-3">
                {isSearching ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedPlace) setSelectedPlace(null);
                }}
                onFocus={() => {
                  if (searchResults.length > 0 && !selectedPlace) {
                    setIsOpen(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search by business name & place (e.g. Cafe UrbanBite, Luxe Salon LA)..."
                className="flex-1 text-sm sm:text-base font-medium text-slate-900 dark:text-white bg-transparent focus:outline-none placeholder:text-slate-400"
                id="landing-hero-places-search-input"
                autoComplete="off"
              />

              {/* Clear Button */}
              {(searchQuery.length > 0 || selectedPlace) && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Clear search"
                  id="clear-search-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleProceedToSetup}
                className={`px-5 py-3 rounded-xl text-white text-sm font-bold shadow-md active:scale-95 transition-all flex items-center gap-2 shrink-0 ${
                  selectedPlace
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-[#4285F4] hover:bg-[#3367D6]'
                }`}
                id="claim-business-btn"
              >
                <span>{selectedPlace ? 'Claim Business' : 'Search & Setup'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Autocomplete Dropdown List - Vanishes instantly upon selection or click outside */}
            {isOpen && searchResults.length > 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150"
                id="places-autocomplete-dropdown"
              >
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Google Places Suggestions
                  </span>
                  <span className="text-blue-600 font-semibold lowercase text-[10px]">
                    Click or press Enter to auto-populate
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {searchResults.map((place, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <div
                        key={place.placeId || idx}
                        onClick={() => handleSelectBusiness(place)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`p-3.5 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                          isActive
                            ? 'bg-blue-50/90 dark:bg-blue-950/60'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                        id={`place-suggestion-item-${idx}`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={place.photoUrl}
                            alt={place.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                            onError={(e) => {
                              // Fallback image if unsplash url has issues
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                              <span className="truncate">{place.name}</span>
                              {place.rating && (
                                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-1.5 py-0.5 rounded-md">
                                  ★ {place.rating}
                                  {place.userRatingsTotal ? (
                                    <span className="text-[10px] text-slate-400 font-normal ml-0.5">({place.userRatingsTotal})</span>
                                  ) : null}
                                </span>
                              )}
                              {place.category && (
                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                  {place.category}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                              <span className="truncate">{place.address || place.locality}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectBusiness(place);
                          }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-600 hover:text-white'
                          }`}
                        >
                          Select
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Business Preview Card (Shown once selected and dropdown is vanished) */}
            {selectedPlace && !isOpen && (
              <div 
                className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1 duration-150"
                id="selected-business-card"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={selectedPlace.photoUrl}
                    alt={selectedPlace.name}
                    className="w-13 h-13 rounded-xl object-cover border border-emerald-300 dark:border-emerald-700 shrink-0 shadow-sm"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Place Verified
                      </span>
                      {selectedPlace.category && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {selectedPlace.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1 truncate">
                      {selectedPlace.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {selectedPlace.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                  >
                    Change
                  </button>
                  <button
                    onClick={handleProceedToSetup}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
                    id="proceed-to-dashboard-btn"
                  >
                    <span>Claim & Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Feature Highlights */}
      <section className="py-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800" id="how-it-works">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              End-to-End Review Flywheel
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Built for Real-World Local Stores & Shops
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              From physical table stands to automated Google My Business replies.
            </p>
          </div>

          {/* 3 Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                1. 6"×4" QR & NFC Sticker Stand
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Download print-ready 300 DPI acrylic stands styled with Google branding. Customers tap via NFC or scan the QR code to open your review portal.
              </p>
              <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                ✓ Includes .vcf Contact Saver & Phone Call Actions
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                2. 1-Tap Keyword Review Generator
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Customers choose from your custom industry chips (e.g. "Spanish Latte", "Painless Care") and Gemini AI writes a natural 5-star review they can copy & submit.
              </p>
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                ✓ Pre-filled templates for 7+ industries
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                3. Mention-Aware AI Auto-Replies
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Our inbox engine reads every review and explicitly acknowledges the exact dishes, waitstaff, and services mentioned. Run on Auto-Pilot or manual review.
              </p>
              <div className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                ✓ Bundle Social & GMB API connection
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Location Pricing Breakdown */}
      <section className="py-16 px-4 sm:px-6" id="pricing">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Simple, Scalable Pricing
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Multi-Location Plans for Growing Brands
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase">Single Store</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white">$19<span className="text-xs text-slate-400 font-normal">/mo</span></div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5">
                <li>✓ 1 Google Maps Location</li>
                <li>✓ Unlimited AI Review Generations</li>
                <li>✓ 6"×4" High-Res QR Stand Generator</li>
                <li>✓ Manual AI Reply Inbox</li>
                <li>✓ .vcf Contact Card Downloads</li>
              </ul>
              <button
                onClick={onOpenAuth || onEnterDashboardDirectly}
                className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Choose Starter
              </button>
            </div>

            {/* Growth Pro */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-600 shadow-xl space-y-4 relative">
              <span className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Most Popular
              </span>
              <span className="text-xs font-bold text-blue-600 uppercase">Multi-Branch (Up to 5)</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white">$49<span className="text-xs text-slate-400 font-normal">/mo</span></div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5">
                <li>✓ <strong>Up to 5 Store Locations</strong></li>
                <li>✓ <strong>Auto-Pilot Instant AI Replies</strong></li>
                <li>✓ Mention-Specific Review Intelligence</li>
                <li>✓ Private Negative Feedback Shield</li>
                <li>✓ WhatsApp Review Dispatcher</li>
                <li>✓ Review-to-Social Graphic Generator</li>
              </ul>
              <button
                onClick={onOpenAuth || onEnterDashboardDirectly}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md cursor-pointer"
              >
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Chain */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase">Franchise & Agency</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white">$99<span className="text-xs text-slate-400 font-normal">/mo</span></div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5">
                <li>✓ Unlimited Locations</li>
                <li>✓ Bundle Social API Webhook Sync</li>
                <li>✓ Staff Performance Leaderboards</li>
                <li>✓ Dedicated Account Manager</li>
              </ul>
              <button
                onClick={onOpenAuth || onEnterDashboardDirectly}
                className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Create Enterprise Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <StoreAwningIcon size={36} />
            <div>
              <div className="text-xl font-black tracking-tight select-none">
                <span className="text-[#4285F4]">Review</span>
                <span className="text-[#EA4335]">My</span>
                <span className="text-[#FBBC05]">Store</span>
                <span className="text-[#34A853]">.AI</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">The AI-Powered Google Review Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span>Places API Powered</span>
            <span>•</span>
            <span>Gemini AI Engine</span>
            <span>•</span>
            <span>NFC & QR Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
