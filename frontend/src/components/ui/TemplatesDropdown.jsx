import React, { useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutTemplate, ChevronDown, Sparkles, TrendingUp, 
  Gift, Crown, ArrowRight, Layers
} from 'lucide-react';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function TemplatesDropdown({ isActive, isOpen, setIsOpen }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const templateLinks = [
    {
      name: "All Templates",
      desc: "Explore our full catalog",
      url: "/templates",
      icon: LayoutTemplate,
      badge: "All",
      badgeColor: "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
    },
    {
      name: "Latest Templates",
      desc: "Freshly released modern designs",
      url: "/templates?sort=newest",
      icon: Sparkles,
      badge: "New",
      badgeColor: "bg-black dark:bg-white text-white dark:text-black"
    },
    {
      name: "Popular Templates",
      desc: "Top rated & best selling themes",
      url: "/templates?sort=popular",
      icon: TrendingUp,
      badge: "Hot",
      badgeColor: "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
    },
    {
      name: "Free Templates",
      desc: "Open starter kits & components",
      url: "/templates?price=free",
      icon: Gift,
      badge: "Free",
      badgeColor: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
    },
    {
      name: "Premium Templates",
      desc: "Agency-grade production code",
      url: "/templates?price=premium",
      icon: Crown,
      badge: "Pro",
      badgeColor: "bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900"
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
            ? "text-black dark:text-white font-semibold"
            : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
        )}
      >
        <LayoutTemplate className={cn("w-3.5 h-3.5 transition-colors", isActive ? "text-black dark:text-white" : "text-neutral-400")} />
        <span>Templates</span>
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
        <div className="absolute left-0 mt-2.5 w-72 bg-white dark:bg-neutral-950 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-black dark:text-white" />
              Templates Catalog
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">5 Curations</span>
          </div>

          <div className="p-1.5 space-y-0.5">
            {templateLinks.map(link => {
              const Icon = link.icon;
              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => handleSelect(link.url)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-900 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-4 h-4 text-neutral-600 dark:text-neutral-400 group-hover:text-inherit transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white">
                          {link.name}
                        </span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-full uppercase tracking-wider ${link.badgeColor}`}>
                          {link.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {link.desc}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    →
                  </span>
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
