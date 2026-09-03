import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, ChevronDown } from 'lucide-react';
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
    "Business", "Corporate", "Startup", "Agency", "SaaS", "E-commerce", 
    "Fashion & Clothing", "Jewelry", "Electronics", "Furniture", 
    "Beauty & Cosmetics", "Grocery", "Marketplace", "Portfolio"
  ];
  const tags = Array.from(new Set([...predefinedTags, ...templates.map(t => t.tag).filter(Boolean)])).sort();

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
          "relative cursor-pointer text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 z-10",
          isActive
            ? "text-gray-900 dark:text-white"
            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        )}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>CATEGORIES</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />

        {isActive && (
          <motion.div
            layoutId="activeNavPill"
            className="absolute inset-0 bg-white dark:bg-gray-900 rounded-full shadow-sm -z-10 border border-black/[0.04] dark:border-white/[0.08]"
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-1.5 max-h-64 overflow-y-auto overscroll-none" style={{ scrollbarWidth: 'thin' }}>
            <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Filter by Industry
            </div>
            {tags.length > 0 ? (
              tags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSelect(tag)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors"
                >
                  {tag}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-400">Loading...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
