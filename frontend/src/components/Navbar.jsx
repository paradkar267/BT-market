import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, ShoppingCart, Menu, X, Home, LayoutTemplate, 
  MessageSquare, Sparkles, Layers, LayoutGrid,
  Info, ArrowRight, Gift, Crown, TrendingUp
} from 'lucide-react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { Logo } from './ui/Logo';
import { CenterNav } from './ui/CenterNav';
import UserMenu from '../UserMenu';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartItems } = useCart();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  const categories = [
    { name: "Business", tag: "Business" },
    { name: "SaaS", tag: "SaaS" },
    { name: "E-commerce", tag: "E-Commerce" },
    { name: "Portfolio", tag: "Portfolio" },
    { name: "Agency", tag: "Agency" },
    { name: "Landing Page", tag: "Landing Page" },
    { name: "Admin Dashboard", tag: "Dashboard" },
    { name: "CRM / Software", tag: "CRM" },
    { name: "Other", tag: "Other" }
  ];

  const templateCurations = [
    { name: "All Templates", url: "/templates", icon: LayoutTemplate },
    { name: "Latest", url: "/templates?sort=newest", icon: Sparkles },
    { name: "Popular", url: "/templates?sort=popular", icon: TrendingUp },
    { name: "Free Kits", url: "/templates?price=free", icon: Gift },
    { name: "Premium Pro", url: "/templates?price=premium", icon: Crown }
  ];

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/85 dark:bg-black/85 backdrop-blur-xl border-b border-neutral-200/80 dark:border-neutral-800 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] transition-all duration-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <Logo />
        </div>

        {/* Center: Desktop Navigation Capsule (Home, Templates, Categories, About Us, Contact) */}
        <CenterNav />

        {/* Right: Unified Controls Cluster */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Trigger (⌘K) */}
          <button
            type="button"
            onClick={openSearch}
            className="hidden sm:inline-flex items-center justify-between gap-2 h-9 w-32 lg:w-40 px-3 text-xs text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white bg-neutral-100/80 hover:bg-neutral-100 dark:bg-neutral-900/80 dark:hover:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 rounded-xl transition-all duration-150 cursor-pointer group select-none shadow-xs"
            title="Search templates (⌘K)"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors shrink-0" />
              <span className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400 truncate">Search...</span>
            </div>
            <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 rounded shadow-2xs shrink-0">
              ⌘K
            </kbd>
          </button>

          {/* Mobile Search Icon */}
          <button
            type="button"
            onClick={openSearch}
            className="sm:hidden flex items-center justify-center w-9 h-9 text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white bg-neutral-100/70 hover:bg-neutral-100 dark:bg-neutral-900/70 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Open search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Shopping Cart Button */}
          <button
            type="button"
            onClick={() => requireAuth(() => navigate('/cart'))}
            className="relative flex items-center justify-center w-9 h-9 text-neutral-700 hover:text-black dark:text-neutral-200 dark:hover:text-white bg-neutral-100/70 hover:bg-neutral-100 dark:bg-neutral-900/70 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 rounded-xl transition-all duration-150 cursor-pointer select-none group"
            title="Shopping Cart"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4 text-neutral-600 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-black text-white dark:bg-white dark:text-black font-black text-[10px] flex items-center justify-center rounded-full shadow-xs ring-2 ring-white dark:ring-black animate-in zoom-in">
                {cartItems.length}
              </span>
            )}
          </button>

          {/* Currency + User Menu Dropdown */}
          <UserMenu />

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 text-neutral-700 hover:text-black dark:text-neutral-200 dark:hover:text-white bg-neutral-100/70 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800 rounded-xl transition-colors cursor-pointer select-none"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-4 py-4 space-y-4">
            {/* Quick Search in Mobile Menu */}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openSearch();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl text-xs font-medium text-neutral-500 dark:text-neutral-400"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-neutral-400" />
                <span>Search templates, stacks, tags...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-400">⌘K</kbd>
            </button>

            {/* Primary Nav Links Grid */}
            <div className="grid grid-cols-4 gap-2">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  location.pathname === '/'
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold'
                    : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium'
                }`}
              >
                <Home className="w-4 h-4 mb-1" />
                <span className="text-[11px]">Home</span>
              </Link>

              <Link
                to="/templates"
                onClick={() => setMobileOpen(false)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  location.pathname === '/templates'
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold'
                    : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium'
                }`}
              >
                <LayoutTemplate className="w-4 h-4 mb-1" />
                <span className="text-[11px]">Templates</span>
              </Link>

              <Link
                to="/about"
                onClick={() => setMobileOpen(false)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  location.pathname === '/about'
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold'
                    : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium'
                }`}
              >
                <Info className="w-4 h-4 mb-1" />
                <span className="text-[11px]">About</span>
              </Link>

              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  location.pathname === '/contact'
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold'
                    : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium'
                }`}
              >
                <MessageSquare className="w-4 h-4 mb-1" />
                <span className="text-[11px]">Contact</span>
              </Link>
            </div>

            {/* Templates Quick Curations */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-850">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3 h-3 text-black dark:text-white" />
                Explore Curations
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {templateCurations.map((cur) => {
                  const Icon = cur.icon;
                  return (
                    <Link
                      key={cur.name}
                      to={cur.url}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-850 border border-neutral-200/70 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                      <span className="truncate">{cur.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 9 Categories in Mobile */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-850">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutGrid className="w-3 h-3 text-black dark:text-white" />
                  Categories
                </span>
                <Link 
                  to="/templates" 
                  onClick={() => setMobileOpen(false)}
                  className="text-[11px] font-semibold text-black dark:text-white hover:underline"
                >
                  View All →
                </Link>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      if (cat.name === "Other") navigate('/templates');
                      else navigate(`/templates?tag=${encodeURIComponent(cat.tag)}`);
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Bottom CTA */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-850">
              <Link
                to="/templates"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Browse All Templates</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
