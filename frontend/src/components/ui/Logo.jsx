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
      <div className="relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-slate-950 shadow-sm shadow-amber-500/25 group-hover:shadow-md group-hover:shadow-amber-500/35 group-hover:scale-105 transition-all duration-200">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-4 h-4 md:w-5 md:h-5 text-black"
        >
          {/* Growth bars + Leap Arrow */}
          <path d="M4 20h16" strokeWidth="2" opacity="0.6" />
          <path d="M7 16v-3" />
          <path d="M12 16v-7" />
          <path d="M17 16v-10" />
          <path d="M13 5l4-1 1 4" strokeWidth="2.5" />
          <path d="M6 14l5-5 6-3" strokeWidth="2" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
      </div>

      {/* Brand Wordmark */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
          BIZ<span className="text-amber-500">LEAP</span>
        </span>
        <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 rounded-md leading-none">
          MARKET
        </span>
      </div>
    </Link>
  );
};

