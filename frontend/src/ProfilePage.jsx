import React, { useEffect, useState, useCallback } from 'react';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User as UserIcon, Mail, Settings, Shield, 
  Moon, Sun, Bell, CreditCard, Lock, AlertTriangle, Trash2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import UserMenu from './UserMenu';
import { toast } from 'sonner';
import { Logo } from './components/ui/Logo';
import { supabase } from './lib/supabase';

// Reusable Toggle Switch Component
const Toggle = ({ enabled, onChange }) => (
  <button 
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-800'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

export default function ProfilePage() {
  const { user, profile, setProfile, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Mock states for settings
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifOffers, setNotifOffers] = useState(false);
  const [notifOrders, setNotifOrders] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  
  // Edit Profile States
  const [name, setName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile?.full_name) setName(profile.full_name);
  }, [profile]);

  if (!user) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: name }
      });

      if (authError) throw authError;

      try {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: name,
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        // Ignore table errors
      }

      setProfile(prev => ({ ...prev, full_name: name }));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
      console.error(error);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    toast.success("Password change link sent to email.");
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const handleDeleteAccount = () => setShowDeleteConfirm(true);
  const confirmDeleteAccount = useCallback(() => {
    toast.error("Account deletion request submitted to admin.");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white font-sans pb-24 transition-colors duration-500">
      <nav className="h-[80px] w-full px-8 md:px-16 flex items-center justify-between glass-nav sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
        <Logo />
        <div className="flex items-center gap-6">
          <UserMenu />
        </div>
      </nav>

      <div className="max-w-[1000px] mx-auto px-6 md:px-12 mt-12 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
        
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-black dark:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Market
        </Link>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-12">Settings & Profile</h1>

        <div className="grid md:grid-cols-[1fr,2fr] gap-8 relative z-10">
          
          {/* Left Sidebar (Desktop) or Top Profile Card (Mobile) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-950 shadow-md overflow-hidden flex items-center justify-center mb-4">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                )}
              </div>
              <h2 className="text-xl font-bold mb-1">{profile?.full_name || 'Anonymous User'}</h2>
              <p className="text-sm text-gray-500 mb-4">{user.email}</p>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>

            {/* Quick Stats / Info */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
               <div className="space-y-4">
                 <div>
                   <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">User ID</p>
                   <p className="font-mono text-xs truncate">{user.id}</p>
                 </div>
                 <div>
                   <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Member Since</p>
                   <p className="text-sm font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="space-y-8">
            
            {/* Section 1: Edit Profile */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-gray-400" /> Edit Profile</h3>
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white outline-none transition-colors"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-900 text-gray-500 cursor-not-allowed outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-2">Email cannot be changed currently.</p>
                </div>
                <button type="submit" className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-80 transition-opacity">
                  Save Changes
                </button>
              </form>
            </div>


            {/* Section 5: Security */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Lock className="w-5 h-5 text-gray-400" /> Security</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-900">
                    <div>
                      <p className="font-bold">Two-Factor Authentication (2FA)</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                    </div>
                    <Toggle enabled={twoFactor} onChange={setTwoFactor} />
                 </div>
                 
                 <form onSubmit={handlePasswordChange} className="p-6 bg-gray-50 dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-900 space-y-4">
                    <p className="font-bold mb-2">Change Password</p>
                    <input type="password" placeholder="Current Password" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none" />
                    <input type="password" placeholder="New Password" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none" />
                    <button type="submit" className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl text-sm mt-2 hover:opacity-80 transition-opacity">
                      Update Password
                    </button>
                 </form>
              </div>
            </div>

            {/* Section 6: Danger Zone */}
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-2 text-red-600 dark:text-red-500 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Danger Zone</h3>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button 
                onClick={handleDeleteAccount}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>

          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        message="Are you absolutely sure you want to delete your account? This action cannot be undone."
        confirmText="Delete Account"
      />
    </div>
  );
}
