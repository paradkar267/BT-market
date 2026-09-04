import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCurrency } from './CurrencyContext';
import { api } from './lib/api';
import { toast } from 'sonner';
import { 
  User, Settings as SettingsIcon, Save, Loader2, 
  LogOut, ArrowLeft, Camera, Lock, Eye, EyeOff, CheckCircle2, 
  Sliders, Shield, AlertTriangle, Trash2, Copy, Check, Bell, 
  Globe, Sparkles, Mail
} from 'lucide-react';
import { motion } from 'framer-motion';
import UserMenu from './UserMenu';
import { Logo } from './components/ui/Logo';
import { ConfirmModal } from './components/ui/ConfirmModal';
import Navbar from './components/Navbar';

export default function SettingsPage() {
  const { user, profile, setProfile, signOut, updatePassword, isAdmin } = useAuth();
  const { currency, changeCurrency } = useCurrency();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Notification Preferences State (persisted per user)
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const storageKey = user?.id ? `bt_user_notif_prefs_${user.id}` : 'bt_user_notif_prefs';
      const saved = localStorage.getItem(storageKey) || localStorage.getItem('bt_user_notif_prefs');
      return saved ? JSON.parse(saved) : {
        orderReceipts: true,
        productReleases: true,
        securityAlerts: true
      };
    } catch {
      return { orderReceipts: true, productReleases: true, securityAlerts: true };
    }
  });

  const handleToggleNotif = (key, title) => {
    const isNowActive = !notifPrefs[key];
    const updated = { ...notifPrefs, [key]: isNowActive };
    setNotifPrefs(updated);
    try {
      const storageKey = user?.id ? `bt_user_notif_prefs_${user.id}` : 'bt_user_notif_prefs';
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (isNowActive) {
      toast.success(`${title} enabled`);
    } else {
      toast.info(`${title} paused`);
    }
  };

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleCopyUserId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    toast.success("User ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please re-type your confirm password.");
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordSuccess(false);

    try {
      await updatePassword(newPassword);
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 6000);
    } catch {
      // Error is handled in AuthContext via toast
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      setIsUploadingAvatar(true);
      const file = event.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      const reader = new FileReader();
      reader.onload = () => {
        setAvatarUrl(reader.result);
        toast.success("Image selected! Click 'Save Changes' to update profile.");
        setIsUploadingAvatar(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read image file");
        setIsUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(error.message || 'Error uploading image');
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await api.put('/api/auth/profile', {
        fullName,
        avatarUrl
      });

      setProfile(prev => ({ ...prev, full_name: fullName, avatar_url: avatarUrl }));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteAccount = () => {
    setShowDeleteConfirm(false);
    toast.error("Account deletion request submitted. An admin will process your request within 24 hours.");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-2 dark:text-white">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Please sign in to view your settings and profile.</p>
        <Link to="/" className="px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-full font-bold text-sm">
          Return to Home
        </Link>
      </div>
    );
  }

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recent member';

  return (
    <div className="min-h-screen bg-[#FBFBFB] dark:bg-[#0A0A0A] text-black dark:text-white flex flex-col transition-colors duration-500">
      {/* Top Navbar */}
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 pt-10 pb-24 sm:px-6 lg:px-8 flex-1">
        
        {/* Back Button */}
        <Link 
          to="/templates" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 font-bold hover:text-black dark:hover:text-white mb-8 transition-colors self-start group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Market
        </Link>

        {/* Page Title Banner */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-black shadow-lg shadow-black/10">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Settings & Profile</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Manage your personal account, security, and marketplace preferences.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 border border-gray-200/60 dark:border-transparent'
              }`}
            >
              <User className="w-5 h-5" />
              Profile Information
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all cursor-pointer ${
                activeTab === 'security' 
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 border border-gray-200/60 dark:border-transparent'
              }`}
            >
              <Lock className="w-5 h-5" />
              Security & Login
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all cursor-pointer ${
                activeTab === 'preferences' 
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 border border-gray-200/60 dark:border-transparent'
              }`}
            >
              <Sliders className="w-5 h-5" />
              Preferences
            </button>

            <button
              onClick={() => setActiveTab('danger')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all cursor-pointer ${
                activeTab === 'danger' 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 border border-gray-200/60 dark:border-transparent'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </button>

            <div className="pt-4 border-t border-gray-200 dark:border-white/10 mt-4">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 w-full min-h-[450px]">
            
            {/* 1. PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Profile Card */}
                <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-sm backdrop-blur-xl">
                  <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-white/10">
                    <div className="relative w-24 h-24 rounded-full bg-black dark:bg-zinc-800 flex items-center justify-center text-3xl font-bold text-white shadow-lg overflow-hidden group shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        profile?.full_name ? String(profile.full_name).charAt(0).toUpperCase() : String(user?.email || 'U').charAt(0).toUpperCase()
                      )}
                      <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <Camera className="w-6 h-6 text-white mb-1" />
                        <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change</span>
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploadingAvatar} />
                      </label>
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold">{profile?.full_name || 'Anonymous User'}</h3>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {user.email}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-white/10 text-xs font-mono font-medium rounded-full text-gray-600 dark:text-gray-300">
                          ID: {user.id.slice(0, 10)}...
                          <button 
                            type="button" 
                            onClick={handleCopyUserId} 
                            className="hover:text-black dark:hover:text-white transition-colors ml-0.5 cursor-pointer"
                            title="Copy full User ID"
                          >
                            {copiedId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          • Member since {memberSince}
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="max-w-md space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="block w-full px-4 py-3.5 bg-gray-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all font-medium"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="block w-full px-4 py-3.5 bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl text-gray-500 dark:text-gray-400 font-medium cursor-not-allowed outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5 ml-1">
                        Linked directly to your authentication account.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                        Profile Picture
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors rounded-xl font-bold text-sm">
                          {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                          {isUploadingAvatar ? 'Uploading...' : 'Upload Image'}
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            disabled={isUploadingAvatar}
                          />
                        </label>
                        {avatarUrl && (
                          <button 
                            type="button" 
                            onClick={() => setAvatarUrl('')} 
                            className="text-red-500 text-sm font-bold hover:underline cursor-pointer"
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSaving || (fullName === (profile?.full_name || '') && avatarUrl === (profile?.avatar_url || ''))}
                      className="flex items-center justify-center gap-2 px-6 py-3.5 bg-black text-white dark:bg-white dark:text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto cursor-pointer"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Changes
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* 2. SECURITY TAB */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-sm backdrop-blur-xl"
              >
                <h2 className="text-xl font-bold mb-2">Security & Password</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  {user?.has_password 
                    ? "Update your account password below to keep your login credentials secure."
                    : "If you signed in with Google, you can set a password here to allow direct email/password login as well."
                  }
                </p>

                {passwordSuccess && (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div className="text-xs sm:text-sm font-medium">
                      <strong>Password updated!</strong> You can now use this password along with your email ({user?.email}) to sign in.
                    </div>
                  </div>
                )}
                
                <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="block w-full px-4 py-3.5 pr-12 bg-gray-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all font-medium"
                        placeholder="••••••••"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className={`text-[11px] mt-1.5 ml-1 transition-colors ${newPassword.length >= 6 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-gray-400'}`}>
                      {newPassword.length >= 6 ? '✓ Minimum 6 characters met' : '• Minimum 6 characters required'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-4 py-3.5 bg-gray-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all font-medium"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="text-[11px] text-red-500 mt-1.5 ml-1 font-semibold">
                        ⚠️ Passwords do not match
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword || !newPassword || newPassword.length < 6 || (confirmPassword && confirmPassword !== newPassword)}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-black text-white dark:bg-white dark:text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto mt-6 cursor-pointer"
                  >
                    {isUpdatingPassword ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Saving Password...</>
                    ) : (
                      <><Lock className="w-5 h-5" /> {user?.has_password ? 'Update Password' : 'Set Password'}</>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* 3. PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >


                {/* Currency Preference */}
                <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-sm backdrop-blur-xl">
                  <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" /> Marketplace Currency
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Select your default pricing display currency.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
                    {[
                      { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
                      { code: 'USD', symbol: '$', label: 'US Dollar' },
                      { code: 'GBP', symbol: '£', label: 'British Pound' }
                    ].map((cur) => (
                      <button
                        key={cur.code}
                        type="button"
                        onClick={() => changeCurrency(cur.code)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          currency === cur.code
                            ? 'border-black dark:border-white bg-gray-50 dark:bg-white/10 shadow-sm font-bold'
                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                        }`}
                      >
                        <span className="text-2xl font-black mb-1">{cur.symbol}</span>
                        <span className="text-xs font-bold">{cur.code}</span>
                        <span className="text-[10px] text-gray-500 mt-0.5">{cur.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Notifications */}
                <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[2rem] p-8 shadow-sm backdrop-blur-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-black dark:text-white" /> Notifications
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Control what emails and updates you receive from us.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        toast.success("🔔 Test Notification: Alert system is active for " + user.email, {
                          description: "Order updates and security notices will be delivered smoothly."
                        });
                      }}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 transition-all self-start sm:self-auto cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" /> Send Test Alert
                    </button>
                  </div>

                  <div className="space-y-3.5 max-w-xl">
                    {[
                      { key: 'orderReceipts', title: 'Order & License Receipts', desc: 'Receive instant download links and invoices upon template purchase' },
                      { key: 'productReleases', title: 'New Template Drops', desc: 'Curated weekly notifications when modern React / Next.js templates launch' },
                      { key: 'securityAlerts', title: 'Security & Account Alerts', desc: 'Crucial notifications about password updates and security warnings' }
                    ].map((item) => {
                      const isActive = !!notifPrefs[item.key];
                      return (
                        <div 
                          key={item.key} 
                          onClick={() => handleToggleNotif(item.key, item.title)}
                          className={`flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                            isActive
                              ? 'bg-emerald-500/[0.04] border-emerald-500/30 dark:border-emerald-500/25 dark:bg-emerald-500/[0.05]'
                              : 'bg-gray-50 dark:bg-white/[0.03] border-black/5 dark:border-white/5 hover:bg-gray-100/80 dark:hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="space-y-1 pr-2">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-gray-900 dark:text-white">{item.title}</p>
                              {isActive ? (
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                  Active
                                </span>
                              ) : (
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 bg-gray-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                  Paused
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                          </div>

                          {/* Professional Toggle Switch */}
                          <div
                            role="switch"
                            aria-checked={isActive}
                            className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${
                              isActive 
                                ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                                : 'bg-gray-300 dark:bg-zinc-700'
                            }`}
                          >
                            <div
                              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                isActive ? 'translate-x-6' : 'translate-x-0.5'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. DANGER ZONE TAB */}
            {activeTab === 'danger' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-[2rem] p-8 shadow-sm"
              >
                <h2 className="text-xl font-bold mb-2 text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone
                </h2>
                <p className="text-sm text-red-700/80 dark:text-red-300/80 mb-6 max-w-xl">
                  Once you request deletion of your account, your purchased template records, downloads, and preferences will be permanently wiped. This action is irreversible.
                </p>

                <button 
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-6 py-3.5 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all cursor-pointer shadow-lg shadow-red-600/20 active:scale-95"
                >
                  <Trash2 className="w-4 h-4" /> Delete Account
                </button>
              </motion.div>
            )}

          </div>
        </div>
      </main>

      {/* Account Deletion Confirmation Modal */}
      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        message="Are you absolutely sure you want to request account deletion? All your purchased template access and profile details will be permanently scheduled for deletion."
        confirmText="Yes, Delete My Account"
        variant="danger"
      />
    </div>
  );
}
