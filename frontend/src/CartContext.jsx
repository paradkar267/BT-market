import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { supabase } from './lib/supabase';
import { useTemplates } from './useTemplates';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('bt_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse cart from local storage', e);
    }
    return [];
  });
  const [purchasedTemplates, setPurchasedTemplates] = useState([]);
  const [hasPlayedIntro, setHasPlayedIntro] = useState(window.location.pathname !== '/');
  const { user, requireAuth } = useAuth();
  const { templates } = useTemplates();

  const isLoggedIn = !!user;

  // Robustly load purchases from both User Metadata and Purchases DB table
  const loadPurchasedTemplates = useCallback(async () => {
    if (!user) {
      setPurchasedTemplates([]);
      return;
    }

    try {
      // 1. Get IDs from user_metadata
      const metadataIds = (user.user_metadata?.purchased_templates || []).map(id => String(id));

      // 2. Get IDs from purchases database table
      const { data: dbPurchases } = await supabase
        .from('purchases')
        .select('template_id')
        .eq('user_id', user.id);

      const dbIds = (dbPurchases || []).map(p => String(p.template_id));

      // Combine both sources
      const allPurchasedIds = [...new Set([...metadataIds, ...dbIds])];

      if (templates.length > 0) {
        const fetchedTemplates = templates.filter(t => allPurchasedIds.includes(String(t.id)));
        setPurchasedTemplates(fetchedTemplates);
      }
    } catch (err) {
      console.error("Error loading purchased templates:", err);
    }
  }, [user, templates]);

  useEffect(() => {
    let isMounted = true;
    const fetchPurchases = async () => {
      if (!user) {
        if (isMounted) setPurchasedTemplates([]);
        return;
      }
      if (templates.length === 0) return;
      try {
        const { data: dbPurchases, error } = await supabase
          .from('purchases')
          .select('template_id')
          .eq('user_id', user.id);

        if (!isMounted) return;
        
        let allPurchasedIds = [];
        if (!error && dbPurchases !== null) {
          allPurchasedIds = dbPurchases.map(p => String(p.template_id));
        } else {
          allPurchasedIds = (user.user_metadata?.purchased_templates || []).map(id => String(id));
        }

        const fetchedTemplates = templates.filter(t => allPurchasedIds.includes(String(t.id)));
        setPurchasedTemplates(fetchedTemplates);
      } catch (err) {
        console.error("Error loading purchased templates:", err);
      }
    };

    fetchPurchases();
    return () => { isMounted = false; };
  }, [user, templates]);

  // Sync cart with localStorage and across tabs
  useEffect(() => {
    localStorage.setItem('bt_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'bt_cart') {
        try {
          const newCart = JSON.parse(e.newValue || '[]');
          setCartItems(newCart);
        } catch (err) {
          setCartItems([]);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addToCart = (product) => {
    requireAuth(() => {
      if (cartItems.find(item => item.id === product.id)) {
        toast.error(`${product.title} is already in your cart!`);
        return;
      }
      
      if (purchasedTemplates.find(item => item.id === product.id)) {
        toast.info(`You already own ${product.title}!`);
        return;
      }

      setCartItems(prev => [...prev, product]);
      toast.success(`${product.title} added to cart!`);
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    toast.success("Item removed from cart");
  };

  const checkout = async (paymentId = 'mock_pay_id', purchasedItems = null) => {
    const itemsToBuy = purchasedItems || cartItems;
    if (itemsToBuy.length === 0) return;
    if (!user) {
      toast.error("You must be logged in to checkout.");
      return;
    }
    
    // Immediately update local purchased state for seamless instant navigation
    setPurchasedTemplates(prev => {
      const combined = [...prev];
      itemsToBuy.forEach(item => {
        if (!combined.some(c => String(c.id) === String(item.id))) {
          combined.push(item);
        }
      });
      return combined;
    });

    // Clear cart immediately
    setCartItems([]);
    try {
      localStorage.removeItem('bt_cart');
    } catch {
      // Ignore
    }

    // Trigger a custom event to tell useTemplates to refetch globally across components
    window.dispatchEvent(new Event('templates_updated'));
    
    // Update local state by re-fetching purchased templates from DB & Auth metadata in background
    await loadPurchasedTemplates();
  };

  const removePurchasedTemplate = async (templateId) => {
    if (!user) return;
    
    const existingIds = user.user_metadata?.purchased_templates || [];
    const finalIds = existingIds.filter(id => id !== templateId);
    
    // Remove from both user_metadata and purchases table
    const [{ error }, { error: dbError }] = await Promise.all([
      supabase.auth.updateUser({ data: { purchased_templates: finalIds } }),
      supabase.from('purchases').delete().eq('user_id', user.id).eq('template_id', templateId)
    ]);
      
    if (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete template.");
      return;
    }
    if (dbError) {
      console.warn("Could not remove purchase record:", dbError);
    }
    
    const newPurchasedObjects = templates.filter(t => finalIds.includes(t.id));
    setPurchasedTemplates(newPurchasedObjects);
    toast.success("Template removed from your collection.");
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

  return (
    <CartContext.Provider value={{ cartItems, purchasedTemplates, addToCart, removeFromCart, checkout, cartTotal, isLoggedIn, hasPlayedIntro, setHasPlayedIntro, removePurchasedTemplate, loadPurchasedTemplates }}>
      {children}
    </CartContext.Provider>
  );
};
