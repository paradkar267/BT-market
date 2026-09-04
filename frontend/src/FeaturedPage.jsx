import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, ArrowLeft } from 'lucide-react';
import { useCart } from './CartContext';
import { useTemplates } from './useTemplates';
import { DenseCard } from './Home';
import { SkeletonCard } from './components/ui/Skeleton';
import UserMenu from './UserMenu';
import { useTheme } from './ThemeContext';
import Navbar from './components/Navbar';
import SEO from './components/SEO';
import { useAuth } from './AuthContext';

export default function FeaturedPage() {
  const { cartItems } = useCart();
  const { theme } = useTheme();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const isDark = theme === 'dark';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { templates, loading } = useTemplates();
  const featuredTemplates = [...templates].sort((a, b) => (b.sales * b.rating) - (a.sales * a.rating));

  const filteredTemplates = React.useMemo(() => {
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(Boolean);
    
    return featuredTemplates.filter(t => {
      const searchableText = `${t.title || ''} ${t.author || ''} ${t.description || ''} ${t.category || ''} ${t.tag || ''} ${(t.keywords || []).join(' ')}`.toLowerCase();
      return searchTerms.length === 0 || searchTerms.every(term => searchableText.includes(term));
    });
  }, [featuredTemplates, searchQuery]);

  return (
    <div className={`min-h-screen flex flex-col font-sans pb-32 transition-colors duration-1000 ${isDark ? 'bg-transparent text-white' : 'bg-gray-50 dark:bg-gray-900 text-black dark:text-white'}`}>
      <SEO 
        title="Featured Themes & Top Rated Templates | BizLeap" 
        description="Discover our highest-rated, award-winning, and best-selling premium React & Next.js website templates."
        url="/featured"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Featured Themes", url: "/featured" }
        ]}
      />
      
      {/* Navigation */}
      <Navbar />


      {/* Main Content */}
      <div className="max-w-[1600px] w-full mx-auto px-8 md:px-16 mt-12 flex flex-col">
        
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-black dark:text-white mb-8 transition-colors self-start">
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
           <div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">Featured Themes</h1>
              <p className="text-xl text-gray-500 font-medium">Our highest-rated and best-selling templates.</p>
           </div>
           
           {/* Search Box */}
           <div className="relative w-full md:w-auto">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search templates..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full md:w-[300px] pl-12 pr-4 py-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-medium"
             />
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
             Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            filteredTemplates.map((template, index) => (
              <DenseCard key={`feat-${template.id}`} template={template} rank={index + 1} />
            ))
          )}
           
           {filteredTemplates.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                 <p className="text-xl text-gray-400 font-bold">No templates found.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
