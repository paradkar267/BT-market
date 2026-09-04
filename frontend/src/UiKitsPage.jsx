import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Filter, X, Layers } from 'lucide-react';
import { useCart } from './CartContext';
import { useTemplates } from './useTemplates';
import { DenseCard } from './Home';
import { SkeletonCard } from './components/ui/Skeleton';
import UserMenu from './UserMenu';
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from './ThemeContext';
import Navbar from './components/Navbar';
import SEO from './components/SEO';


function SidebarFilters({ searchQuery, setSearchQuery, priceRange, setPriceRange, isDark }) {
  return (
    <div className="space-y-8">
      {/* Search */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Search UI Kits</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..." 
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-all text-sm font-medium shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-white/30 placeholder:text-gray-500' : 'bg-white border-gray-200 text-black focus:border-black placeholder:text-gray-400'}`}
          />
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Price Range</h3>
        <div className="space-y-2">
          {[
            { id: "all", label: "Any Price" },
            { id: "free", label: "Free" },
            { id: "under6000", label: "Under ₹6000" },
            { id: "6000to8000", label: "₹6000 to ₹8000" },
            { id: "over8000", label: "₹8000 & Above" },
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
}

export default function UiKitsPage() {
  const { cartItems } = useCart();
  const { theme } = useTheme();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === 'dark';
  
  const searchParams = new URLSearchParams(location.search);
  const selectedTag = searchParams.get('tag') || "";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { templates, loading } = useTemplates();

  // Filter for UI Kits (Figma, Sketch, Adobe XD, UI Kit)
  const uiKits = templates.filter(t => {
    const cat = t.category?.toLowerCase() || '';
    return cat === 'figma' || cat === 'ui kit' || cat === 'sketch';
  });

  const filteredTemplates = uiKits.filter(t => {
    // Price filter
    const price = parseFloat(t.price);
    let matchesPrice = true;
    if (priceRange === "free") matchesPrice = price === 0;
    else if (priceRange === "under6000") matchesPrice = price > 0 && price < 6000;
    else if (priceRange === "6000to8000") matchesPrice = price >= 6000 && price <= 8000;
    else if (priceRange === "over8000") matchesPrice = price > 8000;

    // Tag filter
    const matchesTag = !selectedTag || t.tag === selectedTag;

    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
                          t.title?.toLowerCase().includes(searchLower) || 
                          t.description?.toLowerCase().includes(searchLower);
                          
    return matchesPrice && matchesSearch && matchesTag;
  });

  return (
    <div className={`min-h-screen flex flex-col font-sans pb-32 transition-colors duration-1000 ${isDark ? 'bg-transparent text-white' : 'bg-gray-50 text-black'}`}>
      
      {/* Navigation */}
      <Navbar />


      {/* Hero Section */}
      <div 
        className="w-full py-16 px-4 border-b border-black/5 dark:border-white/10 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/bground.png')" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center shadow-xl shadow-black/10 mb-6">
             <Layers className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
            {selectedTag ? `${selectedTag} UI Kits` : "Premium UI Kits"}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
            {selectedTag 
              ? `Explore our collection of high-quality ${selectedTag} UI kits to accelerate your design workflow.`
              : "Accelerate your design workflow with high-quality, pixel-perfect UI kits for Figma and beyond. Build beautiful interfaces faster."
            }
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start relative">
          
          {/* Desktop Sidebar Filter */}
          <aside className={`hidden lg:block w-72 shrink-0 p-6 rounded-3xl border shadow-sm sticky top-[120px] transition-colors ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
            <SidebarFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} priceRange={priceRange} setPriceRange={setPriceRange} isDark={isDark} />
          </aside>

          {/* Mobile Filter Button */}
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className={`lg:hidden w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold border shadow-sm mb-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          {/* Mobile Filter Overlay */}
          <AnimatePresence>
            {isMobileFiltersOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-[100] lg:hidden backdrop-blur-sm"
                  onClick={() => setIsMobileFiltersOpen(false)}
                />
                <motion.div 
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className={`fixed bottom-0 left-0 right-0 z-[101] p-6 rounded-t-3xl h-[80vh] overflow-y-auto lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.2)] ${isDark ? 'bg-gray-900 border-t border-white/10' : 'bg-white border-t border-gray-200'}`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black">Filters</h2>
                    <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-black/5 dark:bg-white/10 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <SidebarFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} priceRange={priceRange} setPriceRange={setPriceRange} isDark={isDark} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black">Showing {filteredTemplates.length} UI Kits</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {loading ? (
                <>
                  <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                </>
              ) : filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (
                  <DenseCard key={template.id} template={template} />
                ))
              ) : (
                <div className={`col-span-full py-20 text-center rounded-3xl border border-dashed ${isDark ? 'bg-white/5 border-white/20' : 'bg-gray-50 border-gray-300'}`}>
                  <h3 className="text-xl font-bold mb-2">No UI Kits found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
