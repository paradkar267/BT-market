import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { AuthModal } from './components/ui/AuthModal';
import { toast } from 'sonner';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pendingActionRef = React.useRef(null);

  const handleUserSession = async (currentSession) => {
    setSession(currentSession || null);
    const currentUser = currentSession?.user || null;
    if (!currentUser) {
      setUser(null);
      setProfile(null);
      return;
    }
    setUser(currentUser);
    
    const rawFullName = currentUser?.user_metadata?.full_name;
    const cleanFullName = typeof rawFullName === 'object' && rawFullName !== null ? rawFullName.full_name : rawFullName;

    const authProfile = {
      full_name: cleanFullName || currentUser?.email?.split('@')[0],
      avatar_url: currentUser?.user_metadata?.avatar_url
    };
    setProfile(prev => ({ ...prev, ...authProfile }));

    if (pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      action();
    }

    // Try fetching from profiles table
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
      if (!error && data) {
        setProfile(prev => ({ ...prev, ...data, ...authProfile }));
      }
    } catch {
      // Ignore if table doesn't exist
    }
  };

  // Authentication Setup & Listeners
  useEffect(() => {
    let subscription;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        await handleUserSession(initialSession);
      } catch (err) {
        console.error('Session Error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setProfile(null);
      } else if (currentSession) {
        handleUserSession(currentSession);
      }
    });
    
    subscription = data.subscription;
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Modal Actions
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    pendingActionRef.current = null;
  };

  const requireAuth = (action) => {
    if (user) {
      action();
    } else {
      pendingActionRef.current = action;
      openAuthModal();
    }
  };

  // Auth Operations
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to sign in with Google");
      throw error;
    }
  };

  const signInWithGithub = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to sign in with GitHub");
      throw error;
    }
  };

  const signInWithFigma = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'figma',
        options: {
          scopes: 'file_metadata:read file_content:read',
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to sign in with Figma");
      throw error;
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      }
    });
    if (error) throw error;
    return data;
  };

  const verifyOtp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });
    if (error) throw error;
    return data;
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to send reset link");
      throw error;
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return data;
    } catch (error) {
      toast.error(error.message || "Failed to update password");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Successfully logged out");
      window.location.href = '/';
    } catch (err) {
      toast.error(err.message || "Failed to log out");
    }
  };

  const isAdmin = user?.email?.toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase() || 'bizleap1@gmail.com');

  return (
    <AuthContext.Provider value={{ user, session, profile, setProfile, isAdmin, loading, signInWithGoogle, signInWithGithub, signInWithFigma, signIn, signUp, verifyOtp, resetPassword, updatePassword, signOut, openAuthModal, closeAuthModal, requireAuth }}>
      {children}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
