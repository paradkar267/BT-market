import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Check, ShieldCheck, Zap, Search, Heart, Eye } from 'lucide-react';
import { useTemplates } from './useTemplates';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';
import { useCurrency } from './CurrencyContext';
import { ReviewsSection } from './ReviewsSection';
import UserMenu from './UserMenu';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { ProductSkeleton } from './components/ui/Skeleton';
import { FAQSection } from './components/ui/FAQSection';
import { InteractiveProductCard } from './components/ui/card-7';
import { Logo } from './components/ui/Logo';
import { motion } from 'framer-motion';
import SEO from './components/SEO';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, purchasedTemplates } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { templates, loading } = useTemplates();
  const { requireAuth } = useAuth();
  const { formatPrice } = useCurrency();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors duration-500">
        <nav className="h-[80px] w-full px-8 md:px-16 flex items-center justify-between glass-nav sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
          <Logo />
          <UserMenu />
        </nav>
        <ProductSkeleton />
      </div>
    );
  }

  let template = templates.find(t => String(t.id) === String(id));
  if (template) {
    template = { ...template, is_sold_out: false };
  }

  const inCart = template ? cartItems.some(item => String(item.id) === String(template.id)) : false;
  const isOwned = template ? purchasedTemplates?.some(item => String(item.id) === String(template.id)) : false;
  const similarTemplates = template ? templates.filter(t => t.category === template.category && String(t.id) !== String(template.id)).slice(0, 3) : [];

  if (!template) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-transparent text-white' : 'bg-white dark:bg-black text-black dark:text-white'}`}>
        <div className="text-center flex flex-col items-center">
          <h1 className="text-4xl font-black mb-4">Template Not Found</h1>
          <Logo />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-1000 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
      <SEO 
        title={template.title}
        description={template.description}
        keywords={template.keywords?.join(', ')}
        image={template.image}
        url={`/product/${template.id}`}
      />
      <nav className="flex items-center justify-between p-6 md:px-16 border-b border-gray-200 dark:border-white/10">
        <Logo />
        <div className="flex items-center gap-6">
