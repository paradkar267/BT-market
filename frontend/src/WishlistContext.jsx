import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { api } from './lib/api';
import { useTemplates } from './useTemplates';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user, requireAuth } = useAuth();
  const { templates } = useTemplates();
  const [localWishlistIds, setLocalWishlistIds] = useState(null);

  const savedIds = React.useMemo(() => {
    if (localWishlistIds !== null) return localWishlistIds;
    if (!user) return [];
    return (user.wishlist_templates || user.user_metadata?.wishlist_templates || []).map(String);
  }, [user, localWishlistIds]);

  const wishlistItems = React.useMemo(() => {
    return templates.filter(t => savedIds.includes(String(t.id)));
  }, [templates, savedIds]);

  const toggleWishlist = (product) => {
    requireAuth(async () => {
      const isCurrentlyInWishlist = savedIds.includes(String(product.id));
      
      const newIds = isCurrentlyInWishlist
        ? savedIds.filter(id => id !== String(product.id))
        : [...savedIds, String(product.id)];
        
      setLocalWishlistIds(newIds);
      
      if (isCurrentlyInWishlist) {
        toast.info(`${product.title} removed from wishlist.`);
      } else {
        toast.success(`${product.title} added to wishlist!`);
      }
      
      try {
        await api.post('/api/auth/sync-wishlist', { wishlistTemplates: newIds });
      } catch (error) {
        console.warn("Wishlist sync note:", error.message);
      }
    });
  };

  const isInWishlist = (productId) => {
    return savedIds.includes(String(productId));
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
