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
        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-5 md:px-10 py-16 lg:py-24">
          <div className="max-w-2xl">
            {/* Clean, Refined Minimalist Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.12] text-gray-950 dark:text-white mb-4">
              Ship production websites <br />
              <span className="text-gray-400 dark:text-gray-500 font-medium">in days, not months.</span>
            </h1>

            {/* Minimal Subtitle */}
            <p className="text-base text-gray-500 dark:text-gray-400 max-w-lg mb-8 leading-relaxed font-normal">
              Curated React and Tailwind templates with full source code, lifetime commercial license, and instant automated delivery.
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link
                to="/templates"
                className="px-6 py-3.5 bg-black hover:bg-neutral-800 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 group cursor-pointer"
              >
                <span>Explore Templates</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              
              <Link
                to="/about"
                className="px-5 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-sm font-semibold rounded-xl transition-all border border-neutral-200/80 flex items-center gap-2 cursor-pointer"
              >
                <span>About Bizleap</span>
              </Link>
            </div>

            {/* Quick Popular Categories */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-1">Browse:</span>
              {[
                { label: 'SaaS', path: '/templates?tag=SaaS' },
                { label: 'E-Commerce', path: '/templates?tag=E-Commerce' },
                { label: 'Dashboards', path: '/templates?tag=Dashboard' },
                { label: 'Agency', path: '/templates?tag=Agency' },
                { label: 'Landing Page', path: '/templates?tag=Landing%20Page' },
              ].map(chip => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => navigate(chip.path)}
                  className="px-3 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors cursor-pointer text-xs"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Trust Highlights Strip */}
            <div className="pt-6 border-t border-neutral-100 grid grid-cols-3 gap-4 max-w-lg">
              <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
                <Code2 className="w-4 h-4 text-black shrink-0" />
                <span>Full Source Code</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
                <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                <span>Commercial License</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
                <Download className="w-4 h-4 text-black shrink-0" />
                <span>Instant Download</span>
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
                <div key={i} className="bg-gray-100 dark:bg-zinc-800 rounded-xl aspect-[4/3] animate-pulse" />
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
                <div key={i} className="bg-gray-100 dark:bg-zinc-800 rounded-xl aspect-[4/3] animate-pulse" />
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

        {/* E. WHY CHOOSE US — Visual-First Feature Grid */}
        <section className="w-full py-20 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/60 dark:from-transparent dark:via-white/[0.01] dark:to-transparent border-t border-gray-100 dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-black/[0.02] dark:bg-white/[0.02] blur-3xl pointer-events-none rounded-full" />

          <div className="max-w-[1400px] mx-auto px-5 md:px-10 relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-zinc-700 shadow-xs mb-3">
                <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
                Why BizLeap
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white font-display">
                Built for Developers Who Ship
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto text-sm sm:text-base font-medium">
                Production-grade architecture with zero boilerplate and unlimited commercial freedom.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Feature 1: Clean Code */}
              <div className="group relative bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-gray-200/60 dark:border-zinc-700">
                      React & Tailwind
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 font-display">
                    Clean Source Code
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">
                    Meticulously structured, unminified React & Tailwind components.
                  </p>

                  {/* Visual Code Preview Miniature */}
                  <div className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] border border-slate-800 shadow-inner">
                    <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-slate-800/80 text-slate-500 text-[9px]">
                      <span className="w-2 h-2 rounded-full bg-neutral-600 inline-block" />
                      <span className="w-2 h-2 rounded-full bg-neutral-500 inline-block" />
                      <span className="w-2 h-2 rounded-full bg-neutral-400 inline-block" />
                      <span className="ml-1 text-slate-400">Template.tsx</span>
                    </div>
                    <div className="text-slate-400"><span className="text-white">export default</span> <span className="text-neutral-300">App</span>() {'{'}</div>
                    <div className="pl-3 text-neutral-300">&lt;Hero stack="react" /&gt;</div>
                    <div className="text-slate-400">{'}'}</div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-gray-900 dark:text-white">
                  <span>Full TypeScript Support</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
              </div>

              {/* Feature 2: 99+ Performance */}
              <div className="group relative bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
                      <Gauge className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-gray-200/60 dark:border-zinc-700">
                      100/100 Speed
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 font-display">
                    99+ Performance
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">
                    Engineered for instant paint, zero bloat, and top Core Web Vitals.
                  </p>

                  {/* Visual Performance Gauge Miniature */}
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-zinc-800/60 border border-neutral-200 dark:border-zinc-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full border-2 border-black dark:border-white flex items-center justify-center font-black text-black dark:text-white text-xs">
                        100
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-black dark:text-white">Core Web Vitals</div>
                        <div className="text-[9px] text-neutral-500 dark:text-neutral-400 font-medium">0.3s FCP • 0.0 CLS</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-black dark:text-white bg-neutral-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">FAST</span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-gray-900 dark:text-white">
                  <span>SEO Optimized</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
              </div>

              {/* Feature 3: Commercial License */}
              <div className="group relative bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-gray-200/60 dark:border-zinc-700">
                      Royalty Free
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 font-display">
                    Commercial Rights
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">
                    Deploy on unlimited personal & client projects forever.
                  </p>

                  {/* Visual Commercial Verification Miniature */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-black/10 dark:bg-white/10 text-black dark:text-white flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-900 dark:text-white">Full License</div>
                        <div className="text-[9px] text-slate-400">Unlimited Client Sites</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-black dark:text-white bg-neutral-200 dark:bg-zinc-700 px-2 py-0.5 rounded">
                      LIFETIME
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-gray-900 dark:text-white">
                  <span>Zero Renewal Fees</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
              </div>

              {/* Feature 4: Instant Auto-Delivery */}
              <div className="group relative bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
                      <Download className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-gray-200/60 dark:border-zinc-700">
                      Automated
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 font-display">
                    Instant Delivery
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">
                    Automated ZIP download + invoice sent immediately to your email.
                  </p>

                  {/* Visual Package File Miniature */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-black/10 dark:bg-white/10 text-black dark:text-white flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-900 dark:text-white font-mono">template.zip</div>
                        <div className="text-[9px] text-slate-400">Complete Archive</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                      48 MB
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-gray-900 dark:text-white">
                  <span>Direct Download Link</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black dark:text-white" />
                </div>
              </div>
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
