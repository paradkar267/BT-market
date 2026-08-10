import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Load purchases from User Metadata
  useEffect(() => {
    if (user && templates.length > 0) {
      const purchasedIds = user.user_metadata?.purchased_templates || [];
      const fetchedTemplates = templates.filter(t => purchasedIds.includes(t.id));
      setPurchasedTemplates(fetchedTemplates);
    } else if (!user) {
      setPurchasedTemplates([]);
    }
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
    
    const soldOutItems = checkTemplates.filter(t => t.is_sold_out && false); // HOLD FEATURE
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
    
    // Update local state
    const newPurchasedObjects = templates.filter(t => finalIds.includes(t.id));
    setPurchasedTemplates(newPurchasedObjects);
    setCartItems([]);
  };

  const removePurchasedTemplate = async (templateId) => {
    if (!user) return;
    
    const existingIds = user.user_metadata?.purchased_templates || [];
    const finalIds = existingIds.filter(id => id !== templateId);
    
    const { error } = await supabase.auth.updateUser({
      data: { purchased_templates: finalIds }
    });
      
    if (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete template.");
      return;
    }
    
    const newPurchasedObjects = templates.filter(t => finalIds.includes(t.id));
    setPurchasedTemplates(newPurchasedObjects);
    toast.success("Template removed from your collection.");
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

  return (
    <CartContext.Provider value={{ cartItems, purchasedTemplates, addToCart, removeFromCart, checkout, cartTotal, isLoggedIn, hasPlayedIntro, setHasPlayedIntro, removePurchasedTemplate }}>
      {children}
    </CartContext.Provider>
  );
};
