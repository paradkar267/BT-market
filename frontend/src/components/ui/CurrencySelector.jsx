import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../../CurrencyContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

export function CurrencySelector() {
  const { currency, changeCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', label: '₹ INR' },
    { code: 'USD', symbol: '$', name: 'US Dollar', label: '$ USD' },
    { code: 'GBP', symbol: '£', name: 'British Pound', label: '£ GBP' }
  ];

  const currentOption = currencies.find(c => c.code === currency) || currencies[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    changeCurrency(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Custom Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-9 px-3 bg-neutral-100/80 hover:bg-neutral-200/70 dark:bg-neutral-900/80 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 rounded-xl transition-all duration-150 cursor-pointer select-none group"
        aria-label="Select Currency"
      >
        <Globe className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors shrink-0" />
        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors">
          {currentOption.label}
        </span>
        <ChevronDown 
          className={`w-3 h-3 text-neutral-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-black dark:text-white' : ''}`} 
        />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 p-1.5 space-y-0.5">
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            Select Currency
          </div>

          {currencies.map((c) => {
            const isSelected = c.code === currency;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => handleSelect(c.code)}
                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer group ${
                  isSelected
                    ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center font-bold">{c.symbol}</span>
                  <span>{c.code}</span>
                  <span className={`text-[10px] truncate ${isSelected ? 'text-white/70 dark:text-black/70' : 'text-neutral-400'}`}>
                    • {c.name}
                  </span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
