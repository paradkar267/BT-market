import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, ArrowLeft, Filter, X, LayoutTemplate } from 'lucide-react';
import { useCart } from './CartContext';
import { useTemplates } from './useTemplates';
import { DenseCard } from './Home';
import { SkeletonCard } from './components/ui/Skeleton';
import UserMenu from './UserMenu';
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { Logo } from './components/ui/Logo';
import { CenterNav } from './components/ui/CenterNav';
import SEO from './components/SEO';
import { useCurrency } from './CurrencyContext';

export default function TemplatesPage() {
  const { cartItems } = useCart();
  const { theme } = useTheme();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === 'dark';
  const { formatPrice, convertPrice, currency } = useCurrency();
  
  const searchParams = new URLSearchParams(location.search);
  const paramTech = searchParams.get('tech') || searchParams.get('category');
  const paramTag = searchParams.get('tag') || "";
  const paramSearch = searchParams.get('search') || searchParams.get('q') || "";

  const [searchQuery, setSearchQuery] = useState(() => paramSearch);
  const [selectedTechs, setSelectedTechs] = useState(() => paramTech ? [paramTech] : []);
  const [selectedTag, setSelectedTag] = useState(() => paramTag);
  const [priceRange, setPriceRange] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const activeTag = selectedTag || paramTag;
  const activeTechs = selectedTechs.length > 0 ? selectedTechs : (paramTech ? [paramTech] : []);

  const { templates, loading } = useTemplates();

  // Extract unique tech categories automatically from templates
  const allTechs = useMemo(() => {
    if (!templates.length) return ["Figma", "Next.js", "React", "Webflow", "Tailwind", "Shopify", "React Native", "Framer"];
    const techs = new Set(templates.map(t => t.category));
    return Array.from(techs).sort();
  }, [templates]);

  const toggleTech = (tech) => {
    setSelectedTechs(prev => 
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      // Tech category filter (multi-select)
      const matchesTech = activeTechs.length === 0 || activeTechs.includes(t.category);

      // Tag filter (Single-select OR smart search)
      let matchesTag = true;
      if (activeTag) {
        const tagLower = activeTag.toLowerCase();
        const tagWords = tagLower.split(/[\s&,-]+/).filter(w => w.length > 2);
        
        const titleL = (t.title || '').toLowerCase();
        const descL = (t.description || '').toLowerCase();
        const catL = (t.category || '').toLowerCase();
        const tTagL = (t.tag || '').toLowerCase();
        const kwL = (t.keywords || []).map(k => String(k).toLowerCase());

        const directMatch = tTagL === tagLower || catL === tagLower || titleL.includes(tagLower) || descL.includes(tagLower) || kwL.some(k => k.includes(tagLower));
        const wordMatch = tagWords.length > 0 && tagWords.some(w => titleL.includes(w) || tTagL.includes(w) || catL.includes(w) || kwL.some(k => k.includes(w)));
        
        matchesTag = directMatch || wordMatch;
      }
      
      // Price filter (compare in converted currency)
      const convertedPrice = convertPrice(parseFloat(t.price));
      const low = convertPrice(6000);
      const high = convertPrice(8000);
      let matchesPrice = true;
      if (priceRange === "free") matchesPrice = convertedPrice === 0;
      else if (priceRange === "under6000") matchesPrice = convertedPrice > 0 && convertedPrice < low;
      else if (priceRange === "6000to8000") matchesPrice = convertedPrice >= low && convertedPrice <= high;
      else if (priceRange === "over8000") matchesPrice = convertedPrice > high;

      // Search filter
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(Boolean);
      const searchableText = `${t.title || ''} ${t.author || ''} ${t.description || ''} ${t.category || ''} ${t.tag || ''} ${(t.keywords || []).join(' ')}`.toLowerCase();
      
      const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => searchableText.includes(term));
                            
      return matchesTech && matchesTag && matchesPrice && matchesSearch;
    }).sort((a, b) => {
      if (sortOrder === 'price-low') return parseFloat(a.price) - parseFloat(b.price);
      if (sortOrder === 'price-high') return parseFloat(b.price) - parseFloat(a.price);
      if (sortOrder === 'popular') return (b.sales * b.rating) - (a.sales * a.rating);
      return b.id - a.id;
    });
  }, [templates, activeTechs, activeTag, priceRange, searchQuery, sortOrder, currency, convertPrice]);

  const sidebarContent = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..." 
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-all text-sm font-medium shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-white/30 placeholder:text-gray-500' : 'bg-white border-gray-200 text-black focus:border-black placeholder:text-gray-400'}`}
          />
        </div>
      </div>

      {/* Categories / Industry */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">Categories</h3>
        <div className="space-y-0.5">
          <button
            onClick={() => setSelectedTag("")}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${!selectedTag ? 'bg-black text-white font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            All Categories
          </button>
          {[
            "Agency", "Beauty & Cosmetics", "Business", "Corporate", "E-commerce",
            "Electronics", "Fashion & Clothing", "Medical & Healthcare", "Real Estate", "SaaS & Tech"
          ].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedTag(selectedTag === cat ? "" : cat)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${selectedTag === cat ? 'bg-black text-white font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Technology */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Technology</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
          {allTechs.map(tech => (
            <label key={tech} className="flex items-center gap-3 cursor-pointer group py-1">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedTechs.includes(tech) ? (isDark ? 'bg-white border-white text-black' : 'bg-black border-black text-white') : (isDark ? 'border-white/20 group-hover:border-white/50' : 'border-gray-300 group-hover:border-black')}`}>
                {selectedTechs.includes(tech) && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                )}
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{tech}</span>
              {/* Invisible checkbox for accessibility */}
              <input type="checkbox" className="hidden" checked={selectedTechs.includes(tech)} onChange={() => toggleTech(tech)} />
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Price Range</h3>
        <div className="space-y-2">
          {[
            { id: "all", label: "Any Price" },
            { id: "free", label: "Free" },
            { id: "under6000", label: `Under ${formatPrice(6000)}` },
            { id: "6000to8000", label: `${formatPrice(6000)} to ${formatPrice(8000)}` },
            { id: "over8000", label: `${formatPrice(8000)} & Above` },
          ].map(range => (
            <label key={range.id} className="flex items-center gap-3 cursor-pointer group py-1">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${priceRange === range.id ? (isDark ? 'border-white' : 'border-black') : (isDark ? 'border-white/20 group-hover:border-white/50' : 'border-gray-300 group-hover:border-black')}`}>
                {priceRange === range.id && (
                  <div className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`} />
                )}
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{range.label}</span>
              <input type="radio" className="hidden" name="price" checked={priceRange === range.id} onChange={() => setPriceRange(range.id)} />
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-900">
      <SEO 
        title="All Templates" 
        description="Browse our complete collection of premium digital templates and UI kits."
        url="/templates"
      />
      
      {/* Navigation — matches Home.jsx */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-gray-200/80">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 h-[64px] flex items-center justify-between gap-4">
          <Logo />
          <CenterNav />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => requireAuth(() => navigate('/cart'))}
              className="relative flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-colors cursor-pointer"
              title="Cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                  {cartItems.length}
                </span>
              )}
            </button>
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1400px] w-full mx-auto px-5 md:px-10 pt-8 flex flex-col">
        
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 font-medium hover:text-gray-900 mb-6 transition-colors self-start">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Clean page header */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">All Templates</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Browse Templates</h1>
          <p className="text-gray-500 text-sm">{filteredTemplates.length} results — premium website templates with full source code</p>
        </div>

        {/* Mobile Filter & Sort */}
        <div className="lg:hidden mb-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm border transition-colors ${isDark ? 'border-white/20 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-100'}`}
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <span className="text-sm font-bold text-gray-500">{filteredTemplates.length} results</span>
          </div>
          <div className="flex justify-end">
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className={`px-3 py-2 rounded-lg font-bold text-sm border outline-none ${isDark ? 'bg-black border-white/20 text-white' : 'bg-white border-gray-300 text-black'}`}
            >
              <option value="newest" className="bg-white dark:bg-black text-black dark:text-white">Newest Arrivals</option>
              <option value="popular" className="bg-white dark:bg-black text-black dark:text-white">Most Popular</option>
              <option value="price-low" className="bg-white dark:bg-black text-black dark:text-white">Price: Low to High</option>
              <option value="price-high" className="bg-white dark:bg-black text-black dark:text-white">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-32">
             {sidebarContent}
          </aside>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {isMobileFiltersOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm"
                />
                <motion.aside 
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className={`fixed top-0 left-0 bottom-0 w-4/5 max-w-[320px] z-[60] p-6 overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black">Filters</h2>
                    <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {sidebarContent}
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Template Grid */}
          <div className="flex-1 w-full">
            <div className="hidden lg:flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-gray-500">{filteredTemplates.length} results found</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500">Sort by:</span>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm border outline-none cursor-pointer ${isDark ? 'bg-black border-white/20 text-white' : 'bg-white border-gray-300 text-black'}`}
                >
                  <option value="newest" className="bg-white dark:bg-black text-black dark:text-white">Newest Arrivals</option>
                  <option value="popular" className="bg-white dark:bg-black text-black dark:text-white">Most Popular</option>
                  <option value="price-low" className="bg-white dark:bg-black text-black dark:text-white">Price: Low to High</option>
                  <option value="price-high" className="bg-white dark:bg-black text-black dark:text-white">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Active Filters Pill Bar */}
            {(selectedTag || selectedTechs.length > 0 || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-2xl bg-gray-100/50 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Active Filters:</span>
                {selectedTag && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black text-white dark:bg-white dark:text-black shadow-sm">
                    Category: {selectedTag}
                    <button onClick={() => setSelectedTag('')} className="hover:opacity-75">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {selectedTechs.map(tech => (
                  <span key={tech} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    Tech: {tech}
                    <button onClick={() => toggleTech(tech)} className="hover:opacity-75">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/20 dark:border-white/20">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:opacity-75">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                <button 
                  onClick={() => { setSelectedTag(''); setSelectedTechs([]); setSearchQuery(''); setPriceRange('all'); }}
                  className="text-xs font-bold text-red-500 hover:underline ml-2"
                >
                  Clear All
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-7">
               {loading ? (
                 Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
               ) : (
                 filteredTemplates.map(template => (
                    <DenseCard key={template.id} template={template} />
                 ))
               )}
               
               {!loading && filteredTemplates.length === 0 && (
                  <div className={`col-span-full py-20 lg:py-32 text-center border-2 border-dashed rounded-3xl ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-white'}`}>
                     <h3 className={`text-xl lg:text-2xl font-black mb-2 ${isDark ? 'text-gray-300' : 'text-gray-400'}`}>No templates found</h3>
                     <p className="text-gray-500 font-medium">Try adjusting your filters.</p>
                     <button 
                       onClick={() => { setSelectedTechs([]); setPriceRange('all'); setSearchQuery(''); setIsMobileFiltersOpen(false); }}
                       className="mt-6 font-bold underline text-blue-500"
                     >
                       Clear all filters
                     </button>
                  </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
