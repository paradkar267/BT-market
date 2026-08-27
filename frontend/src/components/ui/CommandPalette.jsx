import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, LayoutTemplate, X, Code, MonitorSmartphone } from 'lucide-react';
import { useTemplates } from '../../useTemplates';
import { motion, AnimatePresence } from 'framer-motion';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { templates, loading } = useTemplates();
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
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    
    // Prevent background scrolling
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const results = React.useMemo(() => {
    if (!query) return templates.slice(0, 6);
    
    const searchTerms = query.toLowerCase().split(' ').filter(Boolean);
    
    return templates.filter((item) => {
      const searchableText = `${item.title || ''} ${item.category || ''} ${item.tag || ''} ${(item.keywords || []).join(' ')} ${item.description || ''}`.toLowerCase();
      // All search terms must be found somewhere in the searchable text
      return searchTerms.every(term => searchableText.includes(term));
    });
  }, [query, templates]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-2xl relative bg-white/90 dark:bg-[#0F0F11]/90 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden border border-black/5 dark:border-white/10 ring-1 ring-white/20 dark:ring-white/5"
          >
            <div className="flex items-center px-6 py-5 border-b border-black/5 dark:border-white/5">
              <Search className="w-5 h-5 text-gray-400 mr-4 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates, UI kits, UI components..."
                className="flex-1 bg-transparent border-none outline-none text-xl text-gray-900 dark:text-white placeholder:text-gray-400/80 font-medium"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-4"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div data-lenis-prevent="true" className="max-h-[60vh] overflow-y-auto overscroll-contain p-3 scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : results.length > 0 ? (
                <div className="flex flex-col space-y-1">
                  <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                    {query ? 'Search Results' : 'Suggestions'}
                  </div>
                  {results.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setIsOpen(false);
                        setQuery('');
                        navigate(`/product/${item.id}`);
                      }}
                      className="w-full text-left px-3 py-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 flex items-center gap-4 group"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-black/50 border border-black/5 dark:border-white/5 relative">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-gray-900 dark:text-white font-bold text-base truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1.5">
                            {item.category === 'React' || item.category === 'Next.js' ? (
                              <Code className="w-3.5 h-3.5 opacity-70" />
                            ) : item.category === 'Figma' ? (
                              <LayoutTemplate className="w-3.5 h-3.5 opacity-70" />
                            ) : (
                              <MonitorSmartphone className="w-3.5 h-3.5 opacity-70" />
                            )}
                            {item.category}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                          <span>{item.tag}</span>
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center text-gray-400 dark:text-gray-500 text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        View Details
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                  <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 opacity-40" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">No results found</p>
                  <p className="text-sm">We couldn't find anything matching "{query}".</p>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50/50 dark:bg-black/20 backdrop-blur-md border-t border-black/5 dark:border-white/5 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-6 text-xs font-medium text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <kbd className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-sm font-sans font-bold text-[10px]">↑</kbd>
                    <kbd className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-sm font-sans font-bold text-[10px]">↓</kbd>
                  </div>
                  navigate
                </span>
                <span className="flex items-center gap-2">
                  <kbd className="px-2 h-5 flex items-center justify-center rounded bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-sm font-sans font-bold text-[10px]">enter</kbd>
                  to select
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500">
                <kbd className="px-2 h-5 flex items-center justify-center rounded bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-sm font-sans font-bold text-[10px]">esc</kbd>
                to close
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
