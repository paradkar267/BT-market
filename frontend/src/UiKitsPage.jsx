import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  X, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
  Zap,
  ShieldCheck,
  Download
} from 'lucide-react';
import { useCart } from './CartContext';
import { useTemplates } from './useTemplates';
import { DenseCard } from './Home';
import { SkeletonCard } from './components/ui/Skeleton';
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from './ThemeContext';
import Navbar from './components/Navbar';
import SEO from './components/SEO';
import { useCurrency } from './CurrencyContext';

function SidebarFilters({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory,
  priceRange, 
  setPriceRange, 
  sortOrder,
  setSortOrder,
  availableCategories,
  categoryCounts,
  onResetFilters,
  hasActiveFilters,
  isDark 
}) {
  return (
    <div className="space-y-6">
      {/* Search Filter */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Search UI Kits</h3>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-gray-400 hover:text-black dark:hover:text-white font-medium cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search kits, components..." 
            className={`w-full pl-9 pr-8 py-2.5 border rounded-xl outline-none transition-all text-sm font-medium shadow-xs ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white focus:border-white/30 placeholder:text-gray-500' 
                : 'bg-white border-gray-200 text-black focus:border-black placeholder:text-gray-400'
            }`}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category / Platform Filter */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">Category & Platform</h3>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <span>All Categories</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              selectedCategory === 'all'
                ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
            }`}>
              {categoryCounts.all || 0}
            </span>
          </button>

          {availableCategories.map(cat => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            const count = categoryCounts[cat.toLowerCase()] || 0;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">Price Range</h3>
        <div className="space-y-1.5">
          {[
            { id: "all", label: "Any Price" },
            { id: "free", label: "Free" },
            { id: "under6000", label: "Under ₹6,000" },
            { id: "6000to8000", label: "₹6,000 to ₹8,000" },
            { id: "over8000", label: "₹8,000 & Above" },
          ].map(range => (
            <label key={range.id} className="flex items-center gap-2.5 cursor-pointer group py-1">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                priceRange === range.id 
                  ? (isDark ? 'border-white' : 'border-black') 
                  : (isDark ? 'border-white/20 group-hover:border-white/50' : 'border-gray-300 group-hover:border-black')
              }`}>
                {priceRange === range.id && (
                  <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`} />
                )}
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{range.label}</span>
              <input 
                type="radio" 
                className="hidden" 
                name="price" 
                checked={priceRange === range.id} 
                onChange={() => setPriceRange(range.id)} 
              />
            </label>
          ))}
        </div>
      </div>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-gray-300 dark:border-white/20 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
        </button>
      )}
    </div>
  );
}

export default function UiKitsPage() {
  const { theme } = useTheme();
  const location = useLocation();
  const isDark = theme === 'dark';
  
  const searchParams = new URLSearchParams(location.search);
  const paramTag = searchParams.get('tag') || "";
  const paramCategory = searchParams.get('category') || searchParams.get('tech') || "all";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(paramCategory);
  const [selectedTag, setSelectedTag] = useState(paramTag);
  const [priceRange, setPriceRange] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { templates, loading } = useTemplates();

  // Extract unique categories available in templates
  const availableCategories = useMemo(() => {
    if (!templates.length) return ["Figma", "React", "Next.js", "Tailwind", "UI Kit", "SaaS"];
    const cats = new Set(templates.map(t => t.category).filter(Boolean));
    // Ensure core UI kit tags/categories are accessible
    cats.add("React");
    cats.add("Figma");
    cats.add("Next.js");
    return Array.from(cats).sort();
  }, [templates]);

  // Compute item counts per category
  const categoryCounts = useMemo(() => {
    const counts = { all: templates.length };
    templates.forEach(t => {
      const cat = (t.category || '').toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [templates]);

  // Comprehensive Filtering & Sorting Logic
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      // Category filter
      if (selectedCategory !== 'all') {
        const catLower = (t.category || '').toLowerCase();
        const selLower = selectedCategory.toLowerCase();
        const tagLower = (t.tag || '').toLowerCase();
        const titleLower = (t.title || '').toLowerCase();
        const matchesCat = catLower === selLower || tagLower === selLower || titleLower.includes(selLower);
        if (!matchesCat) return false;
      }

      // Tag filter
      if (selectedTag) {
        const tagLower = selectedTag.toLowerCase();
        const tTagLower = (t.tag || '').toLowerCase();
        const tCatLower = (t.category || '').toLowerCase();
        const tTitleLower = (t.title || '').toLowerCase();
        if (tTagLower !== tagLower && tCatLower !== tagLower && !tTitleLower.includes(tagLower)) {
          return false;
        }
      }

      // Price filter
      const price = parseFloat(t.price) || 0;
      if (priceRange === "free" && price !== 0) return false;
      if (priceRange === "under6000" && (price <= 0 || price >= 6000)) return false;
      if (priceRange === "6000to8000" && (price < 6000 || price > 8000)) return false;
      if (priceRange === "over8000" && price <= 8000) return false;

      // Search filter
      if (searchQuery.trim()) {
        const searchLower = searchQuery.trim().toLowerCase();
        const titleMatch = (t.title || '').toLowerCase().includes(searchLower);
        const descMatch = (t.description || '').toLowerCase().includes(searchLower);
        const catMatch = (t.category || '').toLowerCase().includes(searchLower);
        const tagMatch = (t.tag || '').toLowerCase().includes(searchLower);
        if (!titleMatch && !descMatch && !catMatch && !tagMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'price-low') return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
      if (sortOrder === 'price-high') return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
      if (sortOrder === 'popular') return ((b.sales || 0) * (b.rating || 5)) - ((a.sales || 0) * (a.rating || 5));
      return (b.id || 0) - (a.id || 0);
    });
  }, [templates, selectedCategory, selectedTag, priceRange, searchQuery, sortOrder]);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedTag !== '' || priceRange !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTag('');
    setPriceRange('all');
    setSortOrder('newest');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans pb-32 transition-colors duration-1000 ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-black'}`}>
      <SEO 
        title="UI Kits & Design Systems | BizLeap Marketplace" 
        description="Explore production-ready UI kits, design systems, and customizable component libraries for React, Next.js, Figma and Tailwind CSS."
        url="/ui-kits"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "UI Kits", url: "/ui-kits" }
        ]}
      />

      {/* Navigation */}
      <Navbar />

      {/* Executive High-Contrast Hero Banner */}
      <div 
        className="w-full py-16 md:py-20 px-4 border-b border-black/10 dark:border-white/10 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/bground.png')" }}
      >
        {/* Rich Multi-Layer Dark Gradient Overlay for 100% Guaranteed Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black/95 pointer-events-none" />
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-xs font-bold mb-5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>UI Kits & Production Component Systems</span>
          </div>

          {/* High-Contrast Crisp White Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 drop-shadow-sm">
            {selectedTag ? `${selectedTag} UI Kits` : "Premium UI Kits & Design Systems"}
          </h1>

          {/* High-Contrast Crisp Slate Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed mx-auto mb-6">
            Accelerate your engineering and design workflow with high-quality, pixel-perfect UI kits, Figma components, and full-stack design systems.
          </p>

          {/* Value Props Strip */}
          <div className="flex items-center justify-center flex-wrap gap-2.5 sm:gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Vector & Responsive</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>React, Next.js & Figma Ready</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Commercial License Included</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Quick Category Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none no-scrollbar">
          {[
            { id: 'all', label: 'All UI Kits' },
            { id: 'react', label: 'React UI' },
            { id: 'figma', label: 'Figma Systems' },
            { id: 'next.js', label: 'Next.js Templates' },
            { id: 'saas', label: 'SaaS Platforms' },
            { id: 'dashboard', label: 'Dashboards' }
          ].map(tab => {
            const isTabActive = selectedCategory.toLowerCase() === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                    : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start relative">
          
          {/* Desktop Sidebar Filter */}
          <aside className={`hidden lg:block w-72 shrink-0 p-6 rounded-2xl border shadow-xs sticky top-[100px] transition-colors ${
            isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-gray-200/90'
          }`}>
            <SidebarFilters 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange} 
              setPriceRange={setPriceRange} 
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              availableCategories={availableCategories}
              categoryCounts={categoryCounts}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
              isDark={isDark} 
            />
          </aside>

          {/* Mobile Filter Trigger Button */}
          <div className="lg:hidden w-full flex items-center gap-3 mb-4">
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold border shadow-xs cursor-pointer ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-black'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters {hasActiveFilters && '• Active'}
            </button>

            {/* Mobile Sort Menu */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={`py-3 px-3 rounded-xl font-bold text-xs border shadow-xs outline-none cursor-pointer ${
                isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-gray-200 text-black'
              }`}
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Mobile Filter Overlay Modal */}
          <AnimatePresence>
            {isMobileFiltersOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-[100] lg:hidden backdrop-blur-sm"
                  onClick={() => setIsMobileFiltersOpen(false)}
                />
                <motion.div 
                  initial={{ y: "100%" }} 
                  animate={{ y: 0 }} 
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className={`fixed bottom-0 left-0 right-0 z-[101] p-6 rounded-t-3xl max-h-[85vh] overflow-y-auto lg:hidden shadow-2xl border-t ${
                    isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-gray-200 text-black'
                  }`}
                >
                  <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-emerald-500" />
                      <h2 className="text-lg font-black">Filters & Options</h2>
                    </div>
                    <button 
                      onClick={() => setIsMobileFiltersOpen(false)} 
                      className="p-2 bg-black/5 dark:bg-white/10 rounded-full cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <SidebarFilters 
                    searchQuery={searchQuery} 
                    setSearchQuery={setSearchQuery} 
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    priceRange={priceRange} 
                    setPriceRange={setPriceRange} 
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    availableCategories={availableCategories}
                    categoryCounts={categoryCounts}
                    onResetFilters={handleResetFilters}
                    hasActiveFilters={hasActiveFilters}
                    isDark={isDark} 
                  />
                  <div className="pt-6 mt-6 border-t border-gray-100 dark:border-white/10">
                    <button
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="w-full py-3.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm cursor-pointer shadow-md"
                    >
                      Show {filteredTemplates.length} Results
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products Column */}
          <div className="flex-1 w-full">
            {/* Results Header & Desktop Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200/80 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Showing {filteredTemplates.length} {filteredTemplates.length === 1 ? 'UI Kit' : 'UI Kits'}
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Desktop Sort Dropdown */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
                </span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold border outline-none cursor-pointer ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-black'
                  }`}
                >
                  <option value="newest" className="dark:bg-zinc-900">Newest First</option>
                  <option value="popular" className="dark:bg-zinc-900">Most Popular</option>
                  <option value="price-low" className="dark:bg-zinc-900">Price: Low to High</option>
                  <option value="price-high" className="dark:bg-zinc-900">Price: High to Low</option>
                </select>
              </div>
            </div>
            
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {loading ? (
                <>
                  <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                </>
              ) : filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (
                  <DenseCard key={template.id} template={template} />
                ))
              ) : (
                <div className={`col-span-full py-16 px-6 text-center rounded-2xl border border-dashed ${
                  isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400">
                    <Layers className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold mb-1.5 text-gray-900 dark:text-white">No UI Kits Found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-5">
                    We couldn't find any kits matching your current filter criteria. Try adjusting your search query or reset your filters.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> View All UI Kits
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
