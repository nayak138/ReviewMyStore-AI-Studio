import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authModalOpen: boolean;
  openAuthModal: (pendingStore?: any) => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  pendingClaimStore: any | null;
  setPendingClaimStore: (store: any | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'reviewmystore_auth_user';
const SESSION_KEY = 'reviewmystore_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [session, setSession] = useState<Session | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [pendingClaimStore, setPendingClaimStore] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user && mounted) {
              setUser(userData.user);
              setSession(data.session);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(userData.user));
              localStorage.setItem(SESSION_KEY, JSON.stringify(data.session));
            }
          }

          const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
            if (!mounted) return;
            if (event === 'SIGNED_IN' && currentSession?.user) {
              setUser(currentSession.user);
              setSession(currentSession);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSession.user));
              localStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setSession(null);
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem(SESSION_KEY);
            }
          });

          return () => {
            authListener?.subscription?.unsubscribe();
          };
        }
      } catch (err) {
        console.warn('Auth init check:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const openAuthModal = (pendingStore?: any) => {
    if (pendingStore) setPendingClaimStore(pendingStore);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      }
      return { success: false, error: 'Supabase authentication client not ready.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to initialize Google login.' };
    }
  };

  const signOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signOut,
        pendingClaimStore,
        setPendingClaimStore
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
