import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Loader2, LayoutTemplate, X, Code, MonitorSmartphone, 
  Sparkles, ArrowRight, Layers, Tag, ChevronRight, Check, ExternalLink,
  Flame, Filter, Eye, Compass
} from 'lucide-react';
import { useTemplates } from '../../useTemplates';
import { useCurrency } from '../../CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_CHIPS = [
  'All', 'SaaS', 'E-commerce', 'Dashboards', 'Agency', 'UI Kits', 'Portfolio'
];

const TRENDING_SEARCHES = [
  'SaaS', 'Dashboard', 'Next.js', 'E-commerce', 'Agency', 'React'
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
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
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
    let filtered = templates;

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[99999] w-screen h-screen bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl flex flex-col overflow-hidden text-slate-900 dark:text-white select-none"
        >
          {/* Ambient Lighting Gradient Beams */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-40 right-10 w-[400px] h-[300px] bg-indigo-500/5 blur-3xl pointer-events-none -z-10" />

          {/* Top Bar: Title & Close Button */}
          <div className="w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shrink-0">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 shadow-sm shadow-amber-500/30">
                  <Compass className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black tracking-tight text-slate-950 dark:text-white leading-none">
                      BIZLEAP SEARCH
                    </h2>
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-800/60 rounded-md">
                      EXPLORER
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    Search 50+ hand-crafted React, Next.js & UI Kit templates
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer select-none group"
                  aria-label="Close search"
                >
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white">ESC</span>
                  <X className="w-4 h-4 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          </div>

          {/* Hero Search Input Section */}
          <div className="w-full border-b border-slate-200/60 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
            <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-8 pb-6">
              {/* Large Tactile Input Field */}
              <div className="relative flex items-center gap-4 bg-white dark:bg-slate-900 px-5 py-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.03] focus-within:ring-4 focus-within:ring-amber-500/15 focus-within:border-amber-500/50 transition-all">
                <Search className="w-6 h-6 text-amber-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type anything (e.g. SaaS, Dashboard, React, E-commerce, Agency)..."
                  className="w-full bg-transparent text-lg sm:text-2xl font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <span className="hidden sm:inline-flex items-center px-2 py-1 text-[11px] font-mono font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shrink-0">
                  {results.length} found
                </span>
              </div>

              {/* Trending Searches Row */}
              <div className="flex items-center gap-2 mt-3.5 text-xs text-slate-500 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Trending:
                </span>
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      setActiveCategory('All');
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200/80 dark:border-slate-800 transition-colors shrink-0 cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
                  Filters:
                </span>
                {CATEGORY_CHIPS.map((cat) => {
                  const isSelected = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results Area (Fullscreen Scrollable Grid) */}
          <div 
            ref={resultsContainerRef}
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto px-4 sm:px-8 py-6"
          >
            <div className="max-w-6xl mx-auto w-full">
              {/* Results Status Header */}
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100 dark:border-slate-850">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {loading ? (
                    'Searching templates...'
                  ) : results.length > 0 ? (
                    query.trim() || activeCategory !== 'All' ? (
                      `Found ${results.length} matching template${results.length > 1 ? 's' : ''}`
                    ) : (
                      `Featured & Popular Templates (${results.length})`
                    )
                  ) : (
                    '0 results found'
                  )}
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  Use ↑ ↓ arrow keys and hit Enter to view
                </span>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
                  <p className="text-xs text-slate-400">Loading catalog...</p>
                </div>
              )}

              {/* Results Grid */}
              {!loading && results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {results.map((item, index) => {
                    const isSelected = selectedIndex === index;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectTemplate(item.id)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                          isSelected
                            ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-xl scale-[1.01]'
                            : 'border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 shadow-xs hover:shadow-lg'
                        }`}
                      >
                        {/* Thumbnail Container */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                            <span className="text-white text-xs font-semibold flex items-center gap-1">
                              View Template <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                            {item.previewUrl && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(item.previewUrl, '_blank');
                                }}
                                className="px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                Demo
                              </button>
                            )}
                          </div>
                          {item.category && (
                            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                              {item.category}
                            </span>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-4 flex flex-col flex-1 justify-between">
                          <div>
                            <h3 className="font-bold text-sm text-slate-950 dark:text-white group-hover:text-amber-500 transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                              {item.description || item.tag}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                              <Tag className="w-3 h-3 text-amber-500/70" />
                              {item.tag || 'Template'}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* No Results Empty State */}
              {!loading && results.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center justify-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500 mb-4 shadow-sm">
                    <Search className="w-8 h-8 opacity-60" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    No matching templates found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                    We couldn't find any templates for "{query}". Try one of these popular terms:
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
                        className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        "{term}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Control / Status Bar */}
          <div className="w-full border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shrink-0">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 h-12 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-500">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-500">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-500">ENTER</kbd>
                  to open
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-500">ESC</kbd>
                  to exit
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                Bizleap Instant Search • Press ⌘K anytime
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
