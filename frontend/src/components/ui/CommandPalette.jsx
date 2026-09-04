import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Loader2, LayoutTemplate, X, Code, MonitorSmartphone, 
  Sparkles, ArrowRight, Layers, Tag, ChevronRight, Check, ExternalLink,
  Flame, Filter, Eye, Compass, CornerDownLeft
} from 'lucide-react';
import { useTemplates } from '../../useTemplates';
import { useCurrency } from '../../CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_CHIPS = [
  'All', 'SaaS', 'E-commerce', 'Dashboards', 'Agency', 'UI Kits', 'Portfolio'
];

const TRENDING_SEARCHES = [
  'SaaS', 'Dashboard', 'Next.js', 'E-commerce', 'Agency', 'React', 'Portfolio'
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { templates, loading } = useTemplates();
  const { formatPrice } = useCurrency();
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Toggle Command Palette on Cmd/Ctrl + K and handle Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    const handleOpenCommandPalette = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpenCommandPalette);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpenCommandPalette);
    };
  }, [isOpen]);

  // Focus input and lock scroll on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setActiveCategory('All');
      setSelectedIndex(0);
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Filter results
  const results = useMemo(() => {
    let filtered = templates || [];

    // Filter by active category
    if (activeCategory !== 'All') {
      filtered = filtered.filter(
        (t) => t.category === activeCategory || t.tag === activeCategory
      );
    }

    // Filter by search query
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(' ').filter(Boolean);
      filtered = filtered.filter((item) => {
        const searchableText = `${item.title || ''} ${item.category || ''} ${item.tag || ''} ${(item.keywords || []).join(' ')} ${item.description || ''}`.toLowerCase();
        return searchTerms.every((term) => searchableText.includes(term));
      });
    }

    return filtered;
  }, [query, activeCategory, templates]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle Keyboard Navigation (Arrow keys & Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleNavKeys = (e) => {
      if (results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          handleSelectTemplate(selected.id);
        }
      }
    };

    window.addEventListener('keydown', handleNavKeys);
    return () => window.removeEventListener('keydown', handleNavKeys);
  }, [isOpen, results, selectedIndex]);

  const handleSelectTemplate = (templateId) => {
    setIsOpen(false);
    navigate(`/product/${templateId}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed inset-0 z-[999999] w-screen h-screen min-h-screen bg-white dark:bg-black flex flex-col overflow-hidden text-black dark:text-white select-none"
        >
          {/* Top Fullscreen Header */}
          <header className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-black/90 backdrop-blur-xl shrink-0">
            <div className="w-full px-4 sm:px-8 lg:px-14 h-16 sm:h-18 flex items-center justify-between">
              {/* Brand & Explorer Badge */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-xs">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-black tracking-tight text-black dark:text-white leading-none">
                      BIZLEAP SEARCH
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md">
                      EXPLORE
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
                    Explore 50+ production-grade React, Next.js & UI Kit templates
                  </p>
                </div>
              </div>

              {/* Close Action Controls */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-xs sm:text-sm font-bold text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 transition-all cursor-pointer select-none group shadow-xs"
                  aria-label="Close search"
                >
                  <span className="text-[11px] font-mono font-bold uppercase text-neutral-400 group-hover:text-black dark:group-hover:text-white">
                    ESC
                  </span>
                  <X className="w-4 h-4 text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          </header>

          {/* Full-Width Search & Filter Bar */}
          <div className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70 shrink-0">
            <div className="w-full px-4 sm:px-8 lg:px-14 py-5 sm:py-6">
              {/* Full Width Search Input */}
              <div className="relative flex items-center gap-4 bg-white dark:bg-neutral-900 px-5 sm:px-7 py-4 sm:py-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-[0_10px_30px_rgba(0,0,0,0.04)] focus-within:ring-4 focus-within:ring-black/10 dark:focus-within:ring-white/10 focus-within:border-black dark:focus-within:border-white transition-all">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-black dark:text-white shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search templates (e.g. SaaS, Dashboard, React, E-commerce, Agency)..."
                  className="w-full bg-transparent text-lg sm:text-2xl lg:text-3xl font-semibold text-black dark:text-white placeholder:text-neutral-400 placeholder:font-normal outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="p-2 rounded-xl text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <span className="hidden sm:inline-flex items-center px-3 py-1 text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shrink-0">
                  {results.length} found
                </span>
              </div>

              {/* Filters & Trending Row Spanning Edge-to-Edge */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                {/* Category Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1 shrink-0 flex items-center gap-1">
                    <Filter className="w-3 h-3 text-black dark:text-white" />
                    Categories:
                  </span>
                  {CATEGORY_CHIPS.map((cat) => {
                    const isSelected = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                            : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Trending Search Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <Flame className="w-3.5 h-3.5 text-black dark:text-white" />
                    Popular:
                  </span>
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        setActiveCategory('All');
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white border border-neutral-200 dark:border-neutral-800 transition-colors shrink-0 cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid Spanning Full Width */}
          <div 
            ref={resultsContainerRef}
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto w-full px-4 sm:px-8 lg:px-14 py-6"
          >
            {/* Results Status Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-200 dark:border-neutral-850">
              <span className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black dark:text-white" />
                {loading ? (
                  'Searching templates...'
                ) : results.length > 0 ? (
                  query.trim() || activeCategory !== 'All' ? (
                    `Found ${results.length} template${results.length > 1 ? 's' : ''} matching your search`
                  ) : (
                    `All Featured & Popular Templates (${results.length})`
                  )
                ) : (
                  '0 results found'
                )}
              </span>
              <span className="text-xs text-neutral-400 font-mono hidden sm:inline-flex items-center gap-1.5">
                <span>Use keyboard</span>
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px]">↓</kbd>
                <span>and</span>
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px]">Enter</kbd>
                <span>to view</span>
              </span>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-28">
                <Loader2 className="w-9 h-9 animate-spin text-black dark:text-white mb-3" />
                <p className="text-xs text-neutral-400 font-medium">Loading catalog...</p>
              </div>
            )}

            {/* Full-Width Grid of Templates */}
            {!loading && results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 sm:gap-6 w-full">
                {results.map((item, index) => {
                  const isSelected = selectedIndex === index;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectTemplate(item.id)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`group flex flex-col bg-white dark:bg-neutral-900 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                        isSelected
                          ? 'border-black dark:border-white ring-2 ring-black/20 dark:ring-white/20 shadow-xl scale-[1.01]'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white shadow-xs hover:shadow-lg'
                      }`}
                    >
                      {/* Card Thumbnail */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                          <span className="text-white text-xs font-bold flex items-center gap-1">
                            Explore <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                          {item.previewUrl && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(item.previewUrl, '_blank');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white/25 hover:bg-white/40 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              Live Demo
                            </button>
                          )}
                        </div>
                        {item.category && (
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* Card Info */}
                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-black dark:text-white transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                            {item.description || item.tag}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                          <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-neutral-400" />
                            {item.tag || 'Template'}
                          </span>
                          <span className="text-xs font-black text-black dark:text-white">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty Search State */}
            {!loading && results.length === 0 && (
              <div className="py-24 text-center flex flex-col items-center justify-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 mb-4 shadow-sm">
                  <Search className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="text-lg font-bold text-black dark:text-white mb-1">
                  No matching templates found
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                  We couldn't find any templates for "{query}". Try checking another category or click one of these popular terms:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {['SaaS', 'React', 'Dashboard', 'Next.js', 'E-commerce'].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        setActiveCategory('All');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-bold text-black dark:text-white transition-colors cursor-pointer"
                    >
                      "{term}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Full-Width Footer Status */}
          <footer className="w-full border-t border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-black/90 backdrop-blur-xl shrink-0">
            <div className="w-full px-4 sm:px-8 lg:px-14 h-12 flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-[10px] text-neutral-700 dark:text-neutral-300">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-[10px] text-neutral-700 dark:text-neutral-300">↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <kbd className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-[10px] text-neutral-700 dark:text-neutral-300">ENTER</kbd>
                  to open
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-[10px] text-neutral-700 dark:text-neutral-300">ESC</kbd>
                  to close
                </span>
              </div>
              <span className="text-[11px] font-bold text-neutral-400 hidden sm:inline">
                Bizleap Discovery Engine • Press ⌘K or Ctrl+K anytime
              </span>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
