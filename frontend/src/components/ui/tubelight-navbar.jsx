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
        "flex items-center gap-0.5 bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-800 p-1 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md",
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
              "relative cursor-pointer text-[13px] font-medium tracking-normal px-3 py-1.5 rounded-lg transition-colors duration-150 z-10 flex items-center gap-1.5 select-none",
              isActive
                ? "text-slate-950 dark:text-white font-semibold"
                : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            {Icon && <Icon className={cn("w-3.5 h-3.5 transition-colors", isActive ? "text-black dark:text-white" : "text-neutral-400")} />}
            <span>{item.label || item.name}</span>

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
        );
      })}
      {children}
    </nav>

  );
}

