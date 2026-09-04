import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Monitor, Smartphone, Tablet, ExternalLink, Loader2, ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { useTemplates } from './useTemplates';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useCurrency } from './CurrencyContext';
import SEO from './components/SEO';

export default function PreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { templates, loading: templatesLoading } = useTemplates();
  const { addToCart, cartItems, purchasedTemplates } = useCart();
  const { requireAuth } = useAuth();
  const { formatPrice } = useCurrency();
  
  const [device, setDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const handleIframeLoad = (e) => {
    setIframeLoaded(true);
    try {
      const iframe = e.target;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      // 1. Disable Right Click inside iframe
      iframeDoc.addEventListener('contextmenu', (event) => event.preventDefault());

      // 2. Disable Keyboard Shortcuts inside iframe
      iframeDoc.addEventListener('keydown', (event) => {
        // Prevent F12
        if (event.key === 'F12') {
          event.preventDefault();
          return false;
        }
        // Prevent Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J
        if (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'i' || event.key === 'C' || event.key === 'c' || event.key === 'J' || event.key === 'j')) {
          event.preventDefault();
          return false;
        }
        // Prevent Ctrl+U (View Source)
        if (event.ctrlKey && (event.key === 'U' || event.key === 'u')) {
          event.preventDefault();
          return false;
        }
        // Prevent Ctrl+S (Save Page)
        if (event.ctrlKey && (event.key === 'S' || event.key === 's')) {
          event.preventDefault();
          return false;
        }
      });

      // 3. Inject CSS to disable user selection inside iframe
      const style = iframeDoc.createElement('style');
      style.textContent = `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
      `;
      iframeDoc.head.appendChild(style);
    } catch (err) {
      console.warn("Could not inject restrictions inside iframe (likely cross-origin):", err);
    }
  };

  // Find the template
  let template = templates.find(t => String(t.id) === String(id));
  if (template) {
    template = { ...template, is_sold_out: false };
  }
  
  // Set background to dark for the whole page & block devtool access / contextmenu
  useEffect(() => {
    document.body.style.backgroundColor = '#000';

    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      // Block F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Block Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        return false;
      }
      // Block Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return false;
      }
      // Block Ctrl+S (Save Page)
      if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.backgroundColor = '';
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (templatesLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-white/50" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white gap-4">
        <h1 className="text-2xl font-bold">Template Not Found</h1>
        <Link to="/" className="text-white hover:underline">Back to Home</Link>
      </div>
    );
  }

  const previewUrl = template.previewUrl;
  const inCart = cartItems.some(item => item.id === template.id);
  const isOwned = purchasedTemplates?.some(item => item.id === template.id);

  const deviceConfig = {
    desktop: { width: '100%', height: '100%', borderRadius: 0 },
    tablet: { width: 820, height: '90%', borderRadius: 32 },
    mobile: { width: 375, height: 812, borderRadius: 44 },
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden font-sans">
      <SEO 
        title={`Live Preview - ${template.title} | BizLeap Marketplace`}
        description={`Explore full interactive live demo and responsive preview of ${template.title}. Production-ready code with lifetime updates.`}
        image={template.image}
        url={`/preview/${template._id || template.id}`}
        product={template}
      />
      
      {/* Top Bar */}
      <div className="h-[72px] shrink-0 bg-[#0f0f11] border-b border-white/10 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-50">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:flex flex-col">
            <h1 className="text-white font-bold tracking-wide truncate max-w-[200px] md:max-w-xs lg:max-w-md">
              {template.title}
            </h1>
            <span className="text-gray-500 text-xs font-medium">
              by <span className="text-white">{template.author}</span>
            </span>
          </div>
        </div>

        {/* Center: Device Toggles */}
        <div className="flex-1 flex justify-center hidden md:flex">
          <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-2 rounded-md transition-all ${
                device === 'desktop' ? 'bg-white/20 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-2 rounded-md transition-all ${
                device === 'tablet' ? 'bg-white/20 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-2 rounded-md transition-all ${
                device === 'mobile' ? 'bg-white/20 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-4 flex-1">
          <a 
            href={previewUrl} 
            target="_blank" 
            rel="noreferrer"
            className="text-gray-400 hover:text-white hidden sm:flex items-center gap-2 text-sm transition-colors font-medium bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border-white/5"
            title="Open in new tab"
          >
            <span>Open Frame</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="w-px h-6 bg-white/20 mx-2 hidden sm:block"></div>

          <button 
            onClick={() => {
              if (isOwned || template.is_sold_out) return;
              requireAuth(() => addToCart(template));
            }}
            disabled={isOwned || template.is_sold_out}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              template.is_sold_out
              ? 'bg-red-900/50 text-red-400 cursor-not-allowed border border-red-500/30'
              : isOwned
              ? 'bg-white/5 text-gray-500 cursor-not-allowed'
              : inCart 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-white hover:bg-zinc-200 text-black shadow-lg font-black'
            }`}
          >
            {template.is_sold_out ? (
              'Sold Out'
            ) : isOwned ? (
              <><Check className="w-4 h-4" /> Owned</>
            ) : inCart ? (
              'In Cart'
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Buy Now - {formatPrice(template.price)}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Iframe Area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black p-0 sm:p-4 md:p-8">
        <motion.div
          layout
          initial={false}
          animate={{
            width: deviceConfig[device].width,
            height: deviceConfig[device].height,
            borderRadius: device === 'desktop' ? 0 : deviceConfig[device].borderRadius,
          }}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
          className={`relative bg-white overflow-hidden transition-all flex flex-col ${
            device === 'mobile' 
              ? 'border-[14px] border-[#1a1a1a] ring-1 ring-white/20 shadow-2xl max-h-[90vh]' 
              : device === 'tablet'
              ? 'border-[16px] border-[#1a1a1a] ring-1 ring-white/20 shadow-2xl'
              : 'w-full h-full'
          }`}
        >
          {/* Fake iPhone Dynamic Island for mobile view */}
          {device === 'mobile' && (
            <div className="absolute top-2 inset-x-0 h-7 bg-black flex justify-center z-10 rounded-full w-28 mx-auto shadow-sm">
              <div className="w-2 h-2 bg-[#1a1a1a] rounded-full absolute right-3 top-1/2 -translate-y-1/2 border border-white/5"></div>
            </div>
          )}

          {/* Fake iPad Camera for tablet view */}
          {device === 'tablet' && (
            <div className="absolute left-1/2 -top-[10px] -translate-x-1/2 h-2 w-2 bg-black rounded-full z-10 flex items-center justify-center border border-white/10">
               <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
            </div>
          )}

          {/* Loading Spinner */}
          {!iframeLoaded && previewUrl && (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
               <Loader2 className="w-10 h-10 animate-spin text-black" />
            </div>
          )}

          {/* Iframe */}
          {previewUrl ? (
            <iframe
              src={previewUrl}
              title={`Preview of ${template.title}`}
              className="w-full h-full border-0 bg-white relative z-0 flex-1 select-none"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={handleIframeLoad}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-center p-8">
              <Monitor className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Preview Available</h3>
              <p className="text-gray-500 max-w-sm">
                This template does not have a live preview link.
              </p>
            </div>
          )}

          {/* Home Indicator for Mobile/Tablet */}
          {(device === 'mobile' || device === 'tablet') && (
            <div className="absolute bottom-1 inset-x-0 h-1 bg-black/20 rounded-full w-1/3 mx-auto z-10" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
