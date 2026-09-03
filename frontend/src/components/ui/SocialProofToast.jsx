import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { useTheme } from '../../ThemeContext';
import { useAuth } from '../../AuthContext';
import { api } from '../../lib/api';
import { useTemplates } from '../../useTemplates';

export function SocialProofToast() {
  const { isAdmin } = useAuth();
  const [currentPurchase, setCurrentPurchase] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [realPurchases, setRealPurchases] = useState([]);
  const timerRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { templates: marketplaceTemplates } = useTemplates();

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchRealPurchases = async () => {
      try {
        const res = await api.get('/api/admin/orders');
        if (res?.orders && res.orders.length > 0) {
          const formatted = res.orders.slice(0, 10).map(p => {
            const diff = Math.floor((new Date() - new Date(p.created_at)) / 60000);
            let timeStr = diff < 1 ? "Just now" : diff < 60 ? `${diff} mins ago` : diff < 1440 ? `${Math.floor(diff/60)} hours ago` : `${Math.floor(diff/1440)} days ago`;

            return {
              name: p.customer?.fullName || "A User",
              item: p.template?.title || "A Template",
              time: timeStr
            };
          });
          setRealPurchases(formatted);
        }
      } catch (err) {
        // Fallback: silent ignore
      }
    };
    
    fetchRealPurchases();
  }, [isAdmin, marketplaceTemplates]);

  useEffect(() => {
    if (!isAdmin || realPurchases.length === 0) return;
    
    const showRandomPurchase = () => {
      const randomPurchase = realPurchases[Math.floor(Math.random() * realPurchases.length)];
      setCurrentPurchase(randomPurchase);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    const initialTimeout = setTimeout(showRandomPurchase, 8000);
    timerRef.current = setInterval(showRandomPurchase, 20000);

    return () => {
      clearTimeout(initialTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAdmin, realPurchases]);

  if (!isAdmin || !isVisible || !currentPurchase) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md p-3.5 pr-8 rounded-2xl shadow-xl border border-black/10 dark:border-white/10 max-w-sm"
      >
        <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 shadow-md">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-900 dark:text-white">
            <strong className="text-black dark:text-white font-bold">{currentPurchase.name}</strong> just purchased
          </span>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate max-w-[180px]">
            {currentPurchase.item}
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5">{currentPurchase.time}</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

export default SocialProofToast;
