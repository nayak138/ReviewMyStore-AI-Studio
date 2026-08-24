import React, { useState } from 'react';
import { Store, ReviewItem } from '../types';
import { authenticatedJsonHeaders } from '../lib/api';
import {
  Inbox,
  Sparkles,
  Bot,
  CheckCircle2,
  Clock,
  Send,
  Edit3,
  Star,
  RefreshCw,
  Search,
  Filter,
  ThumbsUp,
  AlertTriangle,
  Settings2,
  ExternalLink,
  Share2,
  Smile,
  Copy,
  Check
} from 'lucide-react';

interface ReviewInboxProps {
  store: Store;
  reviews: ReviewItem[];
  onUpdateReviews: (reviews: ReviewItem[]) => void;
  onUpdateStore: (store: Store) => void;
  onOpenSocialGenerator: (review: ReviewItem) => void;
}

export const ReviewInbox: React.FC<ReviewInboxProps> = ({
  store,
  reviews,
  onUpdateReviews,
  onUpdateStore,
  onOpenSocialGenerator,
}) => {
  const [selectedReviewId, setSelectedReviewId] = useState<string>(reviews[0]?.id || '');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'drafted' | 'published' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [generatingReplyId, setGeneratingReplyId] = useState<string | null>(null);
  const [activeReplyTone, setActiveReplyTone] = useState<Store['autoPilot']['tone']>(store.autoPilot?.tone || 'Warm & Grateful');
  const [draftText, setDraftText] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAutoPilotSettings, setShowAutoPilotSettings] = useState<boolean>(false);

  const selectedReview = reviews.find((r) => r.id === selectedReviewId) || reviews[0];

  // Sync draft text when selecting review
  React.useEffect(() => {
    if (selectedReview) {
      setDraftText(selectedReview.aiReply || '');
    }
  }, [selectedReviewId, selectedReview?.aiReply]);

  // Filter reviews for this exact store
  const filteredReviews = reviews.filter((r) => {
    if (r.storeId !== store.id) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.customerName.toLowerCase().includes(q) ||
        r.reviewText.toLowerCase().includes(q) ||
        r.mentionedEntities.some((e) => e.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (filterTab === 'pending') return r.replyStatus === 'pending';
    if (filterTab === 'drafted') return r.replyStatus === 'drafted';
    if (filterTab === 'published') return r.replyStatus === 'published';
    if (filterTab === 'critical') return r.rating <= 3;
    return true;
  });

  // Generate AI reply for a specific review
  const handleGenerateReply = async (review: ReviewItem, tone = activeReplyTone) => {
    setGeneratingReplyId(review.id);

    try {
      const response = await fetch('/api/ai/generate-reply', {
        method: 'POST',
        headers: await authenticatedJsonHeaders(),
        body: JSON.stringify({
          storeId: store.id,
          storeName: store.name,
          customerName: review.customerName,
          reviewText: review.reviewText,
          starRating: review.rating,
          tone: tone,
          ownerName: store.autoPilot.ownerName || 'The Management Team',
        }),
      });

      const data = await response.json();
      if (data.reply) {
        const updated = reviews.map((r) =>
          r.id === review.id
            ? { ...r, aiReply: data.reply, replyStatus: 'drafted' as const }
            : r
        );
        onUpdateReviews(updated);
        setDraftText(data.reply);
      }
    } catch (err) {
      console.error('Failed to generate AI reply', err);
    } finally {
      setGeneratingReplyId(null);
    }
  };

  // Google Business Profile publishing is not connected yet. Keep the draft honest
  // and put it on the clipboard for the owner to publish manually.
  const handlePublishReply = (reviewId: string) => {
    navigator.clipboard.writeText(draftText).catch(() => undefined);
    const updated = reviews.map((r) =>
      r.id === reviewId
        ? {
            ...r,
            aiReply: draftText,
            replyStatus: 'drafted' as const,
          }
        : r
    );
    onUpdateReviews(updated);
  };

  // Toggle Auto-Pilot
  const handleToggleAutoPilot = () => {
    const updated = {
      ...store,
      autoPilot: {
        ...store.autoPilot,
        enabled: !store.autoPilot.enabled,
      },
    };
    onUpdateStore(updated);
  };

  const handleCopyReply = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6" id="review-inbox-section">
      {/* Top Banner with Auto-Pilot status */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <Bot className="w-3.5 h-3.5 text-purple-600" />
              AI Review Inbox & GMB Auto-Responder
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Google Review Inbox & AI Smart Replies
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Every AI response acknowledges specific mentioned items, dishes, and staff members automatically.
          </p>
        </div>

        {/* Auto-Pilot Toggle & Settings Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <Bot className={`w-3.5 h-3.5 ${store.autoPilot.enabled ? 'text-emerald-500' : 'text-slate-400'}`} />
                AI Auto-Pilot Mode
              </span>
              <span className="text-[10px] text-slate-500">
                {store.autoPilot.enabled
                  ? `Auto-replying to ${store.autoPilot.minRating}+ star reviews`
                  : 'Manual approval mode'}
              </span>
            </div>

            <button
              onClick={handleToggleAutoPilot}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                store.autoPilot.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
              id="toggle-autopilot-mode-btn"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  store.autoPilot.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            onClick={() => setShowAutoPilotSettings(!showAutoPilotSettings)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            title="Auto-Pilot Configuration"
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Auto-Pilot Settings Drawer / Card */}
      {showAutoPilotSettings && (
        <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-blue-600" />
            Auto-Pilot Configuration Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Minimum Rating for Instant Auto-Reply
              </label>
              <select
                value={store.autoPilot.minRating}
                onChange={(e) =>
                  onUpdateStore({
                    ...store,
                    autoPilot: { ...store.autoPilot, minRating: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value={5}>⭐⭐⭐⭐⭐ 5 Stars Only</option>
                <option value={4}>⭐⭐⭐⭐ 4 Stars & Above</option>
                <option value={3}>⭐⭐⭐ 3 Stars & Above</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Default Reply Tone
              </label>
              <select
                value={store.autoPilot.tone}
                onChange={(e) =>
                  onUpdateStore({
                    ...store,
                    autoPilot: { ...store.autoPilot, tone: e.target.value as any },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="Warm & Grateful">Warm & Grateful</option>
                <option value="Professional & Brief">Professional & Brief</option>
                <option value="Return Incentive">Return Incentive & Promo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Owner / Manager Signature
              </label>
              <input
                type="text"
                value={store.autoPilot.ownerName}
                onChange={(e) =>
                  onUpdateStore({
                    ...store,
                    autoPilot: { ...store.autoPilot, ownerName: e.target.value },
                  })
                }
                placeholder="e.g. Rahul & UrbanBite Team"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Inbox Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Review Feed List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {/* Search & Tabs */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews, staff, dishes..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'All Reviews' },
                { id: 'pending', label: 'Needs Reply' },
                { id: 'drafted', label: 'Drafts' },
                { id: 'published', label: 'Replied' },
                { id: 'critical', label: 'Critical' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    filterTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Reviews */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[580px] overflow-y-auto">
            {filteredReviews.map((review) => {
              const isSelected = selectedReview?.id === review.id;
              return (
                <div
                  key={review.id}
                  onClick={() => setSelectedReviewId(review.id)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={review.customerAvatar}
                        alt={review.customerName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                          {review.customerName}
                        </span>
                        <span className="text-[10px] text-slate-400">{review.date}</span>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Snippet */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {review.reviewText}
                  </p>

                  {/* Tags & Reply Status */}
                  <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 text-[10px]">
                    <div className="flex items-center gap-1">
                      {review.sentiment === 'positive' && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-semibold">
                          Positive
                        </span>
                      )}
                      {review.sentiment === 'neutral' && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 font-semibold">
                          Neutral
                        </span>
                      )}
                      {review.sentiment === 'negative' && (
                        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300 font-semibold">
                          Critical
                        </span>
                      )}
                      {review.isAutoPilot && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 font-semibold flex items-center gap-0.5">
                          <Bot className="w-2.5 h-2.5" /> Auto-Replied
                        </span>
                      )}
                    </div>

                    <span
                      className={`font-semibold ${
                        review.replyStatus === 'published'
                          ? 'text-emerald-600'
                          : review.replyStatus === 'drafted'
                          ? 'text-blue-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {review.replyStatus === 'published' && '✓ Replied'}
                      {review.replyStatus === 'drafted' && '✎ Draft Ready'}
                      {review.replyStatus === 'pending' && '● Needs Reply'}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredReviews.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                No reviews found matching this filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Review Detail & AI Reply Studio */}
        {selectedReview ? (
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
            {/* Customer Review Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedReview.customerAvatar}
                    alt={selectedReview.customerName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-xs"
                  />
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedReview.customerName}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>{selectedReview.date} on Google Maps</span>
                      <span>•</span>
                      <span className="text-blue-600 font-medium">Verified Customer</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenSocialGenerator(selectedReview)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 shadow-xs"
                    title="Generate Instagram Story Graphic from this review"
                  >
                    <Share2 className="w-3.5 h-3.5 text-pink-600" />
                    Share Graphic
                  </button>

                  <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-900">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < selectedReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                "{selectedReview.reviewText}"
              </p>

              {/* Detected Key Mentions & Entities */}
              {selectedReview.mentionedEntities.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-500 font-semibold">🔍 Mentioned in Review:</span>
                  {selectedReview.mentionedEntities.map((entity, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 font-medium"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* AI Reply Generator Console */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Context-Aware Reply Generator
                </span>

                {/* Reply Tone Toggle */}
                <div className="flex items-center gap-1.5">
                  {(['Warm & Grateful', 'Professional & Brief', 'Return Incentive'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setActiveReplyTone(t);
                        handleGenerateReply(selectedReview, t);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                        activeReplyTone === t
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply Text Area */}
              <div className="relative">
                <textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Click 'Generate AI Reply' below to draft a customized, mention-specific response..."
                  rows={5}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed resize-none shadow-xs"
                />

                {draftText && (
                  <button
                    onClick={() => handleCopyReply(draftText, selectedReview.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-xs hover:bg-slate-50"
                    title="Copy Reply"
                  >
                    {copiedId === selectedReview.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  onClick={() => handleGenerateReply(selectedReview, activeReplyTone)}
                  disabled={generatingReplyId === selectedReview.id}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all active:scale-95 disabled:opacity-50"
                  id="regenerate-ai-reply-btn"
                >
                  {generatingReplyId === selectedReview.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  )}
                  {draftText ? 'Regenerate AI Reply' : 'Generate AI Reply'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePublishReply(selectedReview.id)}
                    disabled={!draftText.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#34A853] hover:bg-[#2E954B] text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
                    id="publish-google-reply-btn"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Copy Draft for Google
                  </button>
                </div>
              </div>

              {/* Note on Google Sync */}
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 border border-blue-100 dark:border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>
                  Copy this draft, then publish it manually in your Google Business Profile. Automatic Google publishing is not configured.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800 shadow-xs">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Review Inbox Ready for {store.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                When customers scan your 6"×4" Acrylic Table Stand or tap your NFC disc, their generated 5-star Google reviews and private feedback will appear here in real-time.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <a
                href={store.googleReviewUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit Google Reviews Page</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
