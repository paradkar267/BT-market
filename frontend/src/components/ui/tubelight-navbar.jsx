import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function NavBar({ items, className, activeTab: externalActiveTab, onChange, children }) {
  const [internalActiveTab, setInternalActiveTab] = useState(items[0]?.name || "");
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;

  return (
    <nav
      aria-label="Main Navigation"
      className={cn(
        "flex items-center gap-1 bg-gray-100/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 p-1 rounded-full shadow-sm backdrop-blur-md",
        className
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.name;

        return (
          <button
            key={item.name}
            type="button"
            onClick={() => {
              if (onChange) onChange(item.name);
              else setInternalActiveTab(item.name);

              if (item.url && item.url.startsWith("#")) {
                const el = document.getElementById(item.url.substring(1));
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className={cn(
              "relative cursor-pointer text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full transition-colors z-10 flex items-center gap-1.5",
              isActive
                ? "text-gray-900 dark:text-white"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{item.name}</span>

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
        );
      })}
      {children}
    </nav>
  );
}
