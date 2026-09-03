import React from 'react';
import { useCurrency } from '../../CurrencyContext';
import { Globe } from 'lucide-react';

export function CurrencySelector() {
  const { currency, changeCurrency } = useCurrency();

  return (
    <div className="relative flex items-center bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full px-2.5 py-1.5 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <Globe className="w-3.5 h-3.5 text-gray-400 mr-1.5 shrink-0" />
      <select 
        value={currency} 
        onChange={(e) => changeCurrency(e.target.value)}
        className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer appearance-none pr-4"
        style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0 center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
      >
        <option value="INR" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">₹ INR</option>
        <option value="USD" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">$ USD</option>
        <option value="GBP" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">£ GBP</option>
      </select>
    </div>
  );
}
