import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
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

  // Load purchased templates from user data and backend live sync
  const loadPurchasedTemplates = useCallback(async () => {
    if (!user) {
      setPurchasedTemplates([]);
      return;
    }

    try {
      const token = localStorage.getItem('bizleap_token') || '';
      let activeIds = null;

      // Attempt live sync from backend to get ground truth non-refunded/non-revoked purchase list
      if (token) {
        try {
          const res = await fetch('/api/purchased-templates', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.templateIds)) {
              activeIds = data.templateIds.map(id => String(id));
            }
          }
        } catch {
          // Fallback to local user object only if network offline
        }
      }

      if (activeIds === null) {
        activeIds = (user.purchased_templates || user.user_metadata?.purchased_templates || []).map(id => String(id));
      }

      if (templates.length > 0) {
        const fetchedTemplates = templates.filter(t => activeIds.includes(String(t.id)));
        setPurchasedTemplates(fetchedTemplates);
      } else {
        setPurchasedTemplates([]);
      }
    } catch (err) {
      console.error("Error loading purchased templates:", err);
    }
  }, [user, templates]);

  useEffect(() => {
    loadPurchasedTemplates();

    const handleSync = () => loadPurchasedTemplates();
    window.addEventListener('templates_updated', handleSync);
    window.addEventListener('purchases_updated', handleSync);
    return () => {
      window.removeEventListener('templates_updated', handleSync);
      window.removeEventListener('purchases_updated', handleSync);
    };
  }, [loadPurchasedTemplates]);

  // Sync cart with localStorage
  useEffect(() => {
    localStorage.setItem('bt_cart', JSON.stringify(cartItems));
  }, [cartItems]);

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
    toast.info("Item removed from cart");
  };

  const checkout = async (param1 = null, param2 = null) => {
    // Safely resolve items whether called as checkout(paymentId, cartItems) or checkout(cartItems)
    let itemsToBuy = cartItems;
    if (Array.isArray(param1)) {
      itemsToBuy = param1;
    } else if (Array.isArray(param2)) {
      itemsToBuy = param2;
    } else if (param1 && typeof param1 === 'object') {
      itemsToBuy = [param1];
    } else if (param2 && typeof param2 === 'object') {
      itemsToBuy = [param2];
    }

    if (!Array.isArray(itemsToBuy) || itemsToBuy.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    setPurchasedTemplates(prev => {
      const combined = Array.isArray(prev) ? [...prev] : [];
      itemsToBuy.forEach(item => {
        if (item && item.id && !combined.some(c => String(c.id) === String(item.id))) {
          combined.push(item);
        }
      });
      return combined;
    });

    setCartItems([]);
    try {
      localStorage.removeItem('bt_cart');
    } catch {
      // Ignore
    }

    window.dispatchEvent(new Event('templates_updated'));
  };

  const removePurchasedTemplate = async (templateId) => {
    setPurchasedTemplates(prev => prev.filter(t => t.id !== templateId));
    toast.success("Template removed from your collection.");
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      purchasedTemplates,
      addToCart,
      removeFromCart,
      checkout,
      cartTotal,
      isLoggedIn,
      hasPlayedIntro,
      setHasPlayedIntro,
      removePurchasedTemplate,
      loadPurchasedTemplates
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
