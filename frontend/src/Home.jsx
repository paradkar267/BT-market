import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Search, MoveRight, Headset, Code2, ShieldCheck,
  Download, Sparkles, Gauge, CheckCircle2, ArrowRight, Star, Zap, Package
} from 'lucide-react';
import { useCart } from './CartContext';
import { useTemplates } from './useTemplates';
import { useAuth } from './AuthContext';

import { ExploreCategories } from './components/ui/ExploreCategories';
import { InteractiveProductCard } from './components/ui/card-7';
import Navbar from './components/Navbar';
import { Footerdemo } from '@/components/ui/footer-section';
import { FAQSection } from './components/ui/FAQSection';


// DenseCard delegates to InteractiveProductCard
export const DenseCard = ({ template }) => (
  <InteractiveProductCard template={template} />
);

const CATEGORY_CHIPS = [
  { label: 'All', value: 'All' },
  { label: 'Agency', value: 'Agency' },
  { label: 'SaaS', value: 'SaaS' },
  { label: 'E-Commerce', value: 'E-commerce' },
  { label: 'Dashboard', value: 'Dashboards' },
  { label: 'UI Kits', value: 'UI Kits' },
  { label: 'React', value: 'React' },
  { label: 'Next.js', value: 'Next.js' },
  { label: 'Figma', value: 'Figma' },
];

