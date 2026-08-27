import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Clock, Copy, Check, X, ArrowRight, Flame } from 'lucide-react';
import { toast } from 'sonner';

export default function FlashSaleTopBar() {
  const [banner, setBanner] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
  const [copied, setCopied] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Don't render inside admin dashboard or standalone preview page
  const isHiddenRoute = location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/preview');

  // Check session dismissal state
  useEffect(() => {
    const dismissed = sessionStorage.getItem('bzlp_flash_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Fetch Banner Configuration
  useEffect(() => {
    let isMounted = true;

    async function fetchBanner() {
      try {
        const res = await fetch(`/api/announcement-banner?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.banner) {
            setBanner(data.banner);
          }
        }
      } catch {
        // Fallback banner
        if (isMounted) {
          setBanner({
            is_enabled: true,
            headline: '🔥 Weekend Mega Flash Sale Ends in:',
            coupon_code: 'LAUNCH50',
            discount_badge: '50% OFF',
            button_text: 'Claim 50% OFF Now →',
            button_url: '/explore',
            end_time: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
            theme: 'fire',
            is_dismissible: true
          });
        }
      }
    }

    fetchBanner();

    // Listen for custom event when admin updates settings
    const handleUpdate = () => {
      setIsDismissed(false);
      sessionStorage.removeItem('bzlp_flash_banner_dismissed');
      fetchBanner();
    };
    window.addEventListener('flash_banner_updated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('flash_banner_updated', handleUpdate);
    };
  }, []);

  // Real-time Countdown Timer Ticker
  useEffect(() => {
    if (!banner?.end_time) return;

    function calculateTime() {
      const target = new Date(banner.end_time).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [banner?.end_time]);

  const handleCopyCoupon = (e) => {
    e.stopPropagation();
    if (!banner?.coupon_code) return;
    navigator.clipboard.writeText(banner.coupon_code);
    setCopied(true);
    toast.success(`Coupon code "${banner.coupon_code}" copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
    sessionStorage.setItem('bzlp_flash_banner_dismissed', 'true');
  };

  const handleActionClick = () => {
    if (banner?.button_url) {
      if (banner.button_url.startsWith('http')) {
        window.open(banner.button_url, '_blank');
      } else {
        navigate(banner.button_url);
      }
    }
  };

  if (isHiddenRoute || !banner || !banner.is_enabled || isDismissed || timeLeft.isExpired) {
    return null;
  }

  // Theme Gradients & Accents
  const themes = {
    fire: {
      bar: 'bg-gradient-to-r from-red-700 via-amber-600 to-orange-600 text-white shadow-lg shadow-orange-950/20 border-b border-amber-400/30',
      badge: 'bg-black/30 border-amber-300/40 text-amber-200',
      coupon: 'bg-white text-orange-700 hover:bg-orange-50 border-white/60 shadow-sm',
      cta: 'bg-black/40 hover:bg-black/60 text-white border-amber-300/40',
      glow: 'from-amber-400 to-red-500'
    },
    cyber: {
      bar: 'bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-700 text-white shadow-lg shadow-indigo-950/20 border-b border-indigo-400/30',
      badge: 'bg-black/30 border-pink-300/40 text-pink-200',
      coupon: 'bg-white text-indigo-700 hover:bg-indigo-50 border-white/60 shadow-sm',
      cta: 'bg-black/40 hover:bg-black/60 text-white border-indigo-300/40',
      glow: 'from-purple-400 to-indigo-500'
    },
    emerald: {
      bar: 'bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-700 text-white shadow-lg shadow-emerald-950/20 border-b border-emerald-400/30',
      badge: 'bg-black/30 border-emerald-300/40 text-emerald-200',
      coupon: 'bg-white text-emerald-700 hover:bg-emerald-50 border-white/60 shadow-sm',
      cta: 'bg-black/40 hover:bg-black/60 text-white border-emerald-300/40',
      glow: 'from-emerald-300 to-teal-400'
    },
    sunset: {
      bar: 'bg-gradient-to-r from-rose-700 via-orange-600 to-amber-600 text-white shadow-lg shadow-rose-950/20 border-b border-rose-400/30',
      badge: 'bg-black/30 border-rose-300/40 text-rose-200',
      coupon: 'bg-white text-rose-700 hover:bg-rose-50 border-white/60 shadow-sm',
      cta: 'bg-black/40 hover:bg-black/60 text-white border-rose-300/40',
      glow: 'from-rose-300 to-amber-400'
    }
  };

  const currentTheme = themes[banner.theme] || themes.fire;

  // Format two digits
  const f = (n) => String(n).padStart(2, '0');

  return (
    <aside 
      aria-label="Flash Sale Announcement"
      className={`relative z-[90] w-full transition-all duration-300 py-2 sm:py-2.5 px-3 sm:px-6 ${currentTheme.bar}`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs sm:text-sm font-medium">
        
        {/* Left Side: Animated Badge & Headline */}
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          {banner.discount_badge && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-sm ${currentTheme.badge}`}>
              <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              {banner.discount_badge}
            </span>
          )}

          <span className="font-bold text-white tracking-tight drop-shadow-sm truncate">
            {banner.headline}
          </span>

          {/* Real-time Countdown Timer Display */}
          <div className="inline-flex items-center gap-1 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 font-mono font-bold text-white tracking-wider text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            {timeLeft.days > 0 && (
              <>
                <span className="text-amber-200">{timeLeft.days}d</span>
                <span className="opacity-60">:</span>
              </>
            )}
            <span>{f(timeLeft.hours)}h</span>
            <span className="opacity-60 animate-pulse">:</span>
            <span>{f(timeLeft.minutes)}m</span>
            <span className="opacity-60 animate-pulse">:</span>
            <span className="text-amber-300">{f(timeLeft.seconds)}s</span>
          </div>
        </div>

        {/* Right Side: Coupon Pill, CTA Button, and Dismiss X */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap ml-auto">
          {banner.coupon_code && (
            <button
              onClick={handleCopyCoupon}
              title="Click to copy coupon code"
              className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-black text-xs transition-all duration-200 active:scale-95 border ${currentTheme.coupon}`}
            >
              <span className="text-[10px] text-gray-500 uppercase font-sans font-bold">Use Code:</span>
              <span className="tracking-wider">{banner.coupon_code}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
              ) : (
                <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          )}

          {banner.button_text && (
            <button
              onClick={handleActionClick}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-xs transition-all duration-200 hover:scale-105 active:scale-95 border backdrop-blur-sm shadow-sm ${currentTheme.cta}`}
            >
              <span>{banner.button_text}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {banner.is_dismissible && (
            <button
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-black/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </aside>
  );
}
