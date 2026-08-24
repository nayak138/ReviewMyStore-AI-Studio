import React, { useState } from 'react';
import { Store, KeywordItem } from '../types';
import { downloadVCard } from '../utils/vcfGenerator';
import confetti from 'canvas-confetti';
import {
  Star,
  Sparkles,
  Phone,
  MapPin,
  Globe,
  Share2,
  Bookmark,
  Copy,
  Check,
  ExternalLink,
  Plus,
  X,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Instagram,
  MessageCircle,
  Clock,
  Heart,
  Navigation,
  Languages,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { StoreAwningIcon } from './BrandLogo';

interface CustomerReviewPortalProps {
  store: Store;
  keywords: KeywordItem[];
  onBackToDashboard?: () => void;
  isStandalone?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪' },
];

export const CustomerReviewPortal: React.FC<CustomerReviewPortalProps> = ({
  store,
  keywords,
  onBackToDashboard,
  isStandalone = false
}) => {
  const [starRating, setStarRating] = useState<number>(5);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('Enthusiastic');
  const [customerName, setCustomerName] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [generatedReview, setGeneratedReview] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [shareFeedback, setShareFeedback] = useState<boolean>(false);
  const [showPrivateShieldModal, setShowPrivateShieldModal] = useState<boolean>(false);
  const [privateFeedbackSent, setPrivateFeedbackSent] = useState<boolean>(false);
  const [privateMessage, setPrivateMessage] = useState<string>('');
  const [privateContact, setPrivateContact] = useState<string>('');
  const [isSendingFeedback, setIsSendingFeedback] = useState<boolean>(false);

  // Tones available
  const tones = [
    { id: 'Enthusiastic', label: '🔥 Enthusiastic', desc: 'Glowing 5-star rave' },
    { id: 'Short & Direct', label: '⏱️ Short & Direct', desc: '1-2 punchy sentences' },
    { id: 'Professional', label: '🍽️ Detailed & Insightful', desc: 'Mentions food, service & vibe' },
    { id: 'Grateful', label: '🙏 Warm & Grateful', desc: 'Heartfelt thank you to staff' }
  ];

  // Toggle keyword chip selection
  const toggleKeyword = (id: string) => {
    setSelectedKeywordIds(prev =>
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    );
  };

  // Add custom tag
  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim();
    if (tag && !customTags.includes(tag)) {
      setCustomTags(prev => [...prev, tag]);
      setNewTagInput('');
    }
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags(prev => prev.filter(t => t !== tag));
  };

  // Generate Review with Gemini API
  const handleGenerateReview = async () => {
    setIsGenerating(true);

    const activeKeywords = keywords
      .filter(k => selectedKeywordIds.includes(k.id))
      .map(k => k.text);

    try {
      const response = await fetch('/api/ai/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: store.name,
          category: store.category,
          rating: starRating,
          selectedKeywords: activeKeywords,
          customKeywords: customTags,
          tone: selectedTone,
          language: selectedLanguage,
          additionalDetails: [
            customerName ? `Customer Name: ${customerName}` : '',
            additionalNotes ? `Visit Notes: ${additionalNotes}` : ''
          ].filter(Boolean).join('. '),
        })
      });

      const data = await response.json();
      if (data.review) {
        setGeneratedReview(data.review);
      }
    } catch (err) {
      console.error('Failed to generate AI review', err);
      // High quality fallback
      setGeneratedReview(
        `Visited ${store.name} in ${store.locality} today and had an exceptional experience! Everything was top notch${
          activeKeywords.length > 0 ? `, especially the ${activeKeywords.slice(0, 3).join(', ')}` : ''
        }. The staff made our visit memorable. Highly recommended!`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy and Direct to Google Review
  const handleCopyAndRedirect = () => {
    if (!generatedReview) return;

    try {
      navigator.clipboard.writeText(generatedReview);
    } catch (e) {
      console.warn('Clipboard write error', e);
    }
    setIsCopied(true);

    // Confetti celebration
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853']
      });
    } catch {
      // ignore
    }

    // Direct to real Google review write modal
    setTimeout(() => {
      const targetUrl =
        store.googleReviewUrl ||
        `https://search.google.com/local/writereview?placeid=${store.googlePlaceId}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }, 900);
  };

  // Share store link
  const handleShareStore = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: store.name,
          text: `Check out ${store.name} in ${store.locality}!`,
          url: url,
        });
        return;
      } catch {
        // Fallback
      }
    }
    navigator.clipboard.writeText(url);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2000);
  };

  // Submit private feedback shield
  const handleSendPrivateFeedback = async () => {
    if (!privateMessage.trim()) return;
    setIsSendingFeedback(true);
    try {
      const response = await fetch('/api/feedback/private', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          storeName: store.name,
          rating: starRating,
          message: privateMessage,
          customerContact: privateContact,
        })
      });
      if (!response.ok) throw new Error('Feedback could not be saved.');
      setPrivateFeedbackSent(true);
      setTimeout(() => setShowPrivateShieldModal(false), 2500);
    } catch (e) {
      console.error('Private feedback submission failed', e);
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const experienceKeywords = keywords.filter(k => k.category === 'experience');
  const productKeywords = keywords.filter(k => k.category === 'product' || k.category === 'general');
  const staffKeywords = keywords.filter(k => k.category === 'staff');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-6 px-3 sm:px-6 flex flex-col items-center select-none" id="customer-review-portal">
      {/* Optional Top Bar for previewer */}
      {onBackToDashboard && (
        <div className="w-full max-w-md mb-4 flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Live Customer Portal View</span>
          </div>
          <button
            onClick={onBackToDashboard}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </div>
      )}

      {/* Main Mobile-First Review Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Cover Photo & Store Header */}
        <div className="relative h-48 w-full bg-slate-800">
          <img
            src={store.photoUrl}
            alt={store.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>

          {/* Top Bar with Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Google Verified</span>
            </div>

            {/* Language Selector Pill */}
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-black/60 backdrop-blur-md text-white border border-white/20 text-[11px] font-bold rounded-full px-2.5 py-1 appearance-none pr-6 cursor-pointer focus:outline-none"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.name} className="bg-slate-900 text-white">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <Languages className="w-3 h-3 text-white/80 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>

          {/* Store Title in Header */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h1 className="text-xl font-black tracking-tight leading-snug drop-shadow-md">
              {store.name}
            </h1>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-xs text-white/90 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                <span className="truncate max-w-[200px]">{store.locality || store.address}</span>
              </p>
              <span className="inline-flex items-center gap-1 font-bold text-amber-300 text-xs bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                ★ {store.rating} ({store.userRatingsTotal}+)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Bar (Call, Save Contact, Maps, Share) */}
        <div className="bg-slate-50 dark:bg-slate-800/70 p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            {/* Direct Call Button */}
            <a
              href={`tel:${store.phone}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 shadow-xs active:scale-95 transition-all"
              id="customer-call-store-btn"
            >
              <Phone className="w-3 h-3" />
              Call
            </a>

            {/* Save Contact (.vcf) Button */}
            <button
              onClick={() => downloadVCard(store)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-[11px] font-bold hover:bg-slate-100 dark:hover:bg-slate-600 shadow-2xs active:scale-95 transition-all cursor-pointer"
              id="customer-save-vcf-btn"
              title="Save store vCard into phone contacts"
            >
              <Bookmark className="w-3 h-3 text-blue-600" />
              Save Contact
            </button>

            {/* Directions on Google Maps */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                `${store.name} ${store.address}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-[11px] font-bold hover:bg-slate-100 shadow-2xs active:scale-95 transition-all"
            >
              <Navigation className="w-3 h-3 text-emerald-600" />
              Directions
            </a>
          </div>

          {/* Social / Share Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleShareStore}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer text-xs"
              title="Share store portal"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            {store.socialLinks?.instagram && (
              <a
                href={store.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-pink-600 hover:scale-105 transition-all"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            )}
            {store.socialLinks?.whatsapp && (
              <a
                href={`https://wa.me/${store.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-emerald-600 hover:scale-105 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {shareFeedback && (
          <div className="bg-emerald-500 text-white text-[11px] font-bold py-1 px-3 text-center">
            ✓ Store portal link copied to clipboard!
          </div>
        )}

        {/* Main Review Form Body */}
        <div className="p-5 space-y-6">
          {/* Step 1: Star Rating */}
          <div className="text-center space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Step 1: How was your experience?
            </label>

            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    setStarRating(star);
                    if (star <= 3 && store.privateFeedbackShield) {
                      setShowPrivateShieldModal(true);
                    }
                  }}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= starRating
                        ? 'text-[#FBBC05] fill-[#FBBC05] drop-shadow-sm'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {starRating === 5 && '🌟 Exceptional! 5 Out of 5 Stars'}
              {starRating === 4 && '✨ Great Experience! 4 Stars'}
              {starRating === 3 && '😐 Average Experience (3 Stars)'}
              {starRating <= 2 && '🙁 Below Expectations'}
            </p>
          </div>

          {/* Step 2: Interactive Keyword Chips */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step 2: Tap highlights of your visit
              </label>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                {selectedKeywordIds.length + customTags.length} selected
              </span>
            </div>

            {/* Products & Food / Service Highlights */}
            {productKeywords.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  ☕ Offerings & Specialties:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {productKeywords.map((k) => {
                    const isSelected = selectedKeywordIds.includes(k.id);
                    return (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => toggleKeyword(k.id)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'bg-[#4285F4] text-white shadow-xs ring-2 ring-blue-300 dark:ring-blue-800 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {k.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Atmosphere & Experience Highlights */}
            {experienceKeywords.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  ✨ Vibe, Cleanliness & Ambiance:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {experienceKeywords.map((k) => {
                    const isSelected = selectedKeywordIds.includes(k.id);
                    return (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => toggleKeyword(k.id)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'bg-[#34A853] text-white shadow-xs ring-2 ring-emerald-300 dark:ring-emerald-800 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {k.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Staff Mentions */}
            {staffKeywords.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  👥 Friendly Staff & Service:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {staffKeywords.map((k) => {
                    const isSelected = selectedKeywordIds.includes(k.id);
                    return (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => toggleKeyword(k.id)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'bg-[#EA4335] text-white shadow-xs ring-2 ring-red-300 dark:ring-red-800 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {k.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Customer Tags */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                ✍️ Mention a specific team member, dish, or item:
              </span>
              <form onSubmit={handleAddCustomTag} className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="e.g. Barista Alex, Tacos, Fast Wifi..."
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newTagInput.trim()}
                  className="px-3 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold disabled:opacity-40 hover:bg-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </form>

              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {customTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-300 dark:border-blue-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeCustomTag(tag)}
                        className="hover:text-red-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tone Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Review Style / Tone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {tones.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTone(t.id)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    selectedTone === t.id
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold ring-1 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-bold">{t.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Name & Notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Optional Details (Makes review even more personal)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your Name (Optional)"
                className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Occasion (e.g. Birthday, Date night...)"
                className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Generate AI Review Button */}
          <button
            onClick={handleGenerateReview}
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#4285F4] via-[#3367D6] to-[#2563EB] text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            id="generate-customer-ai-review-btn"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting AI Review in {selectedLanguage}...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Instant Google Review</span>
              </>
            )}
          </button>

          {/* Generated Review Display Area */}
          {generatedReview && (
            <div className="space-y-3 p-4 rounded-2xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200 dark:border-blue-900/50 shadow-inner animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Your AI Review Preview (Feel free to edit)
                </span>
                <button
                  type="button"
                  onClick={handleGenerateReview}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              </div>

              <textarea
                value={generatedReview}
                onChange={(e) => setGeneratedReview(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed resize-none shadow-2xs"
              />

              {/* Primary Copy & Post on Google Button */}
              <button
                onClick={handleCopyAndRedirect}
                className="w-full py-3.5 px-4 rounded-xl bg-[#34A853] hover:bg-[#2E954B] text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="copy-and-post-google-btn"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Review Copied! Opening Google Maps...' : 'Copy Review & Open Google Maps'}
              </button>

              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> How it works:
                </p>
                <p>1. Tapping above copies your review text automatically.</p>
                <p>2. Google Maps review dialog opens in a new tab.</p>
                <p>3. Just paste your review and select 5 stars!</p>
              </div>
            </div>
          )}

          {/* Bottom Branding Bar */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
            <StoreAwningIcon size={20} />
            <span className="text-[11px] font-bold text-slate-400">
              Powered by <span className="text-blue-600">ReviewMyStore.AI</span>
            </span>
          </div>
        </div>
      </div>

      {/* Private Negative Feedback Shield Modal (For 1-3 Stars) */}
      {showPrivateShieldModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                We Strive for 5-Star Service
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                We're truly sorry your experience wasn't flawless. Would you like to message the store management directly so we can make this right immediately?
              </p>
            </div>

            {!privateFeedbackSent ? (
              <div className="space-y-3">
                <textarea
                  value={privateMessage}
                  onChange={(e) => setPrivateMessage(e.target.value)}
                  placeholder="Tell us what went wrong..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  value={privateContact}
                  onChange={(e) => setPrivateContact(e.target.value)}
                  placeholder="Your phone number or email (optional)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={handleSendPrivateFeedback}
                  disabled={!privateMessage.trim() || isSendingFeedback}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSendingFeedback ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Send Private Message to Management'
                  )}
                </button>

                <button
                  onClick={() => setShowPrivateShieldModal(false)}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  Skip & Continue to Google Review
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-center text-xs space-y-1">
                <p className="font-bold">Thank you for your feedback!</p>
                <p>The store management has received your message and will reach out shortly.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
