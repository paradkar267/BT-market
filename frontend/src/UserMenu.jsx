import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Settings, LayoutDashboard, ShoppingBag, Heart, ChevronDown } from 'lucide-react';
import { useAuth } from './AuthContext';
import { CurrencySelector } from './components/ui/CurrencySelector';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, profile, isAdmin, signOut, loading, openAuthModal } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-9 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        <div className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" ref={menuRef}>
      <CurrencySelector />
      <div className="relative">
        {user ? (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 p-0.5 rounded-xl border border-neutral-200/80 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-all cursor-pointer select-none group"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="User avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold">
                  {profile?.full_name ? String(profile.full_name).charAt(0).toUpperCase() : (user?.email ? String(user.email).charAt(0).toUpperCase() : 'U')}
                </span>
              )}
            </div>
            <ChevronDown className={`w-3 h-3 text-neutral-400 group-hover:text-black dark:group-hover:text-white mr-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          <button
            type="button"
            onClick={openAuthModal}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100 text-xs font-semibold shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer select-none"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {/* Dropdown Menu (only if logged in) */}
        {isOpen && user && (
          <div className="absolute right-0 mt-2.5 w-60 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
              <p className="font-semibold text-xs text-black dark:text-white truncate">{profile?.full_name || 'User Account'}</p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">{user.email || ''}</p>
            </div>
            
            <div className="p-1.5 space-y-0.5">
              {isAdmin && (
                <Link 
                  to="/admin" 
                  onClick={() => setIsOpen(false)} 
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-black dark:text-white font-bold hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <Link 
                to="/my-templates" 
                onClick={() => setIsOpen(false)} 
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition-colors font-medium"
              >
                <ShoppingBag className="w-4 h-4 text-neutral-400" />
                <span>My Purchased Templates</span>
              </Link>
              <Link 
                to="/wishlist" 
                onClick={() => setIsOpen(false)} 
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition-colors font-medium"
              >
                <Heart className="w-4 h-4 text-neutral-400" />
                <span>Wishlist</span>
              </Link>
              <Link 
                to="/settings" 
                onClick={() => setIsOpen(false)} 
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition-colors font-medium"
              >
                <Settings className="w-4 h-4 text-neutral-400" />
                <span>Account Settings</span>
              </Link>
            </div>

            <div className="p-1.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
              <button 
                type="button"
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors font-medium cursor-pointer"
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
