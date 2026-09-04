import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare } from 'lucide-react';
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
        className="flex items-center gap-0.5 bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800 p-1 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md"
      >
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => handleNavClick("Home", "/")}
          className={cn(
            "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors select-none cursor-pointer",
            activeTab === "Home"
              ? "text-black dark:text-white font-semibold"
              : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          )}
        >
          <Home className={cn("w-3.5 h-3.5 transition-colors", activeTab === "Home" ? "text-black dark:text-white" : "text-neutral-400")} />
          <span>Home</span>

          {activeTab === "Home" && (
            <motion.div
              layoutId="activeNavPill"
              className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.08)] -z-10 border border-black/[0.06] dark:border-white/[0.08]"
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

        {/* 5. Contact */}
        <button
          type="button"
          onClick={() => handleNavClick("Contact", "/contact")}
          className={cn(
            "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors select-none cursor-pointer",
            activeTab === "Contact"
              ? "text-black dark:text-white font-semibold"
              : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          )}
        >
          <MessageSquare className={cn("w-3.5 h-3.5 transition-colors", activeTab === "Contact" ? "text-black dark:text-white" : "text-neutral-400")} />
          <span>Contact</span>

          {activeTab === "Contact" && (
            <motion.div
              layoutId="activeNavPill"
              className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.08)] -z-10 border border-black/[0.06] dark:border-white/[0.08]"
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
