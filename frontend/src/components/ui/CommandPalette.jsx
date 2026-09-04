import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Loader2, LayoutTemplate, X, Code, MonitorSmartphone, 
  Sparkles, ArrowRight, Layers, Tag, ChevronRight, Check
} from 'lucide-react';
import { useTemplates } from '../../useTemplates';
import { useCurrency } from '../../CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_CHIPS = [
  'All', 'SaaS', 'E-commerce', 'Dashboards', 'Agency', 'UI Kits', 'Portfolio'
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();
  const { templates, loading } = useTemplates();
  const { formatPrice, convertPrice, currency } = useCurrency();
  const inputRef = useRef(null);

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
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const results = React.useMemo(() => {
    let filtered = templates;

    // Filter by active category chip if selected
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
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[99999] w-screen h-screen bg-white/98 dark:bg-slate-950/98 backdrop-blur-3xl flex flex-col overflow-hidden text-slate-900 dark:text-white"
        >
          {/* Top Bar: Title & Close Button */}
          <div className="w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl shrink-0">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-sm shadow-amber-500/20">
                  <Search className="w-4 h-4 text-slate-950" />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight text-slate-950 dark:text-white leading-none">
                    Search Marketplace
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    Find web templates, UI kits & full-stack starters
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer select-none"
                  aria-label="Close search"
                >
                  <span className="hidden sm:inline text-[10px] font-mono uppercase text-slate-400">ESC</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Hero Search Input Section */}
          <div className="w-full border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
            <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-8 pb-6">
              {/* Large Input Field */}
              <div className="relative flex items-center gap-4 bg-white dark:bg-slate-900 px-5 py-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-black/[0.03]">
                <Search className="w-6 h-6 text-amber-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type anything (e.g. SaaS, Dashboard, E-commerce, React, Agency)..."
                  className="w-full bg-transparent text-lg sm:text-2xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
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
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto px-4 sm:px-8 py-6"
          >
            <div className="max-w-6xl mx-auto w-full">
              {/* Results Status Header */}
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100 dark:border-slate-850">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {loading ? (
                    'Searching templates...'
                  ) : results.length > 0 ? (
                    query.trim() || activeCategory !== 'All' ? (
                      `Found ${results.length} matching template${results.length > 1 ? 's' : ''}`
                    ) : (
                      `Featured & Popular Templates (${results.length})`
                    )
                  ) : (
                    '0 results'
                  )}
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  Click any template to view details
                </span>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
                  <p className="text-xs text-slate-400">Fetching latest templates...</p>
                </div>
              )}

              {/* Results Grid */}
              {!loading && results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {results.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectTemplate(item.id)}
                      className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-white text-xs font-semibold flex items-center gap-1">
                            Explore Template <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        {item.category && (
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-slate-950 dark:text-white group-hover:text-amber-500 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                            {item.description || item.tag}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {item.tag || 'Web Template'}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results Empty State */}
              {!loading && results.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center justify-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500 mb-4">
                    <Search className="w-8 h-8 opacity-60" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    No matching templates found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                    We couldn't find any templates for "{query}". Try checking another category or try one of these suggestions:
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

          {/* Bottom Control / Info Bar */}
          <div className="w-full border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shrink-0">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 h-12 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-500">ESC</kbd>
                  to close
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-500">⌘K</kbd>
                  toggle anytime
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Bizleap Template Search Engine
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

