import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, ShoppingCart, Check, ShieldCheck, Zap, Search, Heart, Eye,
  ExternalLink, Sparkles, CheckCircle2, Lock, Laptop, Layers, FileCode2,
  DownloadCloud, Share2, BadgeCheck, Clock, ArrowRight
} from 'lucide-react';
import { useTemplates } from './useTemplates';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';
import { useCurrency } from './CurrencyContext';
import { ReviewsSection } from './ReviewsSection';
import UserMenu from './UserMenu';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { ProductSkeleton } from './components/ui/Skeleton';
import { InteractiveProductCard } from './components/ui/card-7';
import { FAQSection } from './components/ui/FAQSection';
import { Footerdemo } from '@/components/ui/footer-section';
import Navbar from './components/Navbar';
import { Logo } from './components/ui/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from './components/SEO';
import { toast } from 'sonner';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, purchasedTemplates } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { templates, loading } = useTemplates();
  const { requireAuth } = useAuth();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tech' | 'pages' | 'license'

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors duration-500">
        <Navbar />
        <ProductSkeleton />
      </div>
    );
  }

  let template = templates.find(t => String(t.id) === String(id));
  if (template) {
    template = { ...template, is_sold_out: false };
  }

  const inCart = template ? cartItems.some(item => String(item.id) === String(template.id)) : false;
  const isOwned = template ? purchasedTemplates?.some(item => String(item.id) === String(template.id)) : false;
  const similarTemplates = template ? templates.filter(t => t.category === template.category && String(t.id) !== String(template.id)).slice(0, 3) : [];

  if (!template) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-transparent text-white' : 'bg-white dark:bg-black text-black dark:text-white'}`}>
        <div className="text-center flex flex-col items-center">
          <h1 className="text-4xl font-black mb-4">Template Not Found</h1>
          <p className="text-gray-500 mb-6">The requested template could not be located in our catalog.</p>
          <Link to="/templates" className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black font-bold rounded-xl">
            Browse All Templates
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: template.title,
        text: `Check out ${template.title} on BizLeap Market!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'bg-[#090A0F] text-white' : 'bg-gray-50/70 text-black'}`}>
      <SEO 
        title={`${template.title} - Premium Template`}
        description={template.description}
        keywords={template.keywords?.join(', ')}
        image={template.image}
        url={`/product/${template.id}`}
        product={template}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Templates', url: '/templates' },
          { name: template.title, url: `/product/${template.id}` }
        ]}
      />

      {/* Unified Global Navbar */}
      <Navbar />

      {/* Main Page Container */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 pt-8 pb-20 relative">
        {/* Ambient Background Monochrome */}
        <div className="absolute top-10 right-1/4 w-[500px] h-[350px] bg-black/[0.02] dark:bg-white/[0.02] blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-60 left-10 w-[450px] h-[300px] bg-black/[0.01] dark:bg-white/[0.01] blur-[100px] pointer-events-none rounded-full" />

        <div className="relative z-10">
          {/* Breadcrumb & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-black/[0.05] dark:border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">
              <Link to="/templates" className="inline-flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Market
              </Link>
              <span>/</span>
              <Link to={`/templates?category=${template.category}`} className="hover:text-black dark:hover:text-white transition-colors">
                {template.category}
              </Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-bold truncate max-w-[200px] sm:max-w-xs">{template.title}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 transition-all cursor-pointer shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Main Showcase & Specifications (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Product Header (Title & Short Bio) */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950 dark:text-white font-display mb-4">
                  {template.title}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-normal leading-relaxed">
                  {template.headline || "A state-of-the-art web application template designed for maximum conversion and speed."}
                </p>
              </div>

              {/* macOS Browser Mockup Frame with Live Interactive View */}
              <div className="group relative rounded-[2rem] bg-gray-100 dark:bg-[#11121C] border border-black/[0.08] dark:border-white/10 overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                {/* Browser Top Navigation Bar */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.06] dark:border-white/10 bg-white/80 dark:bg-white/[0.02] backdrop-blur-md">
                  {/* Traffic Light Dots */}
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400/80 border border-red-500/20 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400/80 border border-yellow-500/20 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-green-400/80 border border-green-500/20 inline-block" />
                  </div>

                  {/* Browser URL Pill */}
                  <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-white dark:bg-black/40 border border-black/5 dark:border-white/10 text-xs text-gray-400 font-mono tracking-tight max-w-sm truncate">
                    <Lock className="w-3 h-3 text-emerald-500" />
                    <span>btmarket.com/preview/{template.id}</span>
                  </div>

                  {/* Quick Preview Link */}
                  <Link
                    to={`/preview/${template.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-black dark:text-white hover:underline"
                  >
                    <span>Full Screen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Screenshot Image Frame */}
                <div className="relative aspect-[16/10] sm:aspect-video w-full overflow-hidden bg-gray-100 dark:bg-black/40">
                  <img 
                    src={template.image} 
                    alt={template.title} 
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  
                  {/* Fallback state */}
                  <div className="absolute inset-0 hidden items-center justify-center bg-gray-100 dark:bg-gray-800/50 backdrop-blur-sm">
                    <span className="text-gray-400 font-medium">Template Screenshot Preview</span>
                  </div>

                  {/* Hover Floating Live Preview Pill Button */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                    <Link
                      to={`/preview/${template.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-gray-950 font-black text-base shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                    >
                      <Eye className="w-5 h-5 text-black" />
                      <span>Launch Live Preview</span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Tabbed Details & Specifications */}
              <div className="bg-white dark:bg-[#11121C] border border-black/[0.06] dark:border-white/10 rounded-[2rem] p-6 sm:p-10 shadow-sm">
                {/* Segmented Tab Navigation Bar */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 dark:bg-white/[0.04] rounded-2xl mb-8 border border-black/[0.04] dark:border-white/5">
                  {[
                    { key: 'overview', label: 'Overview & Highlights', icon: Sparkles },
                    { key: 'tech', label: 'Tech Stack & Specs', icon: FileCode2 },
                    { key: 'pages', label: `Included Pages (${template.pages_included?.length || 4})`, icon: Layers },
                    { key: 'license', label: 'Commercial License', icon: ShieldCheck },
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white dark:bg-zinc-800 text-gray-950 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-black dark:text-white' : ''}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content 1: Overview */}
                {activeTab === 'overview' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-8">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">Product Overview</h3>
                      <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                        {template.description || "A clean, modern, and production-ready React & Tailwind CSS web template crafted for developers, agencies, and high-growth businesses."}
                      </p>
                    </div>

                    {/* 4 Feature Bento Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-gray-100 dark:bg-white/[0.04] border border-black/5 dark:border-white/10">
                        <div className="flex items-center gap-2.5 text-black dark:text-white font-black text-sm mb-1.5">
                          <Zap className="w-4 h-4" /> 99+ Lighthouse Score
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          Clean semantic code, zero unnecessary script overhead, and blazing fast Core Web Vitals.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-black text-sm mb-1.5">
                          <Laptop className="w-4 h-4" /> 100% Fully Responsive
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          Meticulously tested across all mobile smartphones, tablets, laptops, and ultra-wide screens.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-gray-100 dark:bg-white/[0.04] border border-black/5 dark:border-white/10">
                        <div className="flex items-center gap-2.5 text-black dark:text-white font-black text-sm mb-1.5">
                          <Layers className="w-4 h-4" /> Modular Architecture
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          Organized reusable components with clean props, making customization and additions effortless.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-gray-100 dark:bg-white/[0.04] border border-black/5 dark:border-white/10">
                        <div className="flex items-center gap-2.5 text-black dark:text-white font-black text-sm mb-1.5">
                          <DownloadCloud className="w-4 h-4" /> Turnkey Production Ready
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          Pre-configured with modern tooling (Vite/Next.js) — run npm install and deploy immediately.
                        </p>
                      </div>
                    </div>

                    {/* Key Features List */}
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Included Features</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(template.key_features && template.key_features.length > 0 ? template.key_features : [
                          'Fully responsive modern layout',
                          'Light & Dark mode ready styling',
                          'Interactive animated components',
                          'Clean SEO semantic structure',
                          'Reusable design system tokens',
                          'High-converting CTA and lead forms'
                        ]).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ideal For Tags */}
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Ideal For</h4>
                      <div className="flex flex-wrap gap-2">
                        {(template.ideal_for && template.ideal_for.length > 0 ? template.ideal_for : ['SaaS Startups', 'Modern Agencies', 'Web Developers', 'E-Commerce Portals', 'Portfolio Showcase']).map((item, idx) => (
                          <span key={idx} className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-black/5 dark:border-white/5">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Tab Content 2: Tech Stack */}
                {activeTab === 'tech' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Technology & Architecture</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Built with an industry-standard stack for maximum performance, maintainability, and clean customization.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { title: 'Core Framework', val: 'React 18+ (Hooks & Modern ES6+)' },
                        { title: 'Styling Engine', val: 'Tailwind CSS with custom design tokens' },
                        { title: 'Build Tooling', val: 'Vite / Next.js for blazing HMR' },
                        { title: 'Icon Library', val: 'Lucide React (featherweight SVG icons)' },
                        { title: 'Animation Engine', val: 'Framer Motion & CSS hardware acceleration' },
                        { title: 'Code Quality', val: 'Clean, unminified, well-commented source' },
                      ].map((spec, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                          <span className="text-[11px] uppercase font-bold text-gray-400 block mb-1">{spec.title}</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{spec.val}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Tab Content 3: Included Pages */}
                {activeTab === 'pages' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Pages & Screens Included</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Every template includes fully styled pages and functional state ready to deploy.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {(template.pages_included && template.pages_included.length > 0 ? template.pages_included : [
                        'Homepage / Landing',
                        'Features & Product Grid',
                        'Pricing & Tiers Matrix',
                        'FAQ & Contact Support',
                        'Auth / Login / Signup',
                        'Dashboard / Overview'
                      ]).map((page, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-sm font-bold text-gray-800 dark:text-gray-200">
                          <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                          <span>{page}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Tab Content 4: Commercial License */}
                {activeTab === 'license' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Commercial License Agreement</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        All templates from BizLeap Market include full commercial deployment rights with zero recurring fees.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { title: 'Unlimited Client Sites', desc: 'Use this template to build projects for as many clients as you want.' },
                        { title: '100% Royalty Free', desc: 'Keep 100% of your earnings. Never pay royalties or subscription fees.' },
                        { title: 'Full Source Ownership', desc: 'Modify, customize, and extend every file, style, and component freely.' },
                        { title: 'Lifetime Re-downloads', desc: 'Access your download links anytime from your BizLeap customer dashboard.' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3.5 p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 text-sm">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{item.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Elevated Checkout Card (4 Cols - Sticky) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
              <div className="relative rounded-[2.2rem] bg-white dark:bg-[#11121C] border border-black/[0.08] dark:border-white/10 p-7 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
                {/* Ambient Top Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-black/5 dark:bg-white/5 blur-2xl pointer-events-none rounded-full" />

                <div className="relative z-10 space-y-6">
                  {/* Category & Verified Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-full bg-black text-white dark:bg-white dark:text-black">
                        {template.category}
                      </span>
                      {template.tag && (
                        <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                          {template.tag}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                      <BadgeCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>

                  {/* Title & Creator */}
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight font-display mb-2">
                      {template.title}
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      by <span className="font-bold text-gray-900 dark:text-white">{template.author || 'BizLeap Studio'}</span>
                    </p>
                  </div>

                  {/* Price Block with Value Comparison */}
                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">One-Time License</span>
                      <div className="flex items-center gap-1 text-black dark:text-white text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{template.rating || '4.9'}</span>
                        <span className="text-gray-400 font-normal">({template.sales || 42} sales)</span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight font-display">
                        {formatPrice(template.price)}
                      </span>
                      {template.price && (
                        <span className="text-sm font-bold text-gray-400 line-through">
                          {formatPrice(Math.round(template.price * 1.35))}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Includes Commercial License & Lifetime Updates
                    </p>
                  </div>

                  {/* Primary CTA Buttons */}
                  <div className="space-y-3">
                    {/* Primary Buy Now Button */}
                    <button 
                      onClick={() => {
                        if (isOwned) return;
                        requireAuth(() => {
                          if (!inCart) addToCart(template);
                          navigate('/cart');
                        });
                      }}
                      disabled={isOwned}
                      className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${
                        isOwned
                          ? 'bg-gray-200 dark:bg-white/10 text-gray-500 cursor-not-allowed'
                          : 'bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-black shadow-black/20 dark:shadow-white/20'
                      }`}
                    >
                      {isOwned ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Already Purchased</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 fill-current" />
                          <span>Buy Now</span>
                        </>
                      )}
                    </button>

                    {/* Secondary Actions: Add to Cart & Wishlist */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => {
                          if (isOwned) return;
                          requireAuth(() => {
                            if (inCart) {
                              navigate('/cart');
                            } else {
                              addToCart(template);
                            }
                          });
                        }}
                        disabled={isOwned}
                        className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          inCart
                            ? 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'border-black/10 dark:border-white/10 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {inCart ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>In Cart</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => toggleWishlist(template)}
                        className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isInWishlist(template.id)
                            ? 'border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'border-black/10 dark:border-white/10 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isInWishlist(template.id) ? 'fill-current text-red-500' : ''}`} />
                        <span>{isInWishlist(template.id) ? 'Saved' : 'Wishlist'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Bullet Inclusions List */}
                  <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-3 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2.5">
                      <DownloadCloud className="w-4 h-4 text-gray-800 dark:text-gray-200 shrink-0" />
                      <span>Instant automated ZIP download</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-gray-800 dark:text-gray-200 shrink-0" />
                      <span>Quality & security checked by BizLeap</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-gray-800 dark:text-gray-200 shrink-0" />
                      <span>Free lifetime updates & fixes</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-gray-800 dark:text-gray-200 shrink-0" />
                      <span>256-bit encrypted secure checkout</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <ReviewsSection templateId={template.id} />
      
      {/* Similar Templates Recommendation */}
      {similarTemplates.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 py-20 border-t border-black/[0.06] dark:border-white/10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">More Like This</p>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white font-display">You Might Also Like</h2>
            </div>
            <Link to="/templates" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-black dark:text-white hover:underline">
              <span>View Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {similarTemplates.map(t => (
              <InteractiveProductCard key={t.id} template={t} />
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="max-w-[1000px] mx-auto px-5 sm:px-8 md:px-12 pb-20">
        <FAQSection />
      </div>

      {/* Global Footer */}
      <Footerdemo />
    </div>
  );
}
