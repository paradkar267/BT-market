import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ className = '' }) => {
  return (
    <Link 
      to='/' 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`flex items-center gap-2.5 cursor-pointer group shrink-0 select-none ${className}`}
      aria-label="Bizleap Home"
    >
      {/* Brand Icon Mark */}
      <div className="relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black shadow-xs group-hover:scale-105 transition-all duration-200">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-4 h-4 md:w-5 md:h-5"
        >
          {/* Growth bars + Leap Arrow */}
          <path d="M4 20h16" strokeWidth="2" opacity="0.6" />
          <path d="M7 16v-3" />
          <path d="M12 16v-7" />
          <path d="M17 16v-10" />
          <path d="M13 5l4-1 1 4" strokeWidth="2.5" />
          <path d="M6 14l5-5 6-3" strokeWidth="2" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg md:text-xl font-black tracking-tight text-black dark:text-white leading-none">
          BIZLEAP
        </span>
        <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md leading-none">
          MARKET
        </span>
      </div>
    </Link>
  );
};
