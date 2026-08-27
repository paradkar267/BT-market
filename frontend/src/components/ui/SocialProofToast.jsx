import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { useTheme } from '../../ThemeContext';
import { useAuth } from '../../AuthContext';
import { supabase } from '../../lib/supabase';
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
        const { data: purchasesData } = await supabase
          .from('purchases')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (purchasesData && purchasesData.length > 0) {
          const { data: profilesData } = await supabase.from('profiles').select('id, full_name');
          
          const formatted = purchasesData.map(p => {
            const tmpl = marketplaceTemplates.find(t => t.id === p.template_id);
            const prof = profilesData?.find(pr => pr.id === p.user_id);
            
            const diff = Math.floor((new Date() - new Date(p.created_at)) / 60000);
            let timeStr = diff < 1 ? "Just now" : diff < 60 ? `${diff} mins ago` : diff < 1440 ? `${Math.floor(diff/60)} hours ago` : `${Math.floor(diff/1440)} days ago`;

            return {
              name: prof?.full_name || "A User",
              item: tmpl?.title || "A Template",
              time: timeStr
            };
          });
          setRealPurchases(formatted);
        }
      } catch (err) {
        console.error("Error fetching toast purchases", err);
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
        const nextDelay = Math.floor(Math.random() * (30000 - 15000 + 1) + 15000);
        timerRef.current = setTimeout(showRandomPurchase, nextDelay);
      }, 5000);
    };

    const initialTimer = setTimeout(() => {
      showRandomPurchase();
    }, 5000);

    return () => {
      clearTimeout(initialTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAdmin, realPurchases]);

  if (!isAdmin) return null;

  return (
    <AnimatePresence>
      {isVisible && currentPurchase && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className={`fixed bottom-6 left-6 z-[9999] flex items-center gap-4 p-4 pr-10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border cursor-pointer hover:scale-105 transition-transform backdrop-blur-xl ${
            isDark 
              ? 'bg-black/60 border-white/10 text-white shadow-[0_10px_40px_rgba(0,0,0,0.5)]' 
              : 'bg-white/80 border-gray-200 text-black'
          }`}
          onClick={() => setIsVisible(false)}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
            isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'
          }`}>
            <ShoppingBag className="w-5 h-5" />
          </div>
          
          <div>
            <p className="text-sm font-bold leading-tight mb-1">
              {currentPurchase.name}
            </p>
            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              purchased <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{currentPurchase.item}</span>
            </p>
            <p className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {currentPurchase.time}
            </p>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
            className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${
              isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-400 hover:text-black'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
