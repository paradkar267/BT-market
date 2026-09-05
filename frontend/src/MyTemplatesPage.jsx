import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Download, 
  LayoutTemplate, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  Eye, 
  RotateCcw, 
  X,
  Sparkles,
  Package,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag,
  ExternalLink,
  Layers,
  FolderCode,
  Star,
  Check,
  Clock,
  Code2
} from 'lucide-react';
import { useCart } from './CartContext';
import { useTemplates } from './useTemplates';
import { useCurrency } from './CurrencyContext';
import UserMenu from './UserMenu';
import { toast } from 'sonner';
import { Logo } from './components/ui/Logo';
import Navbar from './components/Navbar';
import { Footerdemo } from './components/ui/footer-section';

export default function MyTemplatesPage() {
  const { purchasedTemplates, loadPurchasedTemplates } = useCart();
  const { templates } = useTemplates();
  const { currency } = useCurrency ? useCurrency() : { currency: 'INR' };
  const [downloading, setDownloading] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  // Refund request state
  const [refundTarget, setRefundTarget] = useState(null); // template object
  const [refundReasonCategory, setRefundReasonCategory] = useState('');
  const [refundReasonDetails, setRefundReasonDetails] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  // Recommended templates when empty
  const recommendedTemplates = (templates || []).slice(0, 3);

  const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '₹';

  const handleRequestRefund = async () => {
    const combinedReason = [refundReasonCategory, refundReasonDetails.trim()].filter(Boolean).join(': ');
    if (!refundTarget || !combinedReason.trim()) {
      toast.error('Please select or describe a reason for your refund request.');
      return;
    }

    setRefundSubmitting(true);
    const toastId = toast.loading('Submitting refund request to support...');

    try {
      const token = localStorage.getItem('bizleap_token') || localStorage.getItem('sb-access-token') || '';
      if (!token) throw new Error('Please log in to submit a refund request');

      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/request-refund`);
      targetUrls.push('/api/request-refund');

      let response = null;
      let data = {};

      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
              templateId: refundTarget.id, 
              reason: combinedReason.trim() 
            })
          });
          const text = await res.text();
          data = text ? JSON.parse(text) : {};
          if (res.ok) {
            response = res;
            break;
          }
        } catch {
          // try next
        }
      }

      if (!response || !response.ok) {
        throw new Error(data.error || 'Failed to submit refund request.');
      }

      toast.success(data.message || 'Refund request submitted! We\'ll review it within 1–2 business days.', { id: toastId });
      setRefundTarget(null);
      setRefundReasonCategory('');
      setRefundReasonDetails('');
      loadPurchasedTemplates();
    } catch (err) {
      toast.error(err.message || 'Failed to submit refund request.', { id: toastId });
    } finally {
      setRefundSubmitting(false);
    }
  };

  const handleDownload = useCallback(async (templateId, templateTitle) => {
    if (downloading[templateId]) return;

    setDownloading(prev => ({ ...prev, [templateId]: { progress: 0, done: false, link: null } }));
    toast.info(`Authenticating & generating secure token for ${templateTitle}...`);
    
    // Smooth progress animation for UX
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 12;
      if (progress < 90) {
        setDownloading(prev => ({ ...prev, [templateId]: { progress, done: false, link: null } }));
      }
    }, 350);

    try {
      const token = localStorage.getItem('bizleap_token');
      if (!token) throw new Error("Please log in to download");

      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/generate-download`);
      targetUrls.push('/api/generate-download');

      let response = null;
      let data = {};

      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ templateId })
          });

          const text = await res.text();
          data = text ? JSON.parse(text) : {};
          if (res.ok && data.downloadUrl) {
            response = res;
            break;
          }
        } catch {
          // Try next target URL
        }
      }

      clearInterval(progressInterval);

      if (!response || !response.ok || !data.downloadUrl) {
        throw new Error(data.error || "Failed to generate download link");
      }

      setDownloading(prev => ({ 
        ...prev, 
        [templateId]: { progress: 100, done: true, link: data.downloadUrl } 
      }));
      
      toast.success(`Secure temporary link generated!`, {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      });

      // Automatically reset the link right before it expires (55 seconds)
      setTimeout(() => {
        setDownloading(prev => {
          const newState = { ...prev };
          if (newState[templateId]?.done) {
            delete newState[templateId];
          }
          return newState;
        });
        toast.info(`The secure link for ${templateTitle} has expired. Please generate a new one if needed.`);
      }, 55000);
      
    } catch (error) {
      clearInterval(progressInterval);
      setDownloading(prev => {
        const newState = { ...prev };
        delete newState[templateId];
        return newState;
      });
      toast.error(error.message || "Failed to download template. Please try again.");
    }
  }, [downloading]);

  const handleExecuteDownload = async (templateId, templateTitle, link) => {
    const toastId = toast.loading(`Downloading ${templateTitle} ZIP package...`);
    try {
      const token = localStorage.getItem('bizleap_token') || '';
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const res = await fetch(link, { headers });
      if (!res.ok) {
        const errText = await res.text();
        let errMsg = 'Failed to download file';
        try { errMsg = JSON.parse(errText).error || errMsg; } catch {}
        throw new Error(errMsg);
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const cleanTitle = templateTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${cleanTitle}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);

      toast.success(`${templateTitle} downloaded successfully!`, { id: toastId });
    } catch (err) {
      console.error('Blob download error, falling back to direct link:', err);
      window.location.href = link;
      toast.dismiss(toastId);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadPurchasedTemplates();
    
    if (location.state?.showConfetti) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };
  
      const randomInRange = (min, max) => Math.random() * (max - min) + min;
  
      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
  
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      // Clear the state so it doesn't run again on refresh
      navigate('.', { replace: true, state: {} });
    }
  }, [location, navigate, loadPurchasedTemplates]);

  // Handle direct download trigger from email link: /my-templates?download=<id>
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const downloadId = searchParams.get('download');
    if (downloadId && purchasedTemplates && purchasedTemplates.length > 0) {
      const targetTmpl = purchasedTemplates.find(t => String(t.id) === String(downloadId));
      if (targetTmpl && !downloading[targetTmpl.id]) {
        const timer = setTimeout(() => {
          handleDownload(targetTmpl.id, targetTmpl.title);
          navigate('.', { replace: true, state: {} });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [location.search, purchasedTemplates, downloading, handleDownload, navigate]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#07090c] text-black dark:text-white font-sans flex flex-col justify-between transition-colors duration-500 relative overflow-hidden">
      {/* Subtle Ambient Background Mesh Highlights */}
      <div className="absolute -top-40 left-1/4 w-[500px] h-[350px] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.06] blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-96 right-10 w-[450px] h-[300px] bg-amber-500/[0.03] dark:bg-amber-500/[0.05] blur-[120px] pointer-events-none rounded-full" />

      <div>
        <Navbar />

        <main className="max-w-[1300px] mx-auto px-5 sm:px-8 md:px-12 pt-8 pb-20 relative z-10">
          
          {/* Breadcrumb & Navigation Link */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link 
              to="/templates" 
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 text-gray-600 dark:text-gray-300 font-bold text-xs hover:text-black dark:hover:text-white transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Marketplace</span>
            </Link>

            {purchasedTemplates && purchasedTemplates.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Commercial License Active</span>
              </div>
            )}
          </div>

          {/* Page Heading & Header Stats */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-black/[0.06] dark:border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-black uppercase tracking-wider mb-3">
                <Package className="w-3.5 h-3.5" />
                <span>Your Digital Vault</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
                My Templates
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl leading-relaxed">
                Access your production source codes, generate secure temporary download tokens, and claim lifetime framework updates.
              </p>
            </div>

            {purchasedTemplates && purchasedTemplates.length > 0 && (
              <div className="flex items-center gap-3 shrink-0">
                <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-black/10 dark:border-white/10 shadow-xs text-center">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Purchased</div>
                  <div className="text-xl font-black text-gray-900 dark:text-white">{purchasedTemplates.length}</div>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 shadow-xs text-center">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Updates</div>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">Lifetime</div>
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════
              EMPTY STATE (ELEVATED LUXURY DESIGN)
          ══════════════════════════════════════════════ */}
          {!purchasedTemplates || purchasedTemplates.length === 0 ? (
            <div className="space-y-12">
              
              {/* Main Hero Empty Card */}
              <div className="relative rounded-3xl bg-white/80 dark:bg-white/[0.02] backdrop-blur-2xl border border-black/[0.08] dark:border-white/10 p-10 sm:p-14 md:p-16 shadow-xl shadow-black/[0.02] text-center overflow-hidden">
                {/* Subtle Inner Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-gradient-to-b from-indigo-500/10 to-transparent blur-2xl pointer-events-none" />

                {/* Floating Modern Icon Stack */}
                <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 opacity-20 blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-gray-100 to-white dark:from-zinc-900 dark:to-zinc-800 border border-black/10 dark:border-white/15 flex items-center justify-center shadow-lg">
                    <FolderCode className="w-9 h-9 text-indigo-600 dark:text-indigo-400" />
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md">
                      <Sparkles className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                  Your library is waiting for its first build
                </h2>
                
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed font-normal">
                  You haven't unlocked any website templates yet. Discover high-performance React 19 UI kits, Next.js stacks, and SaaS dashboards with full commercial source code.
                </p>

                {/* Dual Interactive Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3.5">
                  <Link 
                    to="/templates" 
                    className="px-7 py-3.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-400 dark:text-amber-500" />
                    <span>Explore 50+ Templates</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link 
                    to="/featured" 
                    className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 rounded-2xl font-bold text-sm flex items-center gap-2 border border-black/5 dark:border-white/10 transition-all cursor-pointer"
                  >
                    <span>🔥 View Featured Drops</span>
                  </Link>
                </div>

                {/* Welcome Discount Coupon Perk */}
                <div className="mt-10 pt-6 border-t border-black/[0.06] dark:border-white/[0.08] inline-flex flex-wrap items-center justify-center gap-2.5 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">🎁 First-time builder discount:</span>
                  <span className="font-mono font-black bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                    WELCOME10
                  </span>
                  <span>Apply at checkout for 10% OFF</span>
                </div>
              </div>

              {/* ── Popular Starter Picks Strip ── */}
              {recommendedTemplates.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <span>Recommended Starter Templates</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Top-rated templates chosen by other founders and developers this week.
                      </p>
                    </div>

                    <Link 
                      to="/templates" 
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedTemplates.map((template) => (
                      <div 
                        key={template.id}
                        className="group rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.08] dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 flex flex-col"
                      >
                        <div className="relative aspect-[16/10] bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                          <img 
                            src={template.image} 
                            alt={template.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Link 
                              to={`/product/${template.id}`}
                              className="px-3.5 py-1.5 rounded-xl bg-white text-black font-bold text-xs shadow-md flex items-center gap-1.5 hover:scale-105 transition-transform"
                            >
                              <Eye className="w-3.5 h-3.5" /> Details
                            </Link>
                            {template.previewUrl && (
                              <Link 
                                to={template.previewUrl}
                                target="_blank"
                                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 hover:scale-105 transition-transform"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                              </Link>
                            )}
                          </div>
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-wider">
                            {template.category || 'React'}
                          </span>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                              {template.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                              {template.description || 'Production-grade responsive UI kit with complete source code included.'}
                            </p>
                          </div>

                          <div className="mt-4 pt-4 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between">
                            <div className="text-sm font-black text-gray-900 dark:text-white">
                              {currencySymbol}{Number(template.price || 0).toLocaleString()}
                            </div>
                            <Link 
                              to={`/product/${template.id}`}
                              className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold text-xs transition-colors"
                            >
                              Get Template →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 3 Trust Features Strip ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/10 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-gray-900 dark:text-white">Instant ZIP Delivery</h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Download starts immediately after checkout.</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/10 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-gray-900 dark:text-white">Commercial License</h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Unlimited client and personal production apps.</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/10 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-gray-900 dark:text-white">14-Day Money Back</h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Hassle-free guarantee if code has issues.</p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* ══════════════════════════════════════════════
               POPULATED STATE (PURCHASED TEMPLATES CARDS)
            ══════════════════════════════════════════════ */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
              {purchasedTemplates.map(template => {
                const isDownloading = downloading[template.id] !== undefined;
                const progress = isDownloading ? downloading[template.id].progress : 0;
                const isDone = isDownloading && downloading[template.id].done;

                return (
                  <div 
                    key={template.id} 
                    className="glass-panel p-6 rounded-3xl flex flex-col group hover:shadow-2xl transition-all duration-300 border border-gray-200/80 dark:border-white/10 bg-white/90 dark:bg-gray-900/60 relative overflow-hidden backdrop-blur-md"
                  >
                    {/* Top Image Preview */}
                    <div className="w-full aspect-[16/10] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-5 relative group/img cursor-pointer shadow-inner">
                      <img 
                        src={template.image} 
                        alt={template.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <Link 
                        to={`/product/${template.id}`} 
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <span className="bg-white text-black px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg scale-90 group-hover/img:scale-100 transition-transform">
                          <Eye className="w-4 h-4"/> View Template Details
                        </span>
                      </Link>

                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" /> Owned
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                          {template.category || 'React'}
                        </p>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Lifetime Updates
                        </span>
                      </div>
                      <h3 className="text-lg font-black mb-2 text-gray-900 dark:text-gray-100 leading-snug">
                        {template.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {template.description || 'Full React & Next.js codebase, clean component architecture, and commercial license.'}
                      </p>
                    </div>

                    {/* Download Controls & Actions */}
                    <div className="pt-5 border-t border-gray-100 dark:border-white/10 mt-5 relative">
                      {isDownloading && !isDone && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2 -mt-2">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-300 ease-out" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                      
                      <div className="flex gap-2 w-full">
                        {isDone ? (
                          <div className="flex-1 flex flex-col gap-2">
                            <button 
                              onClick={() => handleExecuteDownload(template.id, template.title, downloading[template.id].link)}
                              className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                            >
                              <Download className="w-4 h-4" /> Download ZIP Now
                            </button>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center font-medium">
                              Link expires in 60s for your security.
                            </p>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleDownload(template.id, template.title)}
                            disabled={isDownloading}
                            className={`flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                              isDownloading
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                : 'bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-gray-100 cursor-pointer shadow-md'
                            }`}
                          >
                            {isDownloading ? (
                              <><Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> Generating Token... {progress}%</>
                            ) : (
                              <><Download className="w-4 h-4" /> Generate Download Link</>
                            )}
                          </button>
                        )}
                        
                        {/* Request Refund Action */}
                        {!isDownloading && !isDone && (
                          <button
                            onClick={() => { setRefundTarget(template); setRefundReasonCategory("Technical issue / can't open files"); setRefundReasonDetails(''); }}
                            className="px-3 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-500/40 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer"
                            title="Request a Refund"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>

      {/* Upgraded Luxury Marketplace Footer */}
      <Footerdemo />

      {/* ── Refund Request Modal ── */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111111] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-md">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <RotateCcw className="w-5 h-5 text-red-500" />
                  <h3 className="font-black text-lg">Request a Refund</h3>
                </div>
                <p className="text-xs text-gray-500">For: <strong>{refundTarget.title}</strong></p>
              </div>
              <button onClick={() => setRefundTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tell us why you'd like a refund. Our team reviews all requests within <strong>1–2 business days</strong>.
              </p>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Reason for Refund *</label>
                <select
                  value={refundReasonCategory}
                  onChange={e => setRefundReasonCategory(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-2"
                >
                  <option value="">— Select a reason —</option>
                  <option value="Technical issue / can't open files">Technical issue / can't open files</option>
                  <option value="Accidental purchase">Accidental purchase</option>
                  <option value="Not as described">Not as described</option>
                  <option value="Duplicate purchase">Duplicate purchase</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Other reason">Other reason</option>
                </select>
                <textarea
                  value={refundReasonDetails}
                  onChange={e => setRefundReasonDetails(e.target.value)}
                  placeholder="Describe your issue or additional details..."
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>
              <p className="text-xs text-gray-400">
                By submitting, our support team will be notified and you'll receive a confirmation email.
              </p>
            </div>
            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setRefundTarget(null)}
                disabled={refundSubmitting}
                className="px-5 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRefund}
                disabled={refundSubmitting || (!refundReasonCategory && !refundReasonDetails.trim())}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-black flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {refundSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><RotateCcw className="w-4 h-4" /> Submit Request</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
