import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Check, ArrowRight, Sparkles } from 'lucide-react';
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

const ROTATING_PHRASES = [
  'ready to launch.',
  'built to convert.',
  'engineered to scale.',
  'designed to impress.'
];

function DynamicTicker() {
  const [index, setIndex] = useState(0);
  const [state, setState] = useState('visible');

  useEffect(() => {
    const timer = setInterval(() => {
      setState('exiting');
      setTimeout(() => {
        setIndex((i) => (i + 1) % ROTATING_PHRASES.length);
        setState('entering');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setState('visible'));
        });
      }, 260);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const style = {
    display: 'inline-block',
    transition: state === 'visible' ? 'all 320ms cubic-bezier(0.16, 1, 0.3, 1)' :
                state === 'exiting' ? 'all 240ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
    opacity: state === 'visible' ? 1 : 0,
    transform: state === 'visible' ? 'translateY(0)' :
               state === 'exiting' ? 'translateY(-24px)' : 'translateY(24px)',
  };

  return (
    <span className="inline-block overflow-hidden align-bottom whitespace-nowrap" style={{ height: '1.18em' }}>
      <span style={style} className="text-[#172033] font-bold whitespace-nowrap">
        {ROTATING_PHRASES[index]}
      </span>
    </span>
  );
}

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
        <div className="absolute top-0 right-0 w-full lg:w-[54%] h-full pointer-events-none overflow-hidden z-0 flex items-center justify-center lg:justify-end">
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
            className="w-full h-full object-cover object-center lg:object-[68%_center]"
            src="/bg.mp4"
          />

          {/* Soft narrow left-edge blend — reduced to eliminate washed-out whitish haze */}
          <div className="absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />

          {/* Subtle top and bottom fades */}
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/40 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/40 to-transparent pointer-events-none z-10" />
        </div>

        {/* Hero Left Content Layer */}
        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 sm:px-8 lg:pl-8 xl:pl-12 lg:pr-8 py-16 lg:py-24">
          <div className="max-w-[620px] lg:max-w-[660px]">
            {/* Small uppercase label */}
            <p className="text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.16em] text-[#556075] mb-5">
              PRODUCTION-READY WEBSITE TEMPLATES
            </p>

            {/* Main headline with Dynamic Rotating Text */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] xl:text-[64px] font-bold tracking-tight text-[#172033] leading-[1.08] mb-6">
              Premium websites,<br />
              <DynamicTicker />
            </h1>

            {/* Supporting paragraph */}
            <p className="text-[17px] sm:text-[18px] leading-[1.65] text-[#556075] max-w-[560px] font-normal mb-8">
              Curated React and Tailwind templates built for ambitious teams who demand top-tier performance, pixel-perfect design, and full commercial freedom.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                to="/templates"
                className="group h-[48px] px-6 bg-[#172033] hover:bg-[#222d44] text-white text-sm font-semibold rounded-[8px] transition-colors duration-200 inline-flex items-center justify-center cursor-pointer shadow-none"
              >
                <span>Explore Templates</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              
              <Link
                to="/templates"
                className="h-[48px] px-6 bg-white hover:bg-neutral-50 text-[#172033] text-sm font-semibold rounded-[8px] border border-[#D0D5DD] hover:border-neutral-400 transition-colors duration-200 inline-flex items-center justify-center cursor-pointer shadow-none"
              >
                <span>View Live Demos</span>
              </Link>
            </div>

            {/* Minimal Feature Row */}
            <div className="pt-6 mt-8 border-t border-neutral-200/80 max-w-[560px]">
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-[#556075]">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#172033]" />
                  Full Source Code
                </span>
                <span className="text-neutral-300 select-none">•</span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#172033]" />
                  Commercial License
                </span>
                <span className="text-neutral-300 select-none">•</span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#172033]" />
                  Instant Access
                </span>
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
