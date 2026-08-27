import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Smartphone, Tablet, ExternalLink, Loader2 } from 'lucide-react';

export function LivePreviewModal({ isOpen, onClose, template }) {
  const [device, setDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !template) return null;

  const previewUrl = template.previewUrl;

  const deviceConfig = {
    desktop: { width: '100%', height: '100%', borderRadius: 12 },
    tablet: { width: 820, height: 1180, borderRadius: 32 },
    mobile: { width: 375, height: 812, borderRadius: 44 },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col"
      >
        {/* Top Bar */}
        <div className="h-16 shrink-0 bg-[#111] border-b border-white/10 flex items-center justify-between px-6 z-50">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-semibold tracking-wide truncate max-w-[200px] sm:max-w-md">
              {template.title}
            </h2>
            <span className="hidden sm:inline-block px-3 py-1 bg-white/10 text-white text-[10px] rounded-full uppercase tracking-widest font-medium">
              {template.category}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Device Toggles */}
            <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10 hidden sm:flex">
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

            <div className="w-px h-6 bg-white/20 mx-2 hidden sm:block"></div>

            <a 
              href={previewUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors font-medium"
              title="Open in new tab"
            >
              <span className="hidden sm:inline">Open App</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-red-500 hover:text-white text-gray-400 rounded-lg transition-colors ml-2"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black">
          <motion.div
            layout
            initial={false}
            animate={{
              width: deviceConfig[device].width,
              height: deviceConfig[device].height,
              borderRadius: deviceConfig[device].borderRadius,
            }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
            className={`relative bg-white overflow-hidden transition-all shadow-2xl flex flex-col ${
              device === 'mobile' 
                ? 'border-[14px] border-[#1a1a1a] ring-1 ring-white/20 max-h-[90vh]' 
                : device === 'tablet'
                ? 'border-[16px] border-[#1a1a1a] ring-1 ring-white/20 max-h-[90vh]'
                : 'border border-white/10 mt-4 rounded-xl'
            }`}
          >
            {/* Desktop macOS Window Dots */}
            {device === 'desktop' && (
              <div className="h-10 bg-[#f1f1f1] w-full flex items-center px-4 border-b border-gray-200 shrink-0">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
                </div>
                <div className="mx-auto bg-white px-32 py-1 rounded-md text-[10px] text-gray-400 font-mono border border-gray-200 shadow-sm flex items-center gap-2">
                  <Monitor className="w-3 h-3" />
                  {new URL(previewUrl, window.location.origin).hostname}
                </div>
              </div>
            )}

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
                 <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              </div>
            )}

            {/* Iframe */}
            {previewUrl ? (
              <iframe
                src={previewUrl}
                title={`Preview of ${template.title}`}
                className="w-full h-full border-0 bg-white relative z-0 flex-1"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => setIframeLoaded(true)}
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
      </motion.div>
    </AnimatePresence>
  );
}
