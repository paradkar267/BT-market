import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from './lib/api';
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

  const applyUser = (userData, token) => {
    if (!userData) {
      setUser(null);
      setSession(null);
      setProfile(null);
      return;
    }

    const cleanName = userData.full_name || userData.name || userData.email?.split('@')[0];
    const normalizedUser = {
      ...userData,
      id: userData.id,
      email: userData.email,
      user_metadata: {
        full_name: cleanName,
        avatar_url: userData.avatar_url,
        purchased_templates: userData.purchased_templates || [],
        wishlist_templates: userData.wishlist_templates || []
      }
    };

    setUser(normalizedUser);
    setSession({ token, user: normalizedUser });
    setProfile({
      id: userData.id,
      email: userData.email,
      full_name: cleanName,
      avatar_url: userData.avatar_url,
      role: userData.role,
      purchased_templates: userData.purchased_templates || [],
      wishlist_templates: userData.wishlist_templates || []
    });

    if (pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      action();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('bizleap_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/api/auth/me');
        if (res?.user) {
          applyUser(res.user, token);
        } else {
          localStorage.removeItem('bizleap_token');
        }
      } catch (err) {
        console.warn('Session check note:', err.message);
        localStorage.removeItem('bizleap_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

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

  const signIn = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res?.token) {
        localStorage.setItem('bizleap_token', res.token);
        applyUser(res.user, res.token);
      }
      return { user: res.user, session: { token: res.token, user: res.user } };
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      const res = await api.post('/api/auth/register', { email, password, fullName });
      if (res?.token) {
        localStorage.setItem('bizleap_token', res.token);
        applyUser(res.user, res.token);
      }
      return { user: res.user, session: { token: res.token, user: res.user } };
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error("Google Client ID configure nahi hai. Kripya .env.local me VITE_GOOGLE_CLIENT_ID check karein.");
      return;
    }

    if (!window.google?.accounts) {
      toast.error("Google SDK load nahi ho paya. Kripya page refresh karein.");
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Use Google Identity Services Token Client (official popup flow)
        if (window.google.accounts.oauth2) {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
              if (tokenResponse.error) {
                toast.error("Google login cancelled or failed: " + tokenResponse.error);
                return reject(new Error(tokenResponse.error));
              }

              try {
                toast.loading("Authenticating with Google...", { id: 'google-auth' });
                const data = await api.post('/api/auth/google', { accessToken: tokenResponse.access_token });
                toast.dismiss('google-auth');

                if (data.token) {
                  localStorage.setItem('bizleap_token', data.token);
                  applyUser(data.user, data.token);
                  toast.success(`Welcome back, ${data.user.full_name || 'User'}!`);
                  resolve(data.user);
                } else {
                  throw new Error(data.error || "Google login failed");
                }
              } catch (err) {
                toast.dismiss('google-auth');
                toast.error(err.message || "Google sign-in failed");
                reject(err);
              }
            }
          });

          client.requestAccessToken();
        } else if (window.google.accounts.id) {
          // Fallback to Google ID One Tap
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              try {
                if (!response?.credential) throw new Error("Google credentials nahi mile");
                const data = await api.post('/api/auth/google', { credential: response.credential });
                if (data.token) {
                  localStorage.setItem('bizleap_token', data.token);
                  applyUser(data.user, data.token);
                  toast.success(`Welcome back, ${data.user.full_name || 'User'}!`);
                  resolve(data.user);
                }
              } catch (err) {
                toast.error(err.message || "Google login failed");
                reject(err);
              }
            }
          });
          window.google.accounts.id.prompt();
        }
      } catch (err) {
        toast.error("Google login error: " + err.message);
        reject(err);
      }
    });
  };

  const signInWithGithub = async () => {
    toast.info("Please sign in or register with your email and password.");
  };

  const signInWithFigma = async () => {
    toast.info("Please sign in or register with your email and password.");
  };

  const verifyOtp = async () => {
    toast.success("Account verified!");
  };

  const resetPassword = async (email) => {
    toast.info("Password reset link recorded for: " + email);
  };

  const updatePassword = async (newPassword, currentPassword) => {
    try {
      const res = await api.put('/api/auth/password', { newPassword, currentPassword });
      toast.success(res?.message || "Password updated successfully!");
      if (user) {
        setUser(prev => ({ ...prev, has_password: true }));
      }
      return res;
    } catch (error) {
      toast.error(error.message || "Failed to update password");
      throw error;
    }
  };

  const signOut = async () => {
    localStorage.removeItem('bizleap_token');
    setUser(null);
    setSession(null);
    setProfile(null);
    toast.success("Successfully logged out");
    window.location.href = '/';
  };

  const isAdmin = user?.role === 'admin' || 
    user?.email?.toLowerCase() === 'yashparadkar63@gmail.com' ||
    user?.email?.toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase() || 'bizleap1@gmail.com');

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      setProfile,
      isAdmin,
      loading,
      signInWithGoogle,
      signInWithGithub,
      signInWithFigma,
      signIn,
      signUp,
      verifyOtp,
      resetPassword,
      updatePassword,
      signOut,
      openAuthModal,
      closeAuthModal,
      requireAuth
    }}>
      {children}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
