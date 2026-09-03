import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, User as UserIcon, Loader2, ArrowRight, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../AuthContext';

// Official Google Icon
const GoogleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export function AuthModal({ isOpen, onClose }) {
  const { signInWithGoogle, signIn, signUp, verifyOtp, resetPassword } = useAuth();
  
  const [view, setView] = useState('login'); // 'login' | 'signup' | 'verify' | 'forgot-password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      const timer = setTimeout(() => {
        setView('login');
        setEmail('');
        setPassword('');
        setFullName('');
        setOtp('');
        setShowPassword(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    try {
      const loggedInUser = await signInWithGoogle();
      if (loggedInUser) {
        onClose();
      }
    } catch (error) {
      console.warn("Google sign-in notice:", error.message);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoadingEmail(true);
    
    try {
      if (view === 'login') {
        const data = await signIn(email, password);
        if (data?.user && !data?.session) {
           setView('verify');
           toast.info("Please verify your email address.");
        } else {
           toast.success("Successfully logged in!");
           onClose();
        }
      } else if (view === 'signup') {
        const data = await signUp(email, password, fullName);
        if (data?.user && !data?.session) {
           setView('verify');
           toast.info("Please check your email for the verification code.");
        } else {
           toast.success("Account created successfully!");
           onClose();
        }
      } else if (view === 'verify') {
        await verifyOtp(email, otp);
        toast.success("Email verified successfully!");
        onClose();
      } else if (view === 'forgot-password') {
        await resetPassword(email);
        toast.success("Password reset link sent! Check your inbox.");
        setView('login');
      }
    } catch (error) {
      console.error("Auth Error:", error);
      toast.error(error?.message || "An unexpected error occurred");
    } finally {
      setLoadingEmail(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-[400px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-20"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 sm:p-7">
            {/* Header / Brand Icon */}
            <div className="text-center mb-6">
              <div className="mx-auto w-11 h-11 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-md mb-3">
                {view === 'verify' ? (
                  <KeyRound className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                {view === 'login' ? 'Welcome back' : view === 'signup' ? 'Create your account' : view === 'forgot-password' ? 'Reset password' : 'Check your inbox'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                {view === 'login'
                  ? 'Sign in to access your templates and downloads.'
                  : view === 'signup' 
                    ? 'Get instant access to digital templates and assets.'
                    : view === 'forgot-password'
                      ? 'Enter your email to receive a password reset link.'
                      : `We sent a 6-digit verification code to ${email || 'your email'}.`}
              </p>
            </div>

            {/* Google Social Button */}
            {view !== 'verify' && view !== 'forgot-password' && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loadingGoogle || loadingEmail}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  {loadingGoogle ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <>
                      <GoogleIcon className="w-4 h-4" />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Divider */}
            {view !== 'verify' && view !== 'forgot-password' && (
              <div className="relative flex py-2 items-center mb-4">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                <span className="flex-shrink mx-3 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  or with email
                </span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3.5"
                >
                  {view === 'verify' ? (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 text-center">
                        6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-850 focus:border-black dark:focus:border-white focus:ring-4 focus:ring-black/5 dark:focus:ring-white/10 outline-none transition-all text-center text-xl font-mono font-bold tracking-widest"
                        placeholder="123456"
                        maxLength={6}
                        autoFocus
                      />
                    </div>
                  ) : view === 'forgot-password' ? (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-850 focus:border-black dark:focus:border-white focus:ring-4 focus:ring-black/5 dark:focus:ring-white/10 outline-none transition-all"
                          placeholder="you@example.com"
                          autoFocus
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {view === 'signup' && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="block w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-850 focus:border-black dark:focus:border-white focus:ring-4 focus:ring-black/5 dark:focus:ring-white/10 outline-none transition-all"
                              placeholder="John Doe"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-850 focus:border-black dark:focus:border-white focus:ring-4 focus:ring-black/5 dark:focus:ring-white/10 outline-none transition-all"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Password
                          </label>
                          {view === 'login' && (
                            <button
                              type="button"
                              onClick={() => setView('forgot-password')}
                              className="text-xs text-black dark:text-white hover:underline font-medium"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-850 focus:border-black dark:focus:border-white focus:ring-4 focus:ring-black/5 dark:focus:ring-white/10 outline-none transition-all"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loadingGoogle || loadingEmail}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer"
              >
                {loadingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>
                      {view === 'login' ? 'Sign in' : view === 'signup' ? 'Create account' : view === 'forgot-password' ? 'Send reset link' : 'Verify code'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer View Switcher */}
            {view !== 'verify' && (
              <div className="mt-5 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {view === 'login' ? "Don't have an account? " : view === 'signup' ? "Already have an account? " : ""}
                  <button
                    type="button"
                    onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                    className="font-semibold text-black dark:text-white hover:underline ml-1 cursor-pointer"
                  >
                    {view === 'login' ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            )}
            
            {(view === 'verify' || view === 'forgot-password') && (
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white text-xs cursor-pointer"
                >
                  ← Back to login
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
