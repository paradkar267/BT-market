import React from 'react';
import { useCurrency } from '../../CurrencyContext';
import { Globe, ChevronDown } from 'lucide-react';

export function CurrencySelector() {
  const { currency, changeCurrency } = useCurrency();

  return (
    <div className="relative inline-flex items-center bg-slate-100/70 hover:bg-slate-100 dark:bg-slate-850/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl h-9 px-3 transition-colors group cursor-pointer">
      <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 mr-1.5 shrink-0 transition-colors" />
      <select 
        value={currency} 
        onChange={(e) => changeCurrency(e.target.value)}
        className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer appearance-none pr-3.5"
        aria-label="Select Currency"
      >
        <option value="INR" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">₹ INR</option>
        <option value="USD" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">$ USD</option>
        <option value="GBP" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">£ GBP</option>
      </select>
      <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none absolute right-2.5" />
    </div>
  );
}

