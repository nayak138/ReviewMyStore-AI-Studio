import React, { useState } from 'react';
import { Store, ReviewItem } from '../types';
import {
  TrendingUp,
  Award,
  Sparkles,
  Share2,
  Download,
  Copy,
  Check,
  Star,
  MessageSquare,
  Users,
  BarChart3,
  Coffee,
  Send,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { StoreAwningIcon } from './BrandLogo';

interface DashboardAnalyticsProps {
  store: Store;
  reviews: ReviewItem[];
  initialSelectedSocialReview?: ReviewItem | null;
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  store,
  reviews,
  initialSelectedSocialReview,
}) => {
  const [selectedSocialReview, setSelectedSocialReview] = useState<ReviewItem | null>(
    initialSelectedSocialReview || reviews[0] || null
  );
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');

  // Bundle Social publishing state
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['instagram', 'facebook', 'twitter']);
  const [isPublishingSocial, setIsPublishingSocial] = useState<boolean>(false);
  const [socialPublishStatus, setSocialPublishStatus] = useState<{
    success: boolean;
    message: string;
    postId?: string;
  } | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const customerReviewUrl = `${origin}/#review?storeId=${store.id}&slug=${store.slug}`;

  // Mentions Leaderboard Data
  const mentionCounts: Record<string, { count: number; category: string }> = {
    'Signature Spanish Latte': { count: 38, category: 'Product' },
    'Barista Sarah': { count: 29, category: 'Staff' },
    'Truffle Mushroom Pasta': { count: 24, category: 'Product' },
    'Cozy Atmosphere': { count: 21, category: 'Vibe' },
    'Fresh Almond Croissant': { count: 18, category: 'Product' },
    'Fast Free Wi-Fi': { count: 15, category: 'Vibe' },
  };

  const handleCopyInvite = (template: string) => {
    navigator.clipboard.writeText(template);
    setCopiedTemplate('copied');
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const handleSendWhatsAppInvite = () => {
    if (!customerPhone) return;
    const text = encodeURIComponent(
      `Hi ${customerName || 'there'}! Thank you for visiting ${store.name} today. We’d love to hear your thoughts! Tap here to share a 1-click Google review with our AI assistant: ${customerReviewUrl}`
    );
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const toggleChannel = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== channel));
      }
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  // Publish review directly via Bundle Social API
  const handlePublishBundleSocial = async () => {
    if (!selectedSocialReview) return;
    setIsPublishingSocial(true);
    setSocialPublishStatus(null);

    try {
      const res = await fetch('/api/social/publish-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: store.name,
          customerName: selectedSocialReview.customerName,
          rating: selectedSocialReview.rating,
          reviewText: selectedSocialReview.reviewText,
          channels: selectedChannels,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSocialPublishStatus({
          success: true,
          message: data.message || 'Successfully broadcast to selected channels via Bundle Social!',
          postId: data.postId,
        });
      } else {
        setSocialPublishStatus({
          success: false,
          message: data.error || 'Failed to publish via Bundle Social.',
        });
      }
    } catch (err) {
      console.error('Bundle social publish error:', err);
      setSocialPublishStatus({
        success: false,
        message: 'Could not connect to Bundle Social API server.',
      });
    } finally {
      setIsPublishingSocial(false);
    }
  };

  // 1-Click Social Card Download
  const handleDownloadSocialCard = () => {
    if (!selectedSocialReview) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Instagram Post standard square (1080 x 1080)
    canvas.width = 1080;
    canvas.height = 1080;

    // Background Gradient (Google Blue to Indigo)
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, '#1E3A8A');
    grad.addColorStop(0.5, '#1E40AF');
    grad.addColorStop(1, '#2563EB');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative Circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.arc(950, 150, 300, 0, Math.PI * 2);
    ctx.fill();

    // Central Card
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(80, 100, 920, 880, 48);
    ctx.fill();

    // Top Store Brand Header
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(store.name, 140, 200);

    ctx.fillStyle = '#64748B';
    ctx.font = '500 28px system-ui, sans-serif';
    ctx.fillText(store.locality + ' • Google Review', 140, 245);

    // 5 Stars
    ctx.fillStyle = '#FBBC05';
    ctx.font = '48px system-ui, sans-serif';
    ctx.fillText('★★★★★', 140, 320);

    // Quote Marks
    ctx.fillStyle = '#E2E8F0';
    ctx.font = 'bold 120px Georgia, serif';
    ctx.fillText('“', 130, 430);

    // Review Text
    ctx.fillStyle = '#1E293B';
    ctx.font = 'italic 500 36px system-ui, sans-serif';
    wrapText(ctx, `"${selectedSocialReview.reviewText}"`, 140, 440, 800, 52);

    // Reviewer Profile at bottom of card
    const reviewerY = 860;
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillText(`– ${selectedSocialReview.customerName}`, 140, reviewerY);

    ctx.fillStyle = '#3B82F6';
    ctx.font = '600 24px system-ui, sans-serif';
    ctx.fillText('Verified 5-Star Customer on Google Maps', 140, reviewerY + 38);

    // Bottom Logo
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('ReviewMyStore.AI', 920, 930);

    const uri = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = uri;
    a.download = `${store.name.replace(/[^a-zA-Z0-9]/g, '_')}_Social_Review.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8" id="analytics-section">
      {/* Top Section: Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Average Google Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-2">
            {store.rating} <span className="text-xs font-semibold text-emerald-600">+0.3 this month</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Based on {store.userRatingsTotal} verified reviews</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>AI Auto-Pilot Replies</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-2">
            94.2% <span className="text-xs font-semibold text-purple-600">Avg &lt; 5 min response</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% specific entity acknowledgement</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>QR & NFC Tap Conversions</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-2">
            418 <span className="text-xs font-semibold text-blue-600">Scans</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">78% converted to published reviews</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Negative Shield Saves</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-2">
            12 <span className="text-xs font-semibold text-emerald-600">Resolved privately</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Protected 5-star public rating</p>
        </div>
      </div>

      {/* Grid: Staff & Dish Leaderboard & Direct WhatsApp Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Staff & Dish Mention Leaderboard */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Staff & Menu Item Mention Leaderboard
            </h3>
            <span className="text-xs font-semibold text-blue-600">AI Extracted</span>
          </div>

          <p className="text-xs text-slate-500">
            Identifies which specific items, dishes, and staff members generate the highest customer praise.
          </p>

          <div className="space-y-3 pt-2">
            {Object.entries(mentionCounts).map(([name, data], idx) => (
              <div
                key={name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-extrabold flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Category: {data.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                    {data.count} mentions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp & SMS Quick Invite Dispatcher */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                WhatsApp & SMS Review Dispatcher
              </h3>
              <span className="text-xs font-semibold text-emerald-600">1-Tap Invite</span>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Send personalized review requests directly to recent customers via WhatsApp with your unique store portal link.
            </p>

            <div className="space-y-3 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. John"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Customer WhatsApp Number
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Message Preview */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                <span className="font-bold block">Preview Message:</span>
                <p className="text-[11px] leading-relaxed">
                  "Hi {customerName || 'there'}! Thank you for visiting {store.name} today. We’d love to hear your thoughts! Tap here to share a 1-click Google review with our AI assistant: {customerReviewUrl}"
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => handleCopyInvite(`Hi ${customerName || 'there'}! Thank you for visiting ${store.name} today. We’d love to hear your thoughts: ${customerReviewUrl}`)}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedTemplate ? 'Copied!' : 'Copy Text'}
            </button>

            <button
              onClick={handleSendWhatsAppInvite}
              disabled={!customerPhone}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Send on WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Feature 3: Review-to-Social Graphic Generator */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                <Share2 className="w-3.5 h-3.5 text-pink-600" />
                Social Marketing Studio
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Review-to-Social Story & Post Generator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transform any 5-star Google review into a branded high-res visual post for Instagram & Facebook.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedSocialReview?.id || ''}
              onChange={(e) => {
                const found = reviews.find((r) => r.id === e.target.value);
                if (found) setSelectedSocialReview(found);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
            >
              {reviews
                .filter((r) => r.rating === 5)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    ⭐ 5 Stars: {r.customerName}
                  </option>
                ))}
            </select>

            <button
              onClick={handleDownloadSocialCard}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download Instagram Graphic (PNG)
            </button>
          </div>
        </div>

        {/* Live Social Card Preview Box */}
        {selectedSocialReview && (
          <div className="flex justify-center">
            <div className="w-full max-w-md bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6 rounded-3xl shadow-xl text-white space-y-4 border border-blue-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <StoreAwningIcon size={34} />
                  <div>
                    <h4 className="text-sm font-extrabold tracking-tight leading-tight">{store.name}</h4>
                    <p className="text-[10px] text-blue-200">{store.locality}</p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                  ★★★★★
                </div>
              </div>

              {/* Quote Card */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
                <p className="text-xs leading-relaxed italic text-white/95">
                  "{selectedSocialReview.reviewText}"
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px]">
                  <span className="font-bold text-white">– {selectedSocialReview.customerName}</span>
                  <span className="text-blue-300">Verified Google Review</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-blue-200">
                <span>reviewmystore.ai</span>
                <span>⭐⭐⭐⭐⭐ 4.8 Rating on Google</span>
              </div>
            </div>
          </div>
        )}

        {/* Bundle Social 1-Click Multi-Channel Distribution Box */}
        {selectedSocialReview && (
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-pink-50/30 dark:from-slate-800/80 dark:to-pink-950/20 border border-pink-200/80 dark:border-pink-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  BS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Bundle Social Multi-Channel Auto-Publisher
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 font-extrabold border border-pink-300 dark:border-pink-800">
                      API Connected
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Broadcast this 5-star review across your social media channels simultaneously using your Bundle Social API key.
                  </p>
                </div>
              </div>

              {/* Channel Selector Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'instagram', label: 'Instagram' },
                  { id: 'facebook', label: 'Facebook' },
                  { id: 'twitter', label: 'X / Twitter' },
                  { id: 'linkedin', label: 'LinkedIn' },
                ].map((ch) => {
                  const active = selectedChannels.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => toggleChannel(ch.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        active
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {ch.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Broadcast status feedback banner */}
            {socialPublishStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  socialPublishStatus.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {socialPublishStatus.success ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-semibold">{socialPublishStatus.message}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-700/60">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                Caption preview: "⭐ Glowing 5-Star Customer Review for {store.name}..."
              </p>

              <button
                onClick={handlePublishBundleSocial}
                disabled={isPublishingSocial || selectedChannels.length === 0}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-sm active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isPublishingSocial ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Broadcasting to {selectedChannels.length} Channels...
                  </span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Broadcast via Bundle Social ({selectedChannels.length} Channels)
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Canvas Text Wrap Helper
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
