import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Settings, LayoutDashboard, ShoppingBag, Heart } from 'lucide-react';
import { useAuth } from './AuthContext';
import { CurrencySelector } from './components/ui/CurrencySelector';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, isAdmin, signOut, loading, openAuthModal } = useAuth();

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <CurrencySelector />
      <div className="relative">
        {user ? (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="User" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {profile?.full_name ? String(profile.full_name).charAt(0).toUpperCase() : (user?.email ? String(user.email).charAt(0).toUpperCase() : 'U')}
              </span>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={openAuthModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-sm hover:shadow transition-all"
          >
            <User className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>
        )}

        {/* Dropdown Menu (only if logged in) */}
        {isOpen && user && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3.5 border-b border-gray-100 dark:border-gray-800">
              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email || 'User'}</p>
            </div>
            
            <div className="p-1.5 space-y-0.5">
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-black dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
              <Link to="/settings" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium">
                <Settings className="w-4 h-4" />
                <span>Profile & Settings</span>
              </Link>
              <Link to="/my-templates" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium">
                <ShoppingBag className="w-4 h-4" />
                <span>My Templates</span>
              </Link>
              <Link to="/wishlist" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium">
                <Heart className="w-4 h-4" />
                <span>Wishlist</span>
              </Link>
            </div>

            <div className="p-1.5 border-t border-gray-100 dark:border-gray-800">
              <button 
                type="button"
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
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
