import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutTemplate, ChevronDown, Sparkles, TrendingUp, 
  Gift, Crown, ArrowRight, Layers
} from 'lucide-react';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function TemplatesDropdown({ isActive, isOpen, setIsOpen }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const templateLinks = [
    {
      name: "All Templates",
      desc: "Explore our full catalog",
      url: "/templates",
      icon: LayoutTemplate,
      badge: "All",
      badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
    },
    {
      name: "Latest Templates",
      desc: "Freshly released modern designs",
      url: "/templates?sort=newest",
      icon: Sparkles,
      badge: "New",
      badgeColor: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
    },
    {
      name: "Popular Templates",
      desc: "Top rated & best selling themes",
      url: "/templates?sort=popular",
      icon: TrendingUp,
      badge: "Hot",
      badgeColor: "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
    },
    {
      name: "Free Templates",
      desc: "Open starter kits & components",
      url: "/templates?price=free",
      icon: Gift,
      badge: "Free",
      badgeColor: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
    },
    {
      name: "Premium Templates",
      desc: "Agency-grade production code",
      url: "/templates?price=premium",
      icon: Crown,
      badge: "Pro",
      badgeColor: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const handleSelect = (url) => {
    setIsOpen(false);
    navigate(url);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative cursor-pointer text-[13px] font-medium tracking-normal px-3 py-1.5 rounded-lg transition-colors duration-150 flex items-center gap-1.5 z-10 select-none",
          isActive
            ? "text-slate-950 dark:text-white font-semibold"
            : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
        )}
      >
        <LayoutTemplate className={cn("w-3.5 h-3.5 transition-colors", isActive ? "text-amber-500" : "text-slate-400")} />
        <span>Templates</span>
        <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform duration-200", isOpen && "rotate-180 text-slate-900 dark:text-white")} />

        {isActive && (
          <motion.div
            layoutId="activeNavPill"
            className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.08)] -z-10 border border-black/[0.04] dark:border-white/[0.08]"
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 32,
            }}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2.5 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3.5 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-amber-500" />
              Templates Catalog
            </span>
            <span className="text-[10px] text-slate-400 font-mono">5 Curations</span>
          </div>

          <div className="p-1.5 space-y-0.5">
            {templateLinks.map(link => {
              const Icon = link.icon;
              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => handleSelect(link.url)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/40 flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white">
                          {link.name}
                        </span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-full uppercase tracking-wider ${link.badgeColor}`}>
                          {link.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {link.desc}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    →
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-2 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/80">
            <Link 
              to="/templates" 
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50/60 dark:hover:bg-amber-950/40 rounded-xl transition-colors"
            >
              <span>Explore All Templates</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
