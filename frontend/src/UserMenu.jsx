import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Settings, LayoutDashboard, ShoppingBag, Activity, Heart } from 'lucide-react';
import { useAuth } from './AuthContext';
import { CurrencySelector } from './components/ui/CurrencySelector';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, isAdmin, signOut, loading, openAuthModal } = useAuth();

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <CurrencySelector />
      <div className="relative">
        {user ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-black/5 dark:border-white/5 hover:scale-105 transition-transform"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="User" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {profile?.full_name ? String(profile.full_name).charAt(0).toUpperCase() : (user?.email ? String(user.email).charAt(0).toUpperCase() : 'U')}
              </span>
            )}
          </button>
        ) : (
          <button
            onClick={openAuthModal}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:scale-105 transition-transform text-sm font-semibold"
          >
            <User className="w-4 h-4" />
            <span>Login</span>
          </button>
        )}

        {/* Dropdown Menu (only if logged in) */}
        {isOpen && user && (
          <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-black/80 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-black/5 dark:border-white/5">
              <p className="font-semibold text-black dark:text-white truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email || 'User'}</p>
            </div>
            
            <div className="p-2 space-y-1">
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Admin Panel & Analytics</span>
                </Link>
              )}
              <Link to="/profile" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white rounded-xl transition-colors">
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
              <Link to="/my-templates" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white rounded-xl transition-colors">
                <ShoppingBag className="w-4 h-4" />
                <span>My Templates</span>
              </Link>
              <Link to="/wishlist" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white rounded-xl transition-colors">
                <Heart className="w-4 h-4" />
                <span>Wishlist</span>
              </Link>
              <Link to="/settings" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white rounded-xl transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </div>

            <div className="p-2 border-t border-black/5 dark:border-white/5">
              <button 
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
