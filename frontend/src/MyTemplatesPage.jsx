import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Download, LayoutTemplate, ArrowLeft, Loader2, CheckCircle2, Eye, RotateCcw, X } from 'lucide-react';
import { useCart } from './CartContext';
import UserMenu from './UserMenu';
import { toast } from 'sonner';
import { Logo } from './components/ui/Logo';
import Navbar from './components/Navbar';

export default function MyTemplatesPage() {
  const { purchasedTemplates, loadPurchasedTemplates } = useCart();
  const [downloading, setDownloading] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  // Refund request state
  const [refundTarget, setRefundTarget] = useState(null); // template object
  const [refundReasonCategory, setRefundReasonCategory] = useState('');
  const [refundReasonDetails, setRefundReasonDetails] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);

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
    
    // Fake progress animation for UX
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress < 90) {
        setDownloading(prev => ({ ...prev, [templateId]: { progress, done: false, link: null } }));
      }
    }, 400);

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
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
      });

      // Automatically reset the link right before it expires (55 seconds)
      setTimeout(() => {
        setDownloading(prev => {
          const newState = { ...prev };
          if (newState[templateId]?.done) {
            delete newState[templateId]; // reset entirely
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
      // Fallback to direct navigation since link has signed token
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
    <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white font-sans pb-24 transition-colors duration-500">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-8 md:px-16 mt-12 relative">
        <Link to="/templates" className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-black dark:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Market
        </Link>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-12">My Templates</h1>

        {!purchasedTemplates || purchasedTemplates.length === 0 ? (
          <div className="bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl p-16 md:p-32 rounded-[3rem] border border-black/[0.04] dark:border-white/[0.05] shadow-[0_20px_40px_rgba(0,0,0,0.02)] text-center">
             <div className="w-32 h-32 bg-gray-100 dark:bg-gray-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <LayoutTemplate className="w-12 h-12 text-gray-300 dark:text-gray-600" />
             </div>
             <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-4">No templates yet</h2>
             <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
               You haven't purchased any templates. Explore the marketplace to find the perfect template for your next project.
             </p>
             <Link to="/" className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:scale-105 transition-transform shadow-lg inline-block">
                Explore Market
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {purchasedTemplates.map(template => {
              const isDownloading = downloading[template.id] !== undefined;
              const progress = isDownloading ? downloading[template.id].progress : 0;
              const isDone = isDownloading && downloading[template.id].done;

              return (
                <div key={template.id} className="glass-panel p-6 rounded-[2rem] flex flex-col group hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/50 relative overflow-hidden">
                   <div className="w-full aspect-[16/10] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-6 relative group/img cursor-pointer">
                      <img src={template.image} alt={template.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <Link to={`/product/${template.id}`} className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg scale-90 group-hover/img:scale-100 transition-transform">
                          <Eye className="w-4 h-4"/> View Template
                        </span>
                      </Link>
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{template.category}</p>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{template.title}</h3>
                   </div>
                   <div className="pt-6 border-t border-gray-100 dark:border-white/10 mt-6 relative">
                      {isDownloading && !isDone && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2 -mt-2">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300 ease-out" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                      
                      <div className="flex gap-2 w-full">
                        {isDone ? (
                          <div className="flex-1 flex flex-col gap-2">
                            <button 
                              onClick={() => handleExecuteDownload(template.id, template.title, downloading[template.id].link)}
                              className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                            >
                              <CheckCircle2 className="w-5 h-5" /> Download Ready
                            </button>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center font-medium">
                              Link expires in 60 seconds.
                            </p>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleDownload(template.id, template.title)}
                            disabled={isDownloading}
                            className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                              isDownloading
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                            }`}
                          >
                            {isDownloading ? (
                              <><Loader2 className="w-5 h-5 animate-spin" /> Generating Token... {progress}%</>
                            ) : (
                              <><Download className="w-5 h-5" /> Generate Secure Link</>
                            )}
                          </button>
                        )}
                        
                        {/* Request Refund */}
                        {!isDownloading && !isDone && (
                          <button
                            onClick={() => { setRefundTarget(template); setRefundReasonCategory("Technical issue / can't open files"); setRefundReasonDetails(''); }}
                            className="px-3 py-4 rounded-xl border border-gray-200 dark:border-white/10 text-gray-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-500/40 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer"
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
      </div>

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