export default function Home() {
  const { cartItems } = useCart();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [heroSearch, setHeroSearch] = useState('');

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/templates?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/templates');
    }
  };

  const { templates: marketplaceTemplates, loading } = useTemplates();
  const filteredTemplates = activeFilter === 'All'
    ? marketplaceTemplates
    : marketplaceTemplates.filter(t => t.category === activeFilter || t.tag === activeFilter);

  return (
    <div className="relative w-full min-h-screen flex flex-col font-sans bg-white text-gray-900">

      {/* ─── NAVBAR ──────────────────────────────────────────────────────── */}
      <Navbar />

      {/* ─── BESPOKE DEVELOPER HERO ────────────────── */}
      <section className="relative w-full min-h-[620px] md:min-h-[700px] bg-white border-b border-gray-100 flex items-center overflow-hidden pointer-events-auto">
        {/* Right Background Video Layer */}
        <div className="absolute top-0 right-0 w-full lg:w-[50%] h-full pointer-events-none overflow-hidden z-0 flex items-center justify-center lg:justify-end">
          <video
            ref={(el) => {
              if (el) {
                el.muted = true;
                el.play().catch(() => {});
              }
            }}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center lg:object-[60%_center]"
            src="/bg.mp4"
          />

          {/* Left-edge natural blend into white canvas */}
          <div className="absolute inset-y-0 left-0 w-32 md:w-56 bg-gradient-to-r from-white via-white/85 to-transparent pointer-events-none z-10" />

          {/* Top and bottom edge fades */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
        </div>

        {/* Hero Left Content Layer */}
        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-5 md:px-10 py-16 lg:py-20">
          <div className="max-w-2xl">
            {/* Clean Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100/90 hover:bg-gray-200/70 text-gray-800 border border-gray-200/80 mb-6 transition-colors cursor-default">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-gray-900">New Drops:</span>
              <span className="text-gray-600">Production React & Next.js Stacks</span>
              <ArrowRight className="w-3 h-3 text-gray-400 ml-0.5" />
            </div>

            {/* Authoritative, Clear Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[76px] font-extrabold tracking-[-0.035em] leading-[1.02] text-gray-950 mb-5 font-display">
              Ship world-class websites <br />
              <span className="text-black dark:text-white underline decoration-gray-300 dark:decoration-gray-700 underline-offset-8">in days, not months.</span>
            </h1>

            {/* Grounded, Honest Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mb-8 leading-relaxed font-normal">
              Carefully engineered web templates with full React & Tailwind CSS source code. Zero dependency bloat, unlimited client rights, and instant automated delivery.
            </p>

            {/* Interactive Search Bar in Hero */}
            <div className="max-w-xl mb-7">
              <div 
                onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
                className="relative flex items-center p-1.5 bg-white rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-amber-500/50 hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)] transition-all cursor-pointer group select-none"
              >
                <Search className="w-5 h-5 text-gray-400 group-hover:text-amber-500 ml-3.5 shrink-0 transition-colors" />
                <div className="w-full px-3 py-2.5 text-sm text-gray-400 font-medium flex items-center justify-between">
                  <span>Search templates (e.g. SaaS, Dashboard, React)...</span>
                  <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded">⌘K</kbd>
                </div>
                <button
                  type="button"
                  className="px-5 py-2.5 bg-gray-950 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-sm flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>


              {/* Quick Filter Tags */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500">
                <span className="font-semibold text-gray-400 text-[11px] uppercase tracking-wider">Popular:</span>
                {[
                  { label: 'React', path: '/templates?tech=React' },
                  { label: 'Next.js', path: '/templates?tech=Next.js' },
                  { label: 'Dashboards', path: '/templates?tag=Dashboard' },
                  { label: 'SaaS', path: '/templates?tag=SaaS' },
                  { label: 'E-Commerce', path: '/templates?tag=E-Commerce' },
                ].map(chip => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => navigate(chip.path)}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200/80 text-gray-700 font-medium transition-colors cursor-pointer text-xs"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Authentic Credibility Checklist */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-600 pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Full Source Code (.zip)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited Client Rights</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Free Lifetime Updates</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>99+ Lighthouse Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div className="w-full flex flex-col items-center bg-white pointer-events-auto">

        {/* A. FEATURED TEMPLATES */}
        <section className="w-full max-w-[1400px] mx-auto px-5 md:px-10 pt-12 pb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Editor's Pick</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Templates</h2>
            </div>
            <Link to="/templates" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl aspect-[16/10] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...marketplaceTemplates].sort((a, b) => (b.sales * b.rating) - (a.sales * a.rating)).slice(0, 4).map(template => (
                <DenseCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </section>


        {/* C. BROWSE BY CATEGORY — horizontal chips */}
        <section className="w-full max-w-[1400px] mx-auto px-5 md:px-10 pt-10 pb-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Browse by Category</h2>
            <Link to="/templates" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors">
              All templates <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORY_CHIPS.map(chip => (
              <button
                key={chip.value}
                onClick={() => setActiveFilter(chip.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  activeFilter === chip.value
                    ? 'bg-black text-white border-black shadow-sm dark:bg-white dark:text-black dark:border-white'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-black hover:text-black dark:bg-zinc-900 dark:text-gray-300 dark:border-zinc-800 dark:hover:border-white dark:hover:text-white'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* ExploreCategories detail cards */}
          <ExploreCategories />
        </section>

        {/* D. NEWEST ARRIVALS */}
        <section id="catalog" className="w-full max-w-[1400px] mx-auto px-5 md:px-10 pt-8 pb-10 border-t border-gray-100 mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Just Added</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Newest Arrivals</h2>
            </div>
            <Link to="/templates" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors">
              Browse all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl aspect-[16/10] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.slice(0, 8).map(template => (
                <DenseCard key={`new-${template.id}`} template={template} />
              ))}
              {filteredTemplates.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                  <p className="text-lg text-gray-400 font-medium">No templates found in this category.</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Link
              to="/templates"
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:border-black text-gray-800 hover:text-black dark:bg-zinc-900 dark:border-zinc-700 dark:hover:border-white dark:text-white text-sm font-semibold rounded-xl transition-all"
            >
              View All Templates <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* E. WHY CHOOSE US — Modern Bento Feature Grid (Monochrome) */}
        <section className="w-full py-20 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/60 dark:from-transparent dark:via-white/[0.01] dark:to-transparent border-t border-gray-100 dark:border-white/5 relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-black/[0.02] dark:bg-white/[0.02] blur-3xl pointer-events-none rounded-full" />

          <div className="max-w-[1400px] mx-auto px-5 md:px-10 relative z-10">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-zinc-700 shadow-sm mb-4">
                <Sparkles className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                Why BizLeap
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white font-display">
                Everything you need to{' '}
                <span className="text-black dark:text-white underline decoration-gray-300 dark:decoration-gray-700 underline-offset-8">
                  ship 10x faster
                </span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-3.5 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
                Skip months of tedious frontend boilerplate. Get production-ready, beautifully crafted templates with full source code, lifetime commercial license, and zero restrictions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
              {[
                {
                  icon: Code2,
                  gradient: 'from-zinc-800 to-black shadow-black/10 dark:from-zinc-700 dark:to-zinc-900',
                  glow: 'bg-black/5 dark:bg-white/5',
                  badge: 'TypeScript & Tailwind',
                  title: 'Clean Source Code',
                  desc: 'Unminified, meticulously structured React & Next.js code. Modular components, typed props, ready to customize in minutes.'
                },
                {
                  icon: Gauge,
                  gradient: 'from-zinc-800 to-black shadow-black/10 dark:from-zinc-700 dark:to-zinc-900',
                  glow: 'bg-black/5 dark:bg-white/5',
                  badge: '100/100 Lighthouse',
                  title: '99+ Performance Score',
                  desc: 'Zero dependency bloat. Engineered for instant initial paint, optimal Core Web Vitals, and effortless SEO dominance.'
                },
                {
                  icon: ShieldCheck,
                  gradient: 'from-zinc-800 to-black shadow-black/10 dark:from-zinc-700 dark:to-zinc-900',
                  glow: 'bg-black/5 dark:bg-white/5',
                  badge: 'Unlimited Projects',
                  title: 'Commercial License',
                  desc: 'Deploy on unlimited client projects and SaaS applications. Pay once, use forever with zero royalty fees or renewal costs.'
                },
                {
                  icon: Download,
                  gradient: 'from-zinc-800 to-black shadow-black/10 dark:from-zinc-700 dark:to-zinc-900',
                  glow: 'bg-black/5 dark:bg-white/5',
                  badge: 'Instant Auto-Delivery',
                  title: 'Instant ZIP Download',
                  desc: 'Get instantaneous access to complete project archives right after checkout. Re-download lifetime updates anytime from your portal.'
                },
              ].map(feat => {
                const Icon = feat.icon;
                return (
                  <div 
                    key={feat.title} 
                    className="group relative bg-white dark:bg-white/[0.03] rounded-3xl border border-black/[0.06] dark:border-white/10 p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    {/* Hover Ambient Glow */}
                    <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full ${feat.glow} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                    <div>
                      {/* Top Row: Icon + Badge */}
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2.5 py-1 rounded-full border border-gray-200/60 dark:border-white/5">
                          {feat.badge}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-display">
                        {feat.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                        {feat.desc}
                      </p>
                    </div>

                    <div className="pt-6 mt-4 border-t border-gray-100 dark:border-white/5 flex items-center gap-1.5 text-xs font-bold text-black dark:text-white group-hover:translate-x-1 transition-transform">
                      <span>Included in all templates</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>



        {/* G. FAQ */}
        <div className="pt-4 pb-16 px-5 md:px-10 w-full max-w-[900px] mx-auto">
          <FAQSection />
        </div>

        {/* H. FOOTER */}
        <Footerdemo />
      </div>
    </div>
  );
}