<button onClick={() => requireAuth(() => navigate('/cart'))} className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer">
            <ShoppingCart className="w-6 h-6" />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md">
                {cartItems.length}
              </span>
            )}
          </button>
          <UserMenu />
          
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-8 md:px-16 mt-12 relative">
        {/* Subtle Aurora Blobs for Product Page */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/50 aurora-blob"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-200/50 aurora-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <Link to="/#catalog" className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-black dark:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" /> Back to Market
            </Link>
            
            <button 
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
                window.dispatchEvent(event);
              }}
              className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-black dark:hover:text-white transition-colors group bg-white/50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Quick Search</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 shadow-sm font-sans font-bold text-[10px] text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">Ctrl+K</kbd>
            </button>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:items-start">
          {/* Left Column: Image & Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Main Image Container */}
            <div className="w-full relative aspect-[16/10] sm:aspect-video lg:h-[500px] rounded-[2.5rem] overflow-hidden group cursor-pointer">
              {/* Subtle background glow when loading or if transparent */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 animate-gradient-xy"></div>
              
              <img 
                src={template.image} 
                alt={template.title} 
                className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover:scale-105" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback state if image fails */}
              <div className="absolute inset-0 hidden items-center justify-center bg-gray-100 dark:bg-gray-800/50 backdrop-blur-sm z-20">
                 <span className="text-gray-400 font-medium">Image Preview Unavailable</span>
              </div>
              
              {/* Hover Preview Overlay */}
              <Link 
                to={`/preview/${template.id}`} 
                target="_blank"
                className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center"
              >
                <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out flex items-center gap-2 px-8 py-4 bg-white text-black font-black text-lg rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105">
                  <Eye className="w-6 h-6" />
                  <span>Live Preview</span>
                </div>
              </Link>
              
              {/* Overlay shadow for depth */}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-[2.5rem] z-30 pointer-events-none"></div>
            </div>

            {/* Product Overview Card */}
            <div className="bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
              <h2 className="text-3xl font-black tracking-tight mb-6 text-gray-900 dark:text-white">Overview</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
                {template.description}
              </p>
              
             <div className="grid sm:grid-cols-2 gap-6">
                 <div className="p-6 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Key Features</h3>
                    <ul className="space-y-4 text-gray-600 dark:text-gray-400 font-medium text-sm">
                      {template.key_features && template.key_features.length > 0 ? (
                        template.key_features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-500 shrink-0" /> {feature}</li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-500 shrink-0" /> Fully responsive design layout</li>
                          <li className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-500 shrink-0" /> Modular component architecture</li>
                        </>
                      )}
                    </ul>
                 </div>
                 
                 <div className="p-6 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Ideal For</h3>
                    <div className="flex flex-wrap gap-2">
                      {template.ideal_for && template.ideal_for.length > 0 ? (
                        template.ideal_for.map((ideal, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold">{ideal}</span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">Startups, Agencies, Creators</span>
                      )}
                    </div>
                 </div>

                 <div className="p-6 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 sm:col-span-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Pages Included</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {template.pages_included && template.pages_included.length > 0 ? (
                        template.pages_included.map((page, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                            {page}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-sm">Home, About, Contact, and more.</div>
                      )}
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Checkout Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1 lg:sticky lg:top-[120px] h-fit"
          >
            {/* Redesigned Premium Card */}
            <div className="relative p-[1px] rounded-[2.5rem] bg-gradient-to-b from-gray-300 to-transparent dark:from-white/15 dark:to-transparent shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.05)] transition-shadow duration-500">
              <div className="bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-3xl p-8 rounded-[2.5rem] relative overflow-hidden">
                 
                 {/* Top ambient glow */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-indigo-500/20 dark:bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none"></div>

                 <div className="relative z-10">
                   {/* Badges */}
                   <div className="flex flex-wrap items-center gap-2 mb-6">
                      <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                        {template.category}
                      </span>
                      <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5">
                        {template.tag}
                      </span>
                   </div>

                   {/* Title */}
                   <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-2 text-gray-900 dark:text-white">
                     {template.title}
                   </h1>
                   <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8">
                     by <span className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer">{template.author}</span>
                   </p>

                   {template.is_sold_out && (
                     <div className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3">
                       <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                         <ShieldCheck className="w-4 h-4 text-red-600 dark:text-red-400" />
                       </div>
                       <div>
                         <h3 className="text-red-800 dark:text-red-300 font-bold text-sm">Sold Out</h3>
                         <p className="text-red-600 dark:text-red-400 text-xs mt-1">This exclusive 1-of-1 template has been purchased and is no longer available.</p>
                       </div>
                     </div>
                   )}

                   {/* Divider */}
                   <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent mb-8"></div>

                   {/* Price & Stats */}
                   <div className="flex items-end justify-between mb-8">
                     <div>
                       <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Price</div>
                       <div className={`text-4xl lg:text-5xl font-black tracking-tighter ${template.is_sold_out ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                         {template.is_sold_out ? 'Sold Out' : formatPrice(template.price)}
                       </div>
                     </div>
                     <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-400 justify-end mb-1">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-black text-gray-900 dark:text-white">{template.rating}</span>
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                          {template.is_sold_out ? '1/1 Edition' : `${template.sales.toLocaleString()} Sales`}
                        </div>
                     </div>
                   </div>

                   {/* Features */}
                   <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        Quality checked by Bizleap
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                          <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        Instant download access
                      </div>
                   </div>

                   {/* Primary Action */}
                   <button 
                      onClick={() => {
                        if (isOwned || template.is_sold_out) return;
                        requireAuth(() => addToCart(template));
                      }}
                      disabled={isOwned || template.is_sold_out}
                      className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group mb-3 shadow-lg ${
                        template.is_sold_out
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-400 cursor-not-allowed border border-red-200 dark:border-red-800'
                        : isOwned
                        ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : inCart 
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]' 
                        : 'bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] dark:shadow-[0_10px_20px_-10px_rgba(255,255,255,0.2)]'
                      }`}
                   >
                      {!isOwned && !inCart && !template.is_sold_out && (
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent"></div>
                      )}
                      {template.is_sold_out ? 'Sold Out' : isOwned ? <><Check className="w-5 h-5" /> Already Owned</> : inCart ? 'Added to Cart' : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                   </button>

                   {/* Secondary Actions */}
                   <div className="flex items-center gap-3">
                     <button
                        onClick={() => toggleWishlist(template)}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all duration-300 font-bold ${
                          isInWishlist(template.id)
                            ? 'border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 bg-white/50 dark:bg-transparent'
                        }`}
                     >
                        <Heart className={`w-4 h-4 ${isInWishlist(template.id) ? 'fill-current' : ''}`} />
                        <span className="text-sm">{isInWishlist(template.id) ? 'Wishlisted' : 'Wishlist'}</span>
                     </button>
                   </div>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
        </div>
      </div>

      <ReviewsSection templateId={template.id} />
      
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-16 border-t border-gray-100 dark:border-white/10">
        <h2 className="text-3xl font-black mb-8 text-black dark:text-white">You Might Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {similarTemplates.map(t => (
            <InteractiveProductCard key={t.id} template={t} />
          ))}
        </div>
      </div>

      <FAQSection />
    </div>
  );
}
