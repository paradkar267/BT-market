import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { useWishlist } from './WishlistContext';
import UserMenu from './UserMenu';
import { InteractiveProductCard } from './components/ui/card-7';
import { Logo } from './components/ui/Logo';
import Navbar from './components/Navbar';

export default function WishlistPage() {
  const { wishlistItems } = useWishlist();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white font-sans pb-24 transition-colors duration-500">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-8 md:px-16 mt-12 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
        
        <Link to="/templates" className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-black dark:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Market
        </Link>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-12">My Wishlist</h1>

        {!wishlistItems || wishlistItems.length === 0 ? (
          <div className="bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl p-16 md:p-32 rounded-[3rem] border border-black/[0.04] dark:border-white/[0.05] shadow-[0_20px_40px_rgba(0,0,0,0.02)] text-center">
             <div className="w-32 h-32 bg-gray-100 dark:bg-gray-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <Heart className="w-12 h-12 text-gray-300 dark:text-gray-600" />
             </div>
             <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-4">Your wishlist is empty</h2>
             <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
               Found a template you love but not ready to buy? Save it here for later.
             </p>
             <Link to="/" className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:scale-105 transition-transform shadow-lg inline-block">
                Explore Templates
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {wishlistItems.map(template => (
              <InteractiveProductCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
