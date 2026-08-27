import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Rocket, 
  ShoppingBag, 
  Layers, 
  ArrowUpRight
} from 'lucide-react';

const categories = [
  {
    id: 'saas',
    name: 'SaaS & Startups',
    subtitle: 'High-Converting Landing Pages',
    description: 'Hero sections, feature bento grids, pricing tiers, and conversion funnels.',
    count: '28+ Kits',
    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    borderGlow: 'group-hover:border-indigo-500/50',
    iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    icon: Rocket,
    tags: ['Next.js 14', 'Tailwind CSS', 'Framer Motion'],
    previewType: 'saas',
    link: '/templates'
  },
  {
    id: 'dashboards',
    name: 'Dashboards & Admin',
    subtitle: 'Data-Dense Management Suites',
    description: 'Analytics overviews, transaction tables, CRM workflows, and live stats widgets.',
    count: '34+ Kits',
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    borderGlow: 'group-hover:border-cyan-500/50',
    iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    icon: LayoutDashboard,
    tags: ['React', 'Recharts', 'TypeScript'],
    previewType: 'dashboard',
    link: '/templates'
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce & Stores',
    subtitle: 'Modern Digital Marketplaces',
    description: 'Product grids, slide-over carts, instant checkout flows, and review modules.',
    count: '19+ Kits',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderGlow: 'group-hover:border-emerald-500/50',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    icon: ShoppingBag,
    tags: ['Shopify', 'Stripe Ready', 'Tailwind'],
    previewType: 'store',
    link: '/templates'
  },
  {
    id: 'ui-kits',
    name: 'UI Kits & Design Systems',
    subtitle: 'Production-Grade Component Sets',
    description: 'Auto-layout Figma tokens, accessible Radix UI primitives, and icon suites.',
    count: '22+ Kits',
    gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    borderGlow: 'group-hover:border-pink-500/50',
    iconBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    icon: Layers,
    tags: ['Figma Tokens', 'Radix UI', 'Design Systems'],
    previewType: 'uikit',
    link: '/ui-kits'
  }
];

function MiniPreview({ type }) {
  if (type === 'saas') {
    return (
      <div className="w-full h-28 rounded-2xl bg-gray-100 dark:bg-black/60 border border-gray-200/80 dark:border-white/10 p-3 flex flex-col justify-between overflow-hidden relative shadow-inner">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-1.5">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">hero.tsx</span>
        </div>
        <div className="space-y-1.5 py-0.5">
          <div className="h-2 w-3/4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
          <div className="h-1.5 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 px-2 rounded-md bg-indigo-600 text-[9px] text-white font-bold flex items-center">Deploy</div>
          <div className="h-5 px-2 rounded-md bg-gray-200 dark:bg-white/10 text-[9px] text-gray-700 dark:text-gray-300 flex items-center">Docs</div>
        </div>
      </div>
    );
  }

  if (type === 'dashboard') {
    return (
      <div className="w-full h-28 rounded-2xl bg-gray-100 dark:bg-black/60 border border-gray-200/80 dark:border-white/10 p-3 flex flex-col justify-between overflow-hidden relative shadow-inner">
        <div className="flex justify-between items-center text-[10px] text-gray-500">
          <span className="font-bold text-gray-800 dark:text-gray-200">Revenue Analytics</span>
          <span className="text-cyan-500 font-bold">+28.4%</span>
        </div>
        {/* Mini Bars */}
        <div className="flex items-end justify-between gap-1 h-10 pt-1 px-1">
          {[40, 65, 50, 85, 70, 95, 100].map((h, i) => (
            <div key={i} className="flex-1 bg-cyan-500/20 rounded-t transition-all duration-300 relative" style={{ height: `${h}%` }}>
              {i === 6 && <div className="absolute inset-0 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t"></div>}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[8px] text-gray-400 font-mono">
          <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
        </div>
      </div>
    );
  }

  if (type === 'store') {
    return (
      <div className="w-full h-28 rounded-2xl bg-gray-100 dark:bg-black/60 border border-gray-200/80 dark:border-white/10 p-3 flex flex-col justify-between overflow-hidden relative shadow-inner">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-700 dark:text-gray-300 font-bold">Featured Kit</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[9px]">$49</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="h-2 w-16 bg-gray-400 dark:bg-gray-200 rounded-full font-bold"></div>
            <div className="h-1.5 w-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
        </div>
        <div className="w-full py-1 rounded-lg bg-emerald-600 text-[9px] text-white font-bold text-center">
          Instant Checkout
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-28 rounded-2xl bg-gray-100 dark:bg-black/60 border border-gray-200/80 dark:border-white/10 p-3 flex flex-col justify-between overflow-hidden relative shadow-inner">
      <div className="flex items-center justify-between text-[10px] text-gray-500">
        <span>Component Set</span>
        <span className="text-pink-500 font-bold">48 Primitives</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <div className="h-5 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-[8px] text-pink-600 dark:text-pink-300 font-semibold">Button</div>
        <div className="h-5 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-[8px] text-gray-600 dark:text-gray-300">Modal</div>
        <div className="h-5 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-[8px] text-gray-600 dark:text-gray-300">Badge</div>
      </div>
      <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
        <span>Auto-Layout & Variants</span>
      </div>
    </div>
  );
}

export function ExploreCategories() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {categories.map((category) => {
        const IconComponent = category.icon;
        
        return (
          <motion.div
            key={category.id}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={() => navigate(category.link)}
            className={`group relative rounded-3xl border border-gray-200/90 dark:border-white/10 ${category.borderGlow} bg-white dark:bg-[#0c0c0e] p-6 md:p-7 flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden`}
          >
            {/* Top Ambient Highlight */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-b ${category.gradient} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

            <div className="relative z-10">
              {/* Header: Icon + Badge */}
              <div className="flex items-center justify-between mb-5">
                <div className={`w-12 h-12 rounded-2xl ${category.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300">
                  {category.count}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight mb-1 flex items-center justify-between">
                <span>{category.name}</span>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
              </h3>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                {category.subtitle}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                {category.description}
              </p>

              {/* Interactive Mini UI Preview */}
              <div className="mb-5">
                <MiniPreview type={category.previewType} />
              </div>
            </div>

            {/* Bottom Tech Pills */}
            <div className="relative z-10 pt-4 border-t border-gray-100 dark:border-white/5 flex flex-wrap items-center gap-1.5">
              {category.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/[0.03] text-[11px] font-semibold text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-white/5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}


