import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, AlertCircle, Loader2, Store, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  pendingStore?: any;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, pendingStore }) => {
  const {
    authModalOpen,
    closeAuthModal,
    signInWithGoogle,
    pendingClaimStore: contextClaimStore
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeClaimStore = pendingStore || contextClaimStore;
  const isVisible = isOpen !== undefined ? isOpen : authModalOpen;

  if (!isVisible) return null;

  const handleClose = () => {
    if (onClose) onClose();
    closeAuthModal();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const res = await signInWithGoogle();
    if (!res.success) {
      setIsLoading(false);
      setError(res.error || 'Google authentication failed. Please try again.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-white"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo size="lg" />
          <h2 className="text-2xl font-bold mt-4 tracking-tight text-white">
            Sign in with Google
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Instant 1-click access to manage your business reviews, QR stands, and AI replies.
          </p>
        </div>

        {/* Claim Store Preview Banner */}
        {activeClaimStore && (
          <div className="mb-5 p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Ready to Claim</div>
              <div className="text-sm font-medium text-white truncate">{activeClaimStore.name}</div>
              <div className="text-xs text-slate-400 truncate">{activeClaimStore.locality || activeClaimStore.address}</div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl flex items-center gap-2.5 text-xs text-red-200"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Google 1-Click Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-60"
            id="google-signin-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
                <span>Connecting Google...</span>
              </>
            ) : (
              <>
                {/* Official Google G SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Value Props */}
          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant secure SSO authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Secure access to manage your ReviewMyStore workspace</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
