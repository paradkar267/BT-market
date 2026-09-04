import React, { useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
            ? "text-black dark:text-white font-semibold"
            : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
        )}
      >
        <LayoutGrid className={cn("w-3.5 h-3.5 transition-colors", isActive ? "text-black dark:text-white" : "text-neutral-400")} />
        <span>Categories</span>
        <ChevronDown className={cn("w-3 h-3 text-neutral-400 transition-transform duration-200", isOpen && "rotate-180 text-black dark:text-white")} />

        {isActive && (
          <motion.div
            layoutId="activeNavPill"
            className="absolute inset-0 bg-white dark:bg-neutral-900 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.08)] -z-10 border border-black/[0.06] dark:border-white/[0.08]"
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 32,
            }}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2.5 w-[380px] bg-white dark:bg-neutral-950 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-black dark:text-white" />
              Browse by Industry
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">9 Categories</span>
          </div>

          <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-[360px] overflow-y-auto overscroll-none" style={{ scrollbarWidth: 'thin' }}>
            {categoriesList.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleSelect(cat)}
                  className="w-full text-left p-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white transition-all flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-900 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 group-hover:text-inherit transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold block truncate text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block truncate">
                      {cat.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-2 bg-neutral-50 dark:bg-neutral-900/40 border-t border-neutral-100 dark:border-neutral-800">
            <Link 
              to="/templates" 
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
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
