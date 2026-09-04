import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutGrid, ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import { useTemplates } from '../../useTemplates';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function CategoryDropdown({ isActive, isOpen, setIsOpen }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { templates } = useTemplates();

  // Extract unique business tags from templates
  const predefinedTags = [
    "SaaS", "E-commerce", "Agency", "Dashboards", "Business", 
    "Startup", "Portfolio", "UI Kits", "Fashion & Clothing", 
    "Electronics", "Marketplace", "Corporate"
  ];
  const tags = Array.from(new Set([...predefinedTags, ...templates.map(t => t.tag).filter(Boolean)]));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const handleSelect = (tag) => {
    setIsOpen(false);
    const targetPath = location.pathname.startsWith('/ui-kits') ? '/ui-kits' : '/templates';
    navigate(`${targetPath}?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative cursor-pointer text-[13px] font-medium tracking-normal px-3.5 py-1.5 rounded-full transition-colors duration-150 flex items-center gap-1.5 z-10 select-none",
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
            className="absolute inset-0 bg-white dark:bg-slate-900 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08)] -z-10 border border-black/[0.04] dark:border-white/[0.08]"
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 32,
            }}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3.5 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Browse by Industry
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{tags.length} topics</span>
          </div>

          <div className="p-1.5 max-h-72 overflow-y-auto overscroll-none space-y-0.5" style={{ scrollbarWidth: 'thin' }}>
            {tags.length > 0 ? (
              tags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSelect(tag)}
                  className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white transition-colors flex items-center justify-between group"
                >
                  <span>{tag}</span>
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-slate-400">Loading...</div>
            )}
          </div>

          <div className="p-2 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/80">
            <Link 
              to="/templates" 
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50/60 dark:hover:bg-amber-950/40 rounded-xl transition-colors"
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

