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
          const bannerData = data?.banner || (data?.id ? data : null);
          if (isMounted && bannerData) {
            setBanner(bannerData);
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
            theme: 'cyber',
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

  // Theme Gradients & Accents (Monochrome Luxury)
  const themes = {
    fire: {
      bar: 'bg-zinc-950 text-white shadow-lg border-b border-white/10',
      badge: 'bg-white/10 border-white/20 text-white',
      coupon: 'bg-white text-black hover:bg-zinc-200 border-white shadow-sm font-black',
      cta: 'bg-white/10 hover:bg-white/20 text-white border-white/20',
      glow: 'from-zinc-700 to-zinc-900'
    },
    cyber: {
      bar: 'bg-zinc-950 text-white shadow-lg border-b border-white/10',
      badge: 'bg-white/10 border-white/20 text-white',
      coupon: 'bg-white text-black hover:bg-zinc-200 border-white shadow-sm font-black',
      cta: 'bg-white/10 hover:bg-white/20 text-white border-white/20',
      glow: 'from-zinc-700 to-zinc-900'
    },
    emerald: {
      bar: 'bg-zinc-900 text-white shadow-lg border-b border-zinc-700',
      badge: 'bg-white/10 border-white/20 text-white',
      coupon: 'bg-white text-black hover:bg-zinc-200 border-white shadow-sm font-black',
      cta: 'bg-white/10 hover:bg-white/20 text-white border-white/20',
      glow: 'from-zinc-600 to-zinc-800'
    },
    sunset: {
      bar: 'bg-black text-white shadow-lg border-b border-white/15',
      badge: 'bg-white/10 border-white/20 text-white',
      coupon: 'bg-white text-black hover:bg-zinc-200 border-white shadow-sm font-black',
      cta: 'bg-white/10 hover:bg-white/20 text-white border-white/20',
      glow: 'from-zinc-800 to-black'
    }
  };

  const currentTheme = themes[banner.theme] || themes.cyber;

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
              <Flame className="w-3.5 h-3.5 text-white animate-pulse" />
              {banner.discount_badge}
            </span>
          )}

          <span className="font-bold text-white tracking-tight drop-shadow-sm truncate">
            {banner.headline}
          </span>

          {/* Real-time Countdown Timer Display */}
          <div className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 font-mono font-bold text-white tracking-wider text-xs">
            <Clock className="w-3.5 h-3.5 text-neutral-300" />
            {timeLeft.days > 0 && (
              <>
                <span className="text-white">{timeLeft.days}d</span>
                <span className="opacity-60">:</span>
              </>
            )}
            <span>{f(timeLeft.hours)}h</span>
            <span className="opacity-60 animate-pulse">:</span>
            <span>{f(timeLeft.minutes)}m</span>
            <span className="opacity-60 animate-pulse">:</span>
            <span className="text-white">{f(timeLeft.seconds)}s</span>
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
