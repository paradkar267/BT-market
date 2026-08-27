import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Zap, Infinity as InfinityIcon, ShoppingCart, Search, MoveRight, Headset, Code2, ShieldCheck, Download, Sparkles, Gauge, CheckCircle2 } from 'lucide-react';
import { useCart } from './CartContext';
import { useTemplates } from './useTemplates';
import { useAuth } from './AuthContext';

import { ExploreCategories } from './components/ui/ExploreCategories';
import { InteractiveProductCard } from './components/ui/card-7';
import { CenterNav } from './components/ui/CenterNav';
import { BlurFade } from '@/components/ui/blur-fade';
import UserMenu from './UserMenu';
import { Floating3DWrapper } from '@/components/ui/3d-card';
import { IconBar, IconBarItem } from '@/components/ui/icon-bar';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Footerdemo } from '@/components/ui/footer-section';
import SocialCards from '@/components/ui/card-fan-carousel';
import { motion } from "motion/react";
import { HeroGeometricBackground } from '@/components/ui/shape-landing-hero';
import { FAQSection } from './components/ui/FAQSection';

import { Logo } from './components/ui/Logo';

// DenseCard delegates to InteractiveProductCard
export const DenseCard = ({ template }) => (
  <InteractiveProductCard template={template} />
);

export default function Home() {
  const { cartItems } = useCart();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const filters = ["All", "Figma", "Next.js", "React", "Webflow", "Tailwind", "HTML", "Shopify", "React Native", "Framer"];
  const [activeFilter, setActiveFilter] = useState("All");

  const { templates: marketplaceTemplates, loading } = useTemplates();
  const filteredTemplates = activeFilter === "All" 
    ? marketplaceTemplates 
    : marketplaceTemplates.filter(t => t.category === activeFilter);

  return (
    <div className={`scene-7-hero relative w-full min-h-screen z-40 pointer-events-none flex flex-col font-sans bg-white dark:bg-black text-black dark:text-white dark:bg-black dark:text-white`}>
      
      {/* 0. GLOBAL STICKY NAVIGATION */}
      <nav className={`sticky top-0 hero-nav h-[80px] w-full px-6 md:px-12 flex items-center justify-between z-[100] glass-nav pointer-events-auto transition-all dark:bg-black/50 dark:border-gray-800`}>
        {/* LOGO */}
        <Logo />

        {/* CENTER LINKS - TUBELIGHT NAVBAR */}
        <CenterNav />
        
        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link to="/contact" title="Contact Us" className="hidden md:flex items-center justify-center h-10 w-10 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 rounded-full transition-colors cursor-pointer text-gray-600 hover:text-black dark:text-white shadow-sm border border-black/[0.03] dark:border-gray-700">
            <Headset className="w-4 h-4" />
          </Link>
          <div 
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className="flex items-center justify-center h-10 w-10 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 rounded-full transition-colors cursor-pointer text-gray-600 hover:text-black dark:text-white shadow-sm border border-black/[0.03] dark:border-gray-700"
          >
            <Search className="w-4 h-4" />
          </div>

          <button onClick={() => requireAuth(() => navigate('/cart'))} className="relative flex items-center justify-center h-10 w-10 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors cursor-pointer text-gray-600 dark:text-gray-300 hover:text-black dark:text-white dark:hover:text-white shadow-sm border border-black/[0.03] dark:border-gray-700">
            <ShoppingCart className="w-4 h-4" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                {cartItems.length}
              </span>
            )}
          </button>
          <div className="block">
            <UserMenu />
          </div>
        </div>
      </nav>

      <div className="relative w-full h-[90vh] overflow-hidden flex flex-col shrink-0">
        <HeroGeometricBackground />
        
        {/* Animated Aurora Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900/50 aurora-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 dark:bg-cyan-900/50 aurora-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-rose-300 dark:bg-rose-900/50 aurora-blob animation-delay-4000"></div>

        <div className="flex-1 w-full max-w-[1800px] mx-auto relative flex items-center">
          {/* LEFT SIDE: Text Information */}
          <div className="w-full lg:w-[45%] h-full relative z-20 flex flex-col justify-center pl-10 md:pl-24 pointer-events-auto">
            <BlurFade delay={0.25} inView>
              <h2 className={`text-6xl md:text-[6.5rem] font-black leading-[0.9] tracking-tighter mb-8 text-gray-900 dark:text-gray-100`}>
                Design<br />Redefined.
              </h2>
            </BlurFade>

            <p className={`info-stagger text-xl font-medium max-w-lg mb-12 leading-relaxed text-gray-500`}>
              Welcome to Bizleap. The premier digital marketplace for world-class UI kits, 3D assets, and high-converting website templates built for modern creators.
            </p>

            <div className="flex gap-4 info-stagger">
              <ShinyButton onClick={() => document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' })}>
                Explore Market
              </ShinyButton>
            </div>
          </div>

          {/* RIGHT SIDE: Video */}
          <div className="w-full lg:w-[55%] h-full relative z-20 flex items-center justify-center pb-0 pr-10">
            <div className="absolute inset-0 w-full h-full flex items-center justify-end" style={{ maskImage: 'linear-gradient(to right, transparent, black 20%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%)' }}>
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover object-left lg:object-center z-0"
                src="/bg.mp4"
              ></video>
            </div>
          </div>
        </div>
      </div>

      <div className={`w-full relative z-50 pointer-events-auto flex flex-col items-center bg-white dark:bg-black text-black dark:text-white`}>

         {/* A. FEATURED THEMES - Moved to Top priority */}
         <div className={`pt-10 md:pt-14 pb-8 md:pb-10 px-6 md:px-16 w-full max-w-[1600px] mx-auto`}>
            <div className="flex justify-between items-end mb-8 md:mb-10">
               <div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2 text-gray-900 dark:text-gray-100">Featured Themes</h2>
                  <p className="text-gray-500 font-medium text-lg md:text-xl">Our highest-rated and meticulously crafted templates.</p>
               </div>
               <Link to="/templates" className={`hidden md:flex items-center gap-2 font-bold hover:gap-4 transition-all px-6 py-3 rounded-full bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-black/[0.05]`}>
                  View all featured <MoveRight className="w-5 h-5" />
               </Link>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...marketplaceTemplates].sort((a, b) => (b.sales * b.rating) - (a.sales * a.rating)).slice(0, 4).map(template => (
                   <DenseCard key={template.id} template={template} />
                ))}
             </div>
         </div>

          {/* B. CATEGORY DIRECTORY */}
          <div className={`py-10 md:py-14 w-full border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black relative overflow-hidden`}>
             <div className="max-w-[1600px] mx-auto px-6 md:px-16">
                <div className="text-center mb-8 md:mb-10 relative z-10">
                   <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
                      Curated Architecture
                   </div>
                   <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-3 text-gray-900 dark:text-gray-100`}>Explore Categories</h2>
                   <p className="text-gray-500 dark:text-gray-400 font-normal text-base sm:text-lg max-w-2xl mx-auto">Discover industry-leading templates, curated perfectly for modern digital businesses and engineers.</p>
                </div>
                <div className="relative z-20">
                  <ExploreCategories />
                </div>
             </div>
          </div>

         {/* C. CATALOG FILTER & TEMPLATES GRID */}
         <div id="catalog" className={`pt-10 md:pt-14 pb-8 md:pb-10 px-6 md:px-16 w-full max-w-[1600px] mx-auto border-b border-black/[0.03] relative`}>
            
            {/* Soft Aurora Glow behind catalog */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-100/60 dark:bg-indigo-900/20 aurora-blob pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-10 gap-6 relative z-10">
               <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-gray-100">Newest Arrivals</h2>
               <Link to="/templates" className={`flex items-center gap-2 font-bold hover:gap-4 transition-all px-6 py-3 rounded-full bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-black/[0.05]`}>
                  Browse all <MoveRight className="w-5 h-5" />
               </Link>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 relative z-10">
                {filteredTemplates.slice(0, 10).map(template => (
                   <DenseCard key={`new-${template.id}`} template={template} />
               ))}
               
               {filteredTemplates.length === 0 && (
                  <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem]">
                     <p className="text-xl text-gray-400 font-bold">No templates found for this category.</p>
                  </div>
               )}
            </div>
            
            <div className="mt-10 flex justify-center">
               <Link to="/templates" className={`px-12 py-5 border border-black/[0.1] font-black rounded-full transition-all text-lg shadow-sm cursor-pointer inline-flex items-center bg-white dark:bg-black text-black dark:text-white hover:bg-gray-50 dark:bg-gray-900 hover:shadow-md`}>
                 Load More Templates
               </Link>
            </div>
         </div>

         {/* D. VALUE PROPOSITION — High-Impact Modern Bento Grid */}
         <section className="pt-14 md:pt-20 pb-8 md:pb-12 w-full bg-white dark:bg-black relative overflow-hidden">
            {/* Subtle ambient lighting */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-6 md:px-16 relative z-10">
               {/* Section Header */}
               <div className="max-w-3xl mb-12 md:mb-16">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
                     <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                     Built for Developers, Creators & Agencies
                  </div>
                  
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.05]">
                     Ship production apps in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">hours</span>, not weeks.
                  </h2>
                  
                  <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                     Skip months of repetitive frontend scaffolding. Get unminified source code, clean responsive design systems, and lifetime commercial usage rights.
                  </p>
               </div>

               {/* Bento Grid */}
               <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 mb-12">
                  
                  {/* ── CARD 1: Clean Modular Source Code (Span 7) ── */}
                  <div className="md:col-span-7 group relative rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-b from-gray-50/80 to-white dark:from-[#111114] dark:to-[#09090b] p-8 md:p-10 overflow-hidden shadow-sm hover:border-indigo-500/40 transition-all duration-500">
                     <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                           <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                              <Code2 className="w-6 h-6" />
                           </div>
                           <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                              Clean, Unminified Source Code
                           </h3>
                           <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md">
                              No obfuscation or proprietary lock-in. Every kit ships with clean component hierarchies, documented props, and Tailwind utility classes ready for instant customization.
                           </p>
                        </div>

                        {/* Interactive Code Mockup Snippet */}
                        <div className="mt-6 rounded-2xl bg-[#09090b] border border-white/10 p-4 font-mono text-xs text-gray-300 shadow-2xl overflow-hidden">
                           <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 text-[11px] text-gray-500">
                              <div className="flex items-center gap-1.5">
                                 <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                                 <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                                 <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                                 <span className="ml-2 text-gray-400">src/components/HeroSection.jsx</span>
                              </div>
                              <span className="text-emerald-400 font-semibold">100% React & Tailwind</span>
                           </div>
                           <pre className="text-[12px] leading-relaxed text-gray-300 overflow-x-auto">
                              <code>
                                 <span className="text-purple-400">export function</span> <span className="text-blue-400">Hero</span>() &#123;<br/>
                                 &nbsp;&nbsp;<span className="text-purple-400">return</span> (<br/>
                                 &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-red-400">div</span> <span className="text-yellow-300">className</span>=<span className="text-green-300">"grid grid-cols-1 md:grid-cols-2 gap-8"</span>&gt;<br/>
                                 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-cyan-400">Heading</span> <span className="text-yellow-300">size</span>=<span className="text-green-300">"xl"</span>&gt;Launch Faster&lt;/<span className="text-cyan-400">Heading</span>&gt;<br/>
                                 &nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span className="text-red-400">div</span>&gt;<br/>
                                 &nbsp;&nbsp;);<br/>
                                 &#125;
                              </code>
                           </pre>
                        </div>
                     </div>
                  </div>

                  {/* ── CARD 2: Performance (Span 5) ── */}
                  <div className="md:col-span-5 group relative rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-b from-gray-50/80 to-white dark:from-[#111114] dark:to-[#09090b] p-8 md:p-10 overflow-hidden shadow-sm hover:border-cyan-500/40 transition-all duration-500 flex flex-col justify-between">
                     <div>
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6">
                           <Gauge className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                           99+ Lighthouse Scores
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                           Engineered with zero dependency bloat. Super fast load times, optimized image pipelines, and crisp accessibility standards out of the box.
                        </p>
                     </div>

                     {/* Metric Badges */}
                     <div className="mt-8 grid grid-cols-3 gap-2.5">
                        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-center">
                           <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">99</div>
                           <div className="text-[9px] uppercase font-bold text-gray-500 mt-0.5">Speed</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-center">
                           <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">100</div>
                           <div className="text-[9px] uppercase font-bold text-gray-500 mt-0.5">SEO</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-center">
                           <div className="text-xl font-black text-blue-600 dark:text-blue-400">100</div>
                           <div className="text-[9px] uppercase font-bold text-gray-500 mt-0.5">Best Pr.</div>
                        </div>
                     </div>
                  </div>

                  {/* ── CARD 3: Unlimited Commercial License (Span 5) ── */}
                  <div className="md:col-span-5 group relative rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-b from-gray-50/80 to-white dark:from-[#111114] dark:to-[#09090b] p-8 md:p-10 overflow-hidden shadow-sm hover:border-pink-500/40 transition-all duration-500 flex flex-col justify-between">
                     <div>
                        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-6">
                           <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                           Commercial Freedom
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                           Use for unlimited personal and client projects. No recurring subscription fees, no royalties, and no attribution required.
                        </p>
                     </div>

                     <div className="mt-8 p-4 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                           Pay once &bull; Deploy for client projects forever
                        </span>
                     </div>
                  </div>

                  {/* ── CARD 4: Instant Download & Lifetime Access (Span 7) ── */}
                  <div className="md:col-span-7 group relative rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-b from-gray-50/80 to-white dark:from-[#111114] dark:to-[#09090b] p-8 md:p-10 overflow-hidden shadow-sm hover:border-purple-500/40 transition-all duration-500 flex flex-col justify-between">
                     <div>
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                           <Download className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                           Direct Instant ZIP Download
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-lg">
                           Immediate access upon checkout. Re-download your templates from your dashboard anytime, or use direct download links delivered straight to your email.
                        </p>
                     </div>

                     <div className="mt-8 flex flex-wrap items-center gap-2.5">
                        {['React / Next.js', 'Tailwind CSS', 'Figma UI Kits', 'HTML & Webflow', 'Free Minor Updates'].map((tag) => (
                           <span key={tag} className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-800 dark:text-gray-200">
                              ✓ {tag}
                           </span>
                        ))}
                     </div>
                  </div>

               </div>

               {/* Clean Metrics Strip */}
               <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#111114]/50 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                     <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">100+</div>
                     <div className="text-xs uppercase tracking-wider font-bold text-gray-500 mt-1">Curated Templates</div>
                  </div>
                  <div>
                     <div className="text-3xl md:text-4xl font-black text-indigo-600 dark:text-indigo-400">100%</div>
                     <div className="text-xs uppercase tracking-wider font-bold text-gray-500 mt-1">Source Code Included</div>
                  </div>
                  <div>
                     <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">0%</div>
                     <div className="text-xs uppercase tracking-wider font-bold text-gray-500 mt-1">Recurring Lock-in</div>
                  </div>
                  <div>
                     <div className="text-3xl md:text-4xl font-black text-emerald-600 dark:text-emerald-400">Lifetime</div>
                     <div className="text-xs uppercase tracking-wider font-bold text-gray-500 mt-1">Commercial License</div>
                  </div>
               </div>
            </div>
         </section>

         {/* E. FAQ SECTION */}
         <div className="pt-2 pb-16 md:pb-20 px-6 md:px-12 w-full max-w-[1400px] mx-auto">
           <FAQSection />
         </div>

         {/* F. FOOTER */}
         <Footerdemo />

      </div>
    </div>
  );
}
