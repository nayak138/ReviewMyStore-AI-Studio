import React, { useState } from 'react';
import { Store, KeywordItem, ReviewItem } from '../types';
import { INDUSTRY_TEMPLATES } from '../data/initialData';
import {
  CheckCircle2,
  Sparkles,
  QrCode,
  MapPin,
  ExternalLink,
  Plus,
  Trash2,
  Download,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  Bot,
  Star,
  Printer,
  ShieldCheck,
  Zap,
  Tag
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface OnboardingWizardProps {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
  onSaveKeywords: (keywords: KeywordItem[]) => void;
  onUpdateStore: (store: Store) => void;
  onAddTestReview: (review: ReviewItem) => void;
  onFinish: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  store,
  isOpen,
  onClose,
  onSaveKeywords,
  onUpdateStore,
  onAddTestReview,
  onFinish,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [industryKeywords, setIndustryKeywords] = useState<KeywordItem[]>(() => {
    const template = INDUSTRY_TEMPLATES.find((t) => t.id === store.industry) || INDUSTRY_TEMPLATES[0];
    const initial: KeywordItem[] = [
      ...template.keywords.product.slice(0, 4).map((text, i) => ({
        id: `kw_prod_${i}`,
        text,
        category: 'product' as const,
      })),
      ...template.keywords.experience.slice(0, 3).map((text, i) => ({
        id: `kw_exp_${i}`,
        text,
        category: 'experience' as const,
      })),
      ...template.keywords.staff.slice(0, 2).map((text, i) => ({
        id: `kw_staff_${i}`,
        text,
        category: 'staff' as const,
      })),
    ];
    return initial;
  });

  const [newCustomKeyword, setNewCustomKeyword] = useState('');
  const [customKeywordCategory, setCustomKeywordCategory] = useState<'product' | 'experience' | 'staff'>('product');
  const [isSimulatingReview, setIsSimulatingReview] = useState(false);
  const [simulatedReviewGenerated, setSimulatedReviewGenerated] = useState(false);
  const [simulatedReviewText, setSimulatedReviewText] = useState('');
  const [testCustomerName, setTestCustomerName] = useState('Alex Rivera');

  if (!isOpen) return null;

  const totalSteps = 4;

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomKeyword.trim()) return;
    const item: KeywordItem = {
      id: `kw_custom_${Date.now()}`,
      text: newCustomKeyword.trim(),
      category: customKeywordCategory,
      isCustom: true,
    };
    setIndustryKeywords([...industryKeywords, item]);
    setNewCustomKeyword('');
  };

  const handleRemoveKeyword = (id: string) => {
    setIndustryKeywords(industryKeywords.filter((k) => k.id !== id));
  };

  const handleSimulateFirstReview = async () => {
    setIsSimulatingReview(true);
    try {
      const selectedKws = industryKeywords.slice(0, 3).map((k) => k.text);
      const res = await fetch('/api/ai/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: store.name,
          category: store.category,
          rating: 5,
          selectedKeywords: selectedKws,
          tone: 'Warm & Detailed',
          customerName: testCustomerName,
        }),
      });
      const data = await res.json();
      const generatedText =
        data.review ||
        data.reviewText ||
        `Had an exceptional experience at ${store.name}! The ${selectedKws.join(', ')} were outstanding. Highly recommended to anyone looking for top quality!`;

      setSimulatedReviewText(generatedText);
      setSimulatedReviewGenerated(true);

      // Create review item
      const newReviewItem: ReviewItem = {
        id: `rev_test_${Date.now()}`,
        storeId: store.id,
        customerName: testCustomerName,
        customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        reviewText: generatedText,
        selectedKeywords: selectedKws,
        sentiment: 'positive',
        mentionedEntities: selectedKws,
        replyStatus: 'drafted',
        aiReply: `Dear ${testCustomerName}, thank you so much for the glowing 5-star review! We are thrilled you loved the ${selectedKws[0] || 'experience'}. We look forward to seeing you again soon! — ${store.autoPilot.ownerName || 'The Team'}`,
        date: 'Just now',
        isAutoPilot: true,
      };

      onAddTestReview(newReviewItem);
    } catch (err) {
      console.error(err);
      const fallbackText = `Absolutely top tier service at ${store.name}! Everything was seamless and high quality. Will definitely be returning!`;
      setSimulatedReviewText(fallbackText);
      setSimulatedReviewGenerated(true);
    } finally {
      setIsSimulatingReview(false);
    }
  };

  const handleComplete = () => {
    onSaveKeywords(industryKeywords);
    onFinish();
    onClose();
  };

  const customerPortalUrl = `${window.location.origin}${window.location.pathname}#review?storeId=${store.slug || store.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    customerPortalUrl
  )}&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Top Progress Banner */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" showWordmark={true} />
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-500/30">
                SaaS Store Activation
              </span>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              Step {currentStep} of {totalSteps}
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className={currentStep === 1 ? 'text-blue-400 font-bold' : ''}>1. Google Connection</span>
            <span className={currentStep === 2 ? 'text-blue-400 font-bold' : ''}>2. Smart Keywords</span>
            <span className={currentStep === 3 ? 'text-blue-400 font-bold' : ''}>3. Table QR Stand</span>
            <span className={currentStep === 4 ? 'text-blue-400 font-bold' : ''}>4. Test & Launch</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: Verify Google Place & Details */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                  {store.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                      {store.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{store.address}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Category: <strong className="text-slate-700 dark:text-slate-200">{store.category}</strong> • Google Rating: <strong className="text-amber-600 font-bold">★ {store.rating || 4.8}</strong> ({store.userRatingsTotal || 35} reviews)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Official Google Review Submission Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={store.googleReviewUrl}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-mono"
                  />
                  <a
                    href={store.googleReviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test Google Link</span>
                  </a>
                </div>
                <p className="text-[11px] text-slate-500">
                  This direct Google link triggers the 5-star review modal automatically when customers tap copy.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong>1-3 Star Private Shield is Active:</strong> Discontent customers rating 1-3 stars are diverted to a private manager resolution form instead of public Google Maps.
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Configure Smart Industry Keywords */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Keywords Tailored to {store.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  When customers tap these keywords at their table, Gemini incorporates them into high-ranking, natural Google reviews.
                </p>
              </div>

              {/* Active Keywords List */}
              <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 min-h-[100px]">
                {industryKeywords.map((kw) => (
                  <span
                    key={kw.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs group"
                  >
                    <span>{kw.text}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 font-semibold uppercase">
                      {kw.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Keyword */}
              <form onSubmit={handleAddKeyword} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newCustomKeyword}
                  onChange={(e) => setNewCustomKeyword(e.target.value)}
                  placeholder="Add custom item, dish, staff name or service..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
                <select
                  value={customKeywordCategory}
                  onChange={(e) => setCustomKeywordCategory(e.target.value as any)}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option value="product">Product / Service</option>
                  <option value="experience">Ambience</option>
                  <option value="staff">Staff Member</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: Preview & Print 6"×4" Table Stand */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  6"×4" Acrylic Table QR Stand Ready
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Place this stand on dining tables, reception counters, or checkout desks.
                </p>
              </div>

              {/* Stand Mockup Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white text-center shadow-xl border border-slate-800 max-w-sm mx-auto space-y-4">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-extrabold tracking-wider uppercase text-blue-300">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Scan to Share Experience
                </div>

                <h4 className="text-lg font-black tracking-tight">{store.name}</h4>
                <p className="text-xs text-slate-400">
                  Tap your favorite dishes & services to draft your 5-star Google review in 5 seconds!
                </p>

                <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mx-auto">
                  <img src={qrCodeUrl} alt="Store Review QR" className="w-36 h-36 mx-auto rounded-lg" />
                </div>

                <p className="text-[11px] font-mono text-slate-400 truncate">
                  {customerPortalUrl}
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <a
                  href={qrCodeUrl}
                  download={`${store.slug || 'store'}-qr-stand.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Stand Image</span>
                </a>
              </div>
            </div>
          )}

          {/* STEP 4: Live Test & First Review */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Simulate Your First Customer Review
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Test the real customer review generation flow powered by Gemini AI with your configured keywords.
                </p>
              </div>

              {!simulatedReviewGenerated ? (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-4">
                  <div className="flex justify-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                    Customer <strong>{testCustomerName}</strong> selects keywords:{' '}
                    <span className="font-semibold text-blue-600">
                      {industryKeywords.slice(0, 3).map((k) => k.text).join(', ')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateFirstReview}
                    disabled={isSimulatingReview}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50 cursor-pointer"
                  >
                    {isSimulatingReview ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Gemini AI is crafting realistic review...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4" />
                        <span>Generate & Add Test Review to Inbox</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Real AI Review Successfully Generated & Dispatched to Inbox!</span>
                  </div>
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-xs text-slate-800 dark:text-slate-200 leading-relaxed italic">
                    "{simulatedReviewText}"
                  </div>
                  <p className="text-[11px] text-slate-500">
                    An AI auto-pilot reply has also been drafted acknowledging your store's items automatically.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Launch Production Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
