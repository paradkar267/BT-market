import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, MoveRight, Layers, Zap, Infinity, ArrowUpRight, ShoppingCart, Code, LayoutTemplate, Palette, User, Smartphone, Box, Headset } from 'lucide-react';
import { NavBar } from './components/ui/tubelight-navbar';
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


export default function Home({ mountSpline }) {
  const { cartItems, isLoggedIn } = useCart();
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
         <div className={`py-20 md:py-24 px-8 md:px-16 w-full max-w-[1600px] mx-auto`}>
            <div className="flex justify-between items-end mb-16">
               <div>
                  <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4 text-gray-900 dark:text-gray-100">Featured Themes</h2>
                  <p className="text-gray-500 font-medium text-xl">Our highest-rated and meticulously crafted templates.</p>
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

         {/* B. CATEGORY DIRECTORY - Art Gallery Style */}
         <div className={`py-20 md:py-24 w-full border-y border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-black`}>
            <div className="max-w-[1600px] mx-auto px-8 md:px-16 overflow-hidden">
               <div className="text-center mb-20 relative z-10">
                  <h2 className={`text-5xl md:text-6xl font-black tracking-tight mb-6 text-gray-900 dark:text-gray-100`}>Explore Categories</h2>
                  <p className="text-gray-500 font-medium text-xl max-w-2xl mx-auto">Discover industry-leading templates, curated perfectly for modern digital businesses.</p>
               </div>
               <div className="relative z-20">
                 <ExploreCategories />
               </div>
            </div>
         </div>

         {/* C. CATALOG FILTER & TEMPLATES GRID */}
         <div id="catalog" className={`pt-20 md:pt-24 pb-8 md:pb-10 px-8 md:px-16 w-full max-w-[1600px] mx-auto border-b border-black/[0.03] relative`}>
            
            {/* Soft Aurora Glow behind catalog */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-100/60 dark:bg-indigo-900/20 aurora-blob pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6 relative z-10">
               <h2 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-gray-100">Newest Arrivals</h2>
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

         {/* D. VALUE PROPOSITION — Premium Feature Showcase */}
         <div className="pt-16 md:pt-24 pb-24 md:pb-32 w-full bg-white dark:bg-black relative overflow-hidden">
            {/* Ambient background orbs */}
            <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-violet-500/[0.07] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/[0.05] rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-6 md:px-16 relative z-10">
               {/* Header */}
               <motion.div
                 className="mb-20 md:mb-24"
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: '-80px' }}
                 transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
               >
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-violet-500/[0.08] dark:bg-violet-500/[0.12] border border-violet-500/20 mb-8">
                     <span className="relative flex h-2.5 w-2.5">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
                     </span>
                     <span className="text-sm font-semibold tracking-wide uppercase text-violet-600 dark:text-violet-400">Why Bizleap</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-gray-900 dark:text-white leading-[0.9]">
                     Built for<br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400">perfectionists.</span>
                  </h2>
                  <p className="mt-6 text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-xl font-medium leading-relaxed">
                     Premium design assets crafted with obsessive attention to detail. Every pixel, every interaction, every component.
                  </p>
               </motion.div>

               {/* Feature Cards */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-20 md:mb-28">
                  {[
                    {
                      icon: Layers,
                      title: 'Pixel Perfect',
                      desc: 'Every layer is meticulously organized. Components are built with strict design systems to ensure flawless aesthetics at every breakpoint.',
                      gradient: 'from-violet-600 to-fuchsia-600',
                      glow: 'violet',
                      border: 'hover:border-violet-500/40',
                      iconBg: 'bg-violet-500/10 dark:bg-violet-500/20',
                    },
                    {
                      icon: Zap,
                      title: 'Production Ready',
                      desc: 'Stop translating designs to code. Our kits ship with clean, responsive React & Tailwind code — ready to deploy instantly.',
                      gradient: 'from-cyan-500 to-blue-600',
                      glow: 'cyan',
                      border: 'hover:border-cyan-500/40',
                      iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
                    },
                    {
                      icon: Infinity,
                      title: 'Lifetime Updates',
                      desc: 'Pay once, use forever. Future updates, new components, and continuous design upgrades — all included at no extra cost.',
                      gradient: 'from-pink-500 to-rose-600',
                      glow: 'pink',
                      border: 'hover:border-pink-500/40',
                      iconBg: 'bg-pink-500/10 dark:bg-pink-500/20',
                    },
                  ].map((feature, i) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className={`group relative p-8 md:p-10 rounded-3xl border border-gray-200/60 dark:border-white/[0.06] ${feature.border} transition-all duration-500 bg-gray-50/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.04] cursor-default`}
                    >
                      {/* Hover glow */}
                      <div className={`absolute -inset-px rounded-3xl bg-gradient-to-b ${feature.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none`} />
                      
                      {/* Floating glow orb */}
                      <div className={`absolute top-6 right-6 w-24 h-24 bg-${feature.glow}-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150 pointer-events-none`} />

                      <div className="relative z-10">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                          <feature.icon className={`w-7 h-7 bg-gradient-to-br ${feature.gradient} bg-clip-text`} style={{ color: feature.glow === 'violet' ? '#8b5cf6' : feature.glow === 'cyan' ? '#06b6d4' : '#ec4899' }} />
                        </div>
                        
                        {/* Content */}
                        <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-white tracking-tight">{feature.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[15px]">{feature.desc}</p>
                        
                        {/* Bottom accent line */}
                        <div className={`mt-8 h-[2px] w-0 group-hover:w-16 bg-gradient-to-r ${feature.gradient} transition-all duration-500 rounded-full`} />
                      </div>
                    </motion.div>
                  ))}
               </div>

               {/* Stats Section */}
               <motion.div
                 initial={{ opacity: 0, y: 40 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: '-60px' }}
                 transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                 className="relative rounded-3xl overflow-hidden"
               >
                 {/* Gradient border effect */}
                 <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 rounded-3xl" />
                 <div className="absolute inset-[1px] bg-white dark:bg-[#0a0a0a] rounded-[calc(1.5rem-1px)]" />
                 
                 {/* Inner glow */}
                 <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                   <div className="absolute top-0 left-1/4 w-[500px] h-[200px] bg-violet-500/[0.06] rounded-full blur-[80px]" />
                   <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-cyan-500/[0.06] rounded-full blur-[80px]" />
                 </div>
                 
                 <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-px">
                   {[
                     { value: '2,400+', label: 'Templates', gradient: 'from-violet-600 to-fuchsia-500' },
                     { value: '98%', label: 'Satisfaction', gradient: 'from-fuchsia-500 to-pink-500' },
                     { value: '50K+', label: 'Creators', gradient: 'from-pink-500 to-cyan-500' },
                     { value: '4.9 ★', label: 'Avg. Rating', gradient: 'from-cyan-500 to-blue-500' },
                   ].map((stat, i) => (
                     <motion.div
                       key={stat.label}
                       initial={{ opacity: 0, scale: 0.9 }}
                       whileInView={{ opacity: 1, scale: 1 }}
                       viewport={{ once: true }}
                       transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                       className="group text-center py-10 md:py-14 px-4 relative hover:bg-white/50 dark:hover:bg-white/[0.02] transition-colors duration-300"
                     >
                       {/* Divider */}
                       {i > 0 && <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-gray-300/50 dark:via-white/10 to-transparent" />}
                       {i === 2 && <div className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-gray-300/50 dark:via-white/10 to-transparent" />}
                       
                       <div className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-3 text-transparent bg-clip-text bg-gradient-to-br ${stat.gradient} group-hover:scale-105 transition-transform duration-300 inline-block`}>
                         {stat.value}
                       </div>
                       <div className="text-xs md:text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{stat.label}</div>
                     </motion.div>
                   ))}
                 </div>
               </motion.div>
            </div>
         </div>





         {/* E. FAQ SECTION */}
         <div className="py-20 md:py-24 px-8 md:px-16 w-full max-w-[1600px] mx-auto">
           <FAQSection />
         </div>

         {/* F. FOOTER */}
         <Footerdemo />

      </div>
    </div>
  );
}
