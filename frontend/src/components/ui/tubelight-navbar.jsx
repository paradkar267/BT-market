import React, { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function NavBar({ items, className, activeTab: externalActiveTab, onChange, children }) {
  const [internalActiveTab, setInternalActiveTab] = useState(items[0].name)
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;

  return (
    <div
      className={cn(
        "flex items-center gap-3 bg-white/50 dark:bg-black/50 border border-black/5 dark:border-white/10 backdrop-blur-lg py-1 px-1 rounded-full shadow-sm",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.name

        return (
          <div
            key={item.name}
            onClick={() => {
              if (onChange) onChange(item.name);
              else setInternalActiveTab(item.name);
              
              if (item.url && item.url.startsWith('#')) {
                 const el = document.getElementById(item.url.substring(1));
                 if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className={cn(
              "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
              "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white",
              isActive && "bg-gray-100/50 dark:bg-white/10 text-black dark:text-white",
            )}
          >
            <span className="hidden md:inline">{item.name}</span>
            <span className="md:hidden">
              <Icon size={18} strokeWidth={2.5} />
            </span>
            {isActive && (
              <motion.div
                layoutId="lamp"
                className="absolute inset-0 w-full bg-gray-100/50 dark:bg-white/5 rounded-full -z-10"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-black dark:bg-white rounded-t-full">
                  <div className="absolute w-12 h-6 bg-black/10 dark:bg-white/10 rounded-full blur-md -top-2 -left-2" />
                  <div className="absolute w-8 h-6 bg-black/10 dark:bg-white/10 rounded-full blur-md -top-1" />
                  <div className="absolute w-4 h-4 bg-black/10 dark:bg-white/10 rounded-full blur-sm top-0 left-2" />
                </div>
              </motion.div>
            )}
          </div>
        )
      })}
      {children}
    </div>
  )
}
