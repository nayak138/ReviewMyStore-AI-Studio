import React, { useState, useEffect } from 'react';
import { Store, ReviewItem, KeywordItem } from './types';
import {
  INITIAL_STORES,
  INITIAL_KEYWORDS,
  INITIAL_REVIEWS,
  INDUSTRY_TEMPLATES,
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ReviewInbox } from './components/ReviewInbox';
import { QrStandGenerator } from './components/QrStandGenerator';
import { KeywordManager } from './components/KeywordManager';
import { StoreProfile } from './components/StoreProfile';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { CustomerReviewPortal } from './components/CustomerReviewPortal';
import { AddLocationModal } from './components/AddLocationModal';
import { AuthModal } from './components/AuthModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Smartphone, Eye, ArrowLeft, Bot, Sparkles, X, LogIn } from 'lucide-react';

const STORAGE_KEY_STORES = 'reviewmystore_stores_v1';
const STORAGE_KEY_KEYWORDS = 'reviewmystore_keywords_v1';
const STORAGE_KEY_REVIEWS = 'reviewmystore_reviews_v1';

function MainApp() {
  const { user, openAuthModal, pendingClaimStore, setPendingClaimStore } = useAuth();

  // Application State with LocalStorage Persistence
  const [stores, setStores] = useState<Store[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STORES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load stores from localStorage', e);
    }
    return INITIAL_STORES;
  });

  const [currentStoreId, setCurrentStoreId] = useState<string>(() => {
    return stores[0]?.id || INITIAL_STORES[0].id;
  });

  const [keywordsMap, setKeywordsMap] = useState<Record<string, KeywordItem[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_KEYWORDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load keywords from localStorage', e);
    }
    return INITIAL_KEYWORDS;
  });

  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load reviews from localStorage', e);
    }
    return INITIAL_REVIEWS;
  });

  // Navigation State
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'customer-portal'>('landing');
  const [dashboardTab, setDashboardTab] = useState<'inbox' | 'qr-stand' | 'keywords' | 'analytics' | 'settings'>('inbox');
  const [showAddLocationModal, setShowAddLocationModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [pendingClaimPlace, setPendingClaimPlace] = useState<any | null>(null);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState<boolean>(false);
  const [showCustomerMobileSimulator, setShowCustomerMobileSimulator] = useState<boolean>(false);
  const [socialShareReview, setSocialShareReview] = useState<ReviewItem | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STORES, JSON.stringify(stores));
    } catch (e) {}
  }, [stores]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_KEYWORDS, JSON.stringify(keywordsMap));
    } catch (e) {}
  }, [keywordsMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    } catch (e) {}
  }, [reviews]);

  const currentStore = stores.find((s) => s.id === currentStoreId) || stores[0] || INITIAL_STORES[0];

  // Auto-setup store when user logs in with a pending claimed place
  useEffect(() => {
    if (user && pendingClaimStore) {
      setupStoreForUser(pendingClaimStore, user);
      setPendingClaimStore(null);
      setCurrentView('dashboard');
    }
  }, [user, pendingClaimStore]);

  // Get or initialize keywords for current store
  const getStoreKeywords = (store: Store): KeywordItem[] => {
    if (keywordsMap[store.id] && Array.isArray(keywordsMap[store.id])) {
      return keywordsMap[store.id];
    }
    const template = INDUSTRY_TEMPLATES.find((t) => t.id === store.industry) || INDUSTRY_TEMPLATES[0];
    const initial: KeywordItem[] = [
      ...template.keywords.product.map((text, i) => ({
        id: `tpl_prod_${store.id}_${i}`,
        text,
        category: 'product' as const,
      })),
      ...template.keywords.experience.map((text, i) => ({
        id: `tpl_exp_${store.id}_${i}`,
        text,
        category: 'experience' as const,
      })),
      ...template.keywords.staff.map((text, i) => ({
        id: `tpl_staff_${store.id}_${i}`,
        text,
        category: 'staff' as const,
      })),
    ];
    return initial;
  };

  const currentKeywords = getStoreKeywords(currentStore);

  const pendingReviewsCount = reviews.filter(
    (r) => r.storeId === currentStore.id && r.replyStatus === 'pending'
  ).length;

  // Listen to hash changes for customer QR links: e.g. #review?storeId=...
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#review')) {
        setCurrentView('customer-portal');
        const params = new URLSearchParams(hash.replace('#review', '').replace(/^\?/, ''));
        const targetStoreId = params.get('storeId');
        if (targetStoreId) {
          const found = stores.find((s) => s.id === targetStoreId || s.slug === targetStoreId);
          if (found) setCurrentStoreId(found.id);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [stores]);

  // Helper to provision and activate a store for a user
  const setupStoreForUser = (placeData: any, ownerUser?: any) => {
    const newStoreId = 'store-claim-' + Date.now();
    const industry = placeData.industry || 'cafe';
    const ownerName =
      ownerUser?.user_metadata?.full_name ||
      ownerUser?.email?.split('@')[0] ||
      `${placeData.name} Team`;

    const newStore: Store = {
      id: newStoreId,
      name: placeData.name,
      slug: placeData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      tagline: 'Specialty Store & Local Favorite',
      address: placeData.address,
      locality: placeData.locality || placeData.address.split(',')[0] || 'Downtown',
      category: placeData.category || 'Local Business',
      industry: industry,
      phone: placeData.phone || '+1 (555) 019-2831',
      website: placeData.website || 'https://reviewmystore.ai',
      openingHours: placeData.openingHours || 'Mon - Sun: 8:00 AM – 10:00 PM',
      photoUrl: placeData.photoUrl,
      rating: placeData.rating || 4.8,
      userRatingsTotal: placeData.userRatingsTotal || 45,
      googlePlaceId: placeData.placeId,
      googleReviewUrl: `https://search.google.com/local/writereview?placeid=${placeData.placeId}`,
      socialLinks: {
        instagram: 'https://instagram.com/mybusiness',
        whatsapp: '15550192831',
      },
      nfcEnabled: true,
      privateFeedbackShield: true,
      autoPilot: {
        enabled: true,
        minRating: 4,
        tone: 'Warm & Grateful',
        ownerName: ownerName,
      },
    };

    // Generate industry template keywords for this new store
    const template = INDUSTRY_TEMPLATES.find((t) => t.id === industry) || INDUSTRY_TEMPLATES[0];
    const initialKws: KeywordItem[] = [
      ...template.keywords.product.map((text, i) => ({
        id: `kw_p_${newStoreId}_${i}`,
        text,
        category: 'product' as const,
      })),
      ...template.keywords.experience.map((text, i) => ({
        id: `kw_e_${newStoreId}_${i}`,
        text,
        category: 'experience' as const,
      })),
      ...template.keywords.staff.map((text, i) => ({
        id: `kw_s_${newStoreId}_${i}`,
        text,
        category: 'staff' as const,
      })),
    ];

    setKeywordsMap((prev) => ({ ...prev, [newStoreId]: initialKws }));
    setStores([newStore, ...stores]);
    setCurrentStoreId(newStore.id);
    setCurrentView('dashboard');
    setDashboardTab('inbox');
    setShowOnboardingWizard(true);
  };

  // Handle claiming a business from Places API on the landing page
  const handleClaimStoreFromLanding = (placeData: any) => {
    if (!user) {
      setPendingClaimPlace(placeData);
      openAuthModal(placeData);
      setShowAuthModal(true);
    } else {
      setupStoreForUser(placeData, user);
    }
  };

  const handleOpenAuth = (place?: any) => {
    if (place) {
      setPendingClaimPlace(place);
      openAuthModal(place);
    } else {
      openAuthModal();
    }
    setShowAuthModal(true);
  };

  // Add new location
  const handleAddStore = (newStore: Store) => {
    setStores([...stores, newStore]);
    setCurrentStoreId(newStore.id);
  };

  // Update store profile
  const handleUpdateStore = (updatedStore: Store) => {
    setStores(stores.map((s) => (s.id === updatedStore.id ? updatedStore : s)));
  };

  // Update keywords for current store
  const handleUpdateKeywords = (updated: KeywordItem[]) => {
    setKeywordsMap((prev) => ({
      ...prev,
      [currentStore.id]: updated,
    }));
  };

  // Switch to social generator with specific review
  const handleOpenSocialGenerator = (review: ReviewItem) => {
    setSocialShareReview(review);
    setDashboardTab('analytics');
  };

  // View: Direct Customer Review Portal (Full Screen for Mobile QR scan)
  if (currentView === 'customer-portal') {
    return (
      <div className="relative min-h-screen bg-slate-950">
        {/* Owner return bar */}
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800 z-50 sticky top-0">
          <span className="flex items-center gap-2 font-medium text-slate-300">
            <Smartphone className="w-4 h-4 text-blue-400" />
            Customer Review Portal Mode (What customers see when scanning table QR / NFC)
          </span>
          <button
            onClick={() => {
              window.location.hash = '';
              setCurrentView('dashboard');
            }}
            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold flex items-center gap-1 text-white shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Dashboard
          </button>
        </div>

        <CustomerReviewPortal
          store={currentStore}
          keywords={currentKeywords}
          onBackToDashboard={() => {
            window.location.hash = '';
            setCurrentView('dashboard');
          }}
        />
      </div>
    );
  }

  // View: Landing Page
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onClaimStore={handleClaimStoreFromLanding}
          onEnterDashboardDirectly={() => {
            if (user) {
              setCurrentView('dashboard');
            } else {
              handleOpenAuth();
            }
          }}
          onOpenAuth={() => handleOpenAuth()}
        />
        <AuthModal
          isOpen={showAuthModal}
          pendingStore={pendingClaimPlace}
          onClose={() => {
            setShowAuthModal(false);
            setPendingClaimPlace(null);
          }}
        />
      </>
    );
  }

  // View: Main Store Owner Dashboard
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white" id="main-dashboard-app">
      {/* Top Navbar */}
      <Navbar
        activeTab={dashboardTab}
        onChangeTab={setDashboardTab}
        currentStore={currentStore}
        allStores={stores}
        onSelectStore={setCurrentStoreId}
        onAddNewLocation={() => setShowAddLocationModal(true)}
        onOpenCustomerView={() => setShowCustomerMobileSimulator(true)}
        onGoToLanding={() => setCurrentView('landing')}
        onOpenAuthModal={() => handleOpenAuth()}
        pendingReviewsCount={pendingReviewsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {dashboardTab === 'inbox' && (
          <ReviewInbox
            store={currentStore}
            reviews={reviews}
            onUpdateReviews={setReviews}
            onUpdateStore={handleUpdateStore}
            onOpenSocialGenerator={handleOpenSocialGenerator}
          />
        )}

        {dashboardTab === 'qr-stand' && (
          <QrStandGenerator
            store={currentStore}
            onTestCustomerPortal={() => setShowCustomerMobileSimulator(true)}
          />
        )}

        {dashboardTab === 'keywords' && (
          <KeywordManager
            store={currentStore}
            keywords={currentKeywords}
            onUpdateKeywords={handleUpdateKeywords}
          />
        )}

        {dashboardTab === 'analytics' && (
          <DashboardAnalytics
            store={currentStore}
            reviews={reviews}
            initialSelectedSocialReview={socialShareReview}
          />
        )}

        {dashboardTab === 'settings' && (
          <StoreProfile
            store={currentStore}
            allStores={stores}
            onUpdateStore={handleUpdateStore}
            onSelectStore={setCurrentStoreId}
            onAddNewLocation={() => setShowAddLocationModal(true)}
          />
        )}
      </main>

      {/* Onboarding Wizard (Triggers automatically when claiming a business) */}
      <OnboardingWizard
        store={currentStore}
        isOpen={showOnboardingWizard}
        onClose={() => setShowOnboardingWizard(false)}
        onSaveKeywords={(kws) => handleUpdateKeywords(kws)}
        onUpdateStore={handleUpdateStore}
        onAddTestReview={(testReview) => setReviews((prev) => [testReview, ...prev])}
        onFinish={() => setShowOnboardingWizard(false)}
      />

      {/* Add New Location Modal */}
      <AddLocationModal
        isOpen={showAddLocationModal}
        onClose={() => setShowAddLocationModal(false)}
        onAddStore={handleAddStore}
      />

      {/* Supabase Authentication & Sign-in Modal */}
      <AuthModal
        isOpen={showAuthModal}
        pendingStore={pendingClaimPlace}
        onClose={() => {
          setShowAuthModal(false);
          setPendingClaimPlace(null);
        }}
      />

      {/* Live Interactive Mobile Phone Simulator Drawer */}
      {showCustomerMobileSimulator && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 text-white rounded-[40px] p-3 shadow-2xl border-4 border-slate-700 max-w-md w-full max-h-[92vh] flex flex-col relative overflow-hidden">
            {/* Phone Top Notch */}
            <div className="flex items-center justify-between px-6 pt-2 pb-1 text-slate-400 text-xs shrink-0">
              <span className="font-semibold">9:41</span>
              <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto"></div>
              <button
                onClick={() => setShowCustomerMobileSimulator(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Close simulator"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inner Phone Screen */}
            <div className="flex-1 overflow-y-auto rounded-[32px] bg-slate-950">
              <CustomerReviewPortal
                store={currentStore}
                keywords={currentKeywords}
                onBackToDashboard={() => setShowCustomerMobileSimulator(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Demo Actions bar for convenience */}
      <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setShowCustomerMobileSimulator(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Simulate QR Scan</span>
        </button>

        <button
          onClick={() => setCurrentView('landing')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
        >
          <span>Landing View</span>
        </button>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
