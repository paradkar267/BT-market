import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutGrid, ChevronDown, ArrowRight, Sparkles,
  Briefcase, Layers, ShoppingBag, User, Building2,
  Monitor, LayoutDashboard, Database, MoreHorizontal
} from 'lucide-react';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function CategoryDropdown({ isActive, isOpen, setIsOpen }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 9 categories as requested
  const categoriesList = [
    { name: "Business", tag: "Business", icon: Briefcase, desc: "Corporate & enterprise" },
    { name: "SaaS", tag: "SaaS", icon: Layers, desc: "Software & cloud apps" },
    { name: "E-commerce", tag: "E-Commerce", icon: ShoppingBag, desc: "Stores & marketplaces" },
    { name: "Portfolio", tag: "Portfolio", icon: User, desc: "Creative & personal" },
    { name: "Agency", tag: "Agency", icon: Building2, desc: "Studio & marketing" },
    { name: "Landing Page", tag: "Landing Page", icon: Monitor, desc: "High conversion lead gen" },
    { name: "Admin Dashboard", tag: "Dashboard", icon: LayoutDashboard, desc: "Analytics & control" },
    { name: "CRM / Software", tag: "CRM", icon: Database, desc: "Operations & tools" },
    { name: "Other", tag: "Other", icon: MoreHorizontal, desc: "Specialty & niche templates" }
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

  const handleSelect = (category) => {
    setIsOpen(false);
    if (category.name === "Other") {
      navigate('/templates');
    } else {
      navigate(`/templates?tag=${encodeURIComponent(category.tag)}`);
    }
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
        <LayoutGrid className={cn("w-3.5 h-3.5 transition-colors", isActive ? "text-amber-500" : "text-slate-400")} />
        <span>Categories</span>
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
        <div className="absolute left-1/2 -translate-x-1/2 mt-2.5 w-[380px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Browse by Industry
            </span>
            <span className="text-[10px] text-slate-400 font-mono">9 Categories</span>
          </div>

          <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-[360px] overflow-y-auto overscroll-none" style={{ scrollbarWidth: 'thin' }}>
            {categoriesList.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleSelect(cat)}
                  className="w-full text-left p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white transition-all flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/40 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold block truncate text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                      {cat.desc}
                    </span>
                  </div>
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
