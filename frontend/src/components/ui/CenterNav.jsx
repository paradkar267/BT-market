import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Info, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TemplatesDropdown } from './TemplatesDropdown';
import { CategoryDropdown } from './CategoryDropdown';

export function CenterNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const params = new URLSearchParams(location.search);
  
  // Determine active tab based on current path and search params
  let activeTab = "";
  if (isTemplatesOpen) {
    activeTab = "Templates";
  } else if (isCategoryOpen || params.get("tag")) {
    activeTab = "Categories";
  } else if (location.pathname === "/") {
    activeTab = "Home";
  } else if (location.pathname === "/templates") {
    activeTab = "Templates";
  } else if (location.pathname === "/about") {
    activeTab = "About Us";
  } else if (location.pathname === "/contact") {
    activeTab = "Contact";
  }

  const handleNavClick = (name, path) => {
    setIsTemplatesOpen(false);
    setIsCategoryOpen(false);
    navigate(path);
  };

  return (
    <div className="hidden md:flex items-center justify-center">
      <nav
        aria-label="Main Navigation"
        className="flex items-center gap-0.5 bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-800 p-1 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md"
      >
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => handleNavClick("Home", "/")}
          className={cn(
            "relative cursor-pointer text-[13px] font-medium tracking-normal px-3 py-1.5 rounded-lg transition-colors duration-150 flex items-center gap-1.5 z-10 select-none",
            activeTab === "Home"
              ? "text-slate-950 dark:text-white font-semibold"
              : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          )}
        >
          <Home className={cn("w-3.5 h-3.5 transition-colors", activeTab === "Home" ? "text-amber-500" : "text-slate-400")} />
          <span>Home</span>

          {activeTab === "Home" && (
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

        {/* 2. Templates Dropdown */}
        <TemplatesDropdown 
          isActive={activeTab === "Templates"} 
          isOpen={isTemplatesOpen} 
          setIsOpen={(open) => {
            if (open) setIsCategoryOpen(false);
            setIsTemplatesOpen(open);
          }} 
        />

        {/* 3. Categories Dropdown */}
        <CategoryDropdown 
          isActive={activeTab === "Categories"} 
          isOpen={isCategoryOpen} 
          setIsOpen={(open) => {
            if (open) setIsTemplatesOpen(false);
            setIsCategoryOpen(open);
          }} 
        />

        {/* 4. About Us */}
        <button
          type="button"
          onClick={() => handleNavClick("About Us", "/about")}
          className={cn(
            "relative cursor-pointer text-[13px] font-medium tracking-normal px-3 py-1.5 rounded-lg transition-colors duration-150 flex items-center gap-1.5 z-10 select-none",
            activeTab === "About Us"
              ? "text-slate-950 dark:text-white font-semibold"
              : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          )}
        >
          <Info className={cn("w-3.5 h-3.5 transition-colors", activeTab === "About Us" ? "text-amber-500" : "text-slate-400")} />
          <span>About Us</span>

          {activeTab === "About Us" && (
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

        {/* 5. Contact */}
        <button
          type="button"
          onClick={() => handleNavClick("Contact", "/contact")}
          className={cn(
            "relative cursor-pointer text-[13px] font-medium tracking-normal px-3 py-1.5 rounded-lg transition-colors duration-150 flex items-center gap-1.5 z-10 select-none",
            activeTab === "Contact"
              ? "text-slate-950 dark:text-white font-semibold"
              : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          )}
        >
          <MessageSquare className={cn("w-3.5 h-3.5 transition-colors", activeTab === "Contact" ? "text-amber-500" : "text-slate-400")} />
          <span>Contact</span>

          {activeTab === "Contact" && (
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
      </nav>
    </div>
  );
}
