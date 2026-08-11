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
    if (!user || templates.length === 0) {
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

      const fetchedTemplates = templates.filter(t => allPurchasedIds.includes(String(t.id)));
      setPurchasedTemplates(fetchedTemplates);
    } catch (err) {
      console.error("Error loading purchased templates:", err);
    }
  }, [user, templates]);

  useEffect(() => {
    loadPurchasedTemplates();
  }, [loadPurchasedTemplates]);

  // Clear cart on logout
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      localStorage.removeItem('bt_cart');
    }
  }, [user]);

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
      if (product.is_sold_out) {
        toast.error(`${product.title} is sold out!`);
        return;
      }
      
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

  const checkout = async (paymentId = 'mock_pay_id') => {
    if (cartItems.length === 0) return;
    if (!user) {
      toast.error("You must be logged in to checkout.");
      return;
    }
    
    const newPurchaseIds = cartItems.map(item => item.id);
    
    // Check if any items just became sold out
    const { data: checkTemplates, error: checkError } = await supabase
      .from('templates')
      .select('id, title, is_sold_out')
      .in('id', newPurchaseIds);
      
    if (checkError) {
      toast.error("Error verifying cart availability.");
      return;
    }
    
    const soldOutItems = checkTemplates.filter(t => t.is_sold_out);
    if (soldOutItems.length > 0) {
      toast.error(`Sorry, ${soldOutItems[0].title} was just purchased by someone else!`);
      // Remove sold out items from cart
      const soldIds = soldOutItems.map(t => t.id);
      setCartItems(prev => prev.filter(item => !soldIds.includes(item.id)));
      return;
    }

    // The purchase records and metadata updates are now handled securely by the backend
    // in the /api/verify-payment route.

    // Note: The templates table will be automatically updated to is_sold_out = true 
    // by the Supabase Database Trigger (trigger_mark_template_sold_out) 
    // immediately after the purchase record is inserted by the backend.
    
    // Trigger a custom event to tell useTemplates to refetch globally across components
    window.dispatchEvent(new Event('templates_updated'));
    
    // Update local state by re-fetching purchased templates from DB & Auth metadata
    await loadPurchasedTemplates();
    setCartItems([]);
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
