import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trash2, 
  Lock, 
  ShieldCheck, 
  ShoppingCart, 
  CheckCircle2, 
  Tag, 
  Sparkles, 
  X, 
  Download, 
  Zap, 
  RefreshCw, 
  BadgeCheck,
  CreditCard 
} from 'lucide-react';
import { toast } from 'sonner';

import { useCart } from './CartContext';
import { useCurrency } from './CurrencyContext';
import UserMenu from './UserMenu';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { Logo } from './components/ui/Logo';

export default function CartPage() {
  const { cartItems, removeFromCart, checkout, cartTotal, loadPurchasedTemplates } = useCart();
  const { formatPrice, convertPrice, currency } = useCurrency();
  const { theme } = useTheme();
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  // Promo Code State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount, finalTotal, discount_type, discount_value }
  const [couponLoading, setCouponLoading] = useState(false);

  const finalPayableTotal = appliedCoupon ? Math.max(0, cartTotal - appliedCoupon.discount) : cartTotal;

  const handleApplyCoupon = async (e, customCode) => {
    if (e) e.preventDefault();
    const codeToApply = (customCode || couponInput).trim();
    if (!codeToApply) {
      toast.error('Please enter a promo code');
      return;
    }

    setCouponLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/validate-coupon`);
      targetUrls.push('/api/validate-coupon');

      let result = null;
      let errorMsg = 'Invalid promo code';

      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: codeToApply,
              cartTotal,
              userId: user?.id,
              userEmail: user?.email
            })
          });
          const resJson = await res.json();
          if (res.ok && resJson.valid) {
            result = resJson;
            break;
          } else if (resJson.error) {
            errorMsg = resJson.error;
            break;
          }
        } catch {
          // try next
        }
      }

      if (result && result.valid) {
        setAppliedCoupon({
          code: result.coupon.code,
          discount: result.discount,
          finalTotal: result.finalTotal,
          discount_type: result.coupon.discount_type,
          discount_value: result.coupon.discount_value
        });
        toast.success(`🎉 Promo code '${result.coupon.code}' applied! You saved ₹${result.discount}`);
        setCouponInput('');
      } else {
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Coupon code removed');
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const generateInvoicePDF = async (paymentId) => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default || autoTableModule;
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const orderRef = paymentId ? paymentId.substring(0, 16).toUpperCase() : `ORD-${Date.now()}`;
      const customerName = (user?.user_metadata?.full_name || 'Valued Customer').toUpperCase();
      const customerEmail = user?.email || 'N/A';
      const formattedDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

      // Clean Currency Formatting (No broken Unicode font artifacts)
      const formatCurrency = (val) => `INR ${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      // 1. TOP BRAND HEADER BAR
      doc.setFillColor(15, 23, 42); // Deep slate #0f172a
      doc.rect(0, 0, 210, 36, 'F');

      // Top decorative indigo line
      doc.setFillColor(79, 70, 229); // Indigo #4f46e5
      doc.rect(0, 0, 210, 2.5, 'F');

      // Brand Logo / Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("BIZLEAP", 15, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text("Official Marketplace Tax Invoice & Receipt", 15, 27);

      // Top-Right: TAX INVOICE Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("TAX INVOICE", 195, 18, { align: "right" });

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(52, 211, 153); // Emerald 400
      doc.text("[ PAID & CONFIRMED ]", 195, 26, { align: "right" });

      // 2. METADATA CARDS (Billed To & Invoice Details)
      const cardY = 44;
      const cardHeight = 36;
      const cardWidth = 86;

      // Card 1: Billed To (Customer)
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, cardY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(15, cardY, cardWidth, cardHeight, 3, 3, 'S');

      // Header Tag inside Card 1
      doc.setFillColor(241, 245, 249);
      doc.rect(15, cardY, cardWidth, 7.5, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text("BILLED TO (CUSTOMER)", 19, cardY + 5.2);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(customerName.substring(0, 32), 19, cardY + 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(customerEmail, 19, cardY + 20);
      doc.text(`Payment ID: ${paymentId}`, 19, cardY + 25);
      doc.text("License: Single Commercial License (Full Rights)", 19, cardY + 30);

      // Card 2: Merchant & Invoice Summary
      const card2X = 109;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 3, 3, 'S');

      // Header Tag inside Card 2
      doc.setFillColor(241, 245, 249);
      doc.rect(card2X, cardY, cardWidth, 7.5, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text("INVOICE & ISSUER DETAILS", card2X + 4, cardY + 5.2);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text("Bizleap Marketplace Inc.", card2X + 4, cardY + 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Invoice No: INV-${orderRef}`, card2X + 4, cardY + 20);
      doc.text(`Issue Date: ${formattedDate}`, card2X + 4, cardY + 25);
      doc.text("Support: support@bizleap.in | www.bizleap.in", card2X + 4, cardY + 30);

      // 3. ITEMS TABLE VIA autoTable
      const tableHead = [["#", "ITEM & SPECIFICATION", "CATEGORY", "LICENSE TYPE", "PRICE (INR)"]];
      const tableRows = cartItems.map((item, idx) => [
        String(idx + 1),
        `${item.title || 'Digital Template'}\nby ${item.author || 'Bizleap Verified Studio'}`,
        item.category || 'Web Template',
        'Commercial License Included',
        formatCurrency(item.price)
      ]);

      autoTable(doc, {
        startY: 88,
        head: tableHead,
        body: tableRows,
        margin: { left: 15, right: 15 },
        theme: 'plain',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5,
          halign: 'left',
          cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 }
        },
        bodyStyles: {
          fontSize: 8.5,
          textColor: [15, 23, 42],
          cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
          lineColor: [226, 232, 240],
          lineWidth: 0.3
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { cellWidth: 70, fontStyle: 'bold' },
          2: { cellWidth: 32, textColor: [100, 116, 139] },
          3: { cellWidth: 36, textColor: [100, 116, 139], fontSize: 8 },
          4: { halign: 'right', cellWidth: 32, fontStyle: 'bold', textColor: [15, 23, 42] }
        }
      });

      // 4. FINANCIAL SUMMARY BOX
      let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 140;

      // Left Column under table: Guarantee & Security stamp
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, finalY, 90, 36, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(15, finalY, 90, 36, 3, 3, 'S');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("PAYMENT VERIFICATION & GUARANTEE", 19, finalY + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("• Payment successfully captured via Razorpay Secure Gateway.", 19, finalY + 14);
      doc.text("• Includes lifetime source code download access & updates.", 19, finalY + 20);
      doc.text("• Covered by Bizleap 100% Quality & Security Guarantee.", 19, finalY + 26);
      doc.text("• For invoice queries, contact support@bizleap.in", 19, finalY + 31);

      // Right Column under table: Summary Breakdown
      const summaryX = 115;
      const summaryWidth = 80;
      const summaryHeight = appliedCoupon ? 42 : 36;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(summaryX, finalY, summaryWidth, summaryHeight, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(summaryX, finalY, summaryWidth, summaryHeight, 3, 3, 'S');

      // Subtotal
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Subtotal:", summaryX + 5, finalY + 8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(formatCurrency(cartTotal), summaryX + summaryWidth - 5, finalY + 8, { align: "right" });

      let currentSumY = finalY + 15;

      // Discount row (if coupon applied)
      if (appliedCoupon) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(5, 150, 105); // Emerald green
        doc.text(`Promo (${appliedCoupon.code}):`, summaryX + 5, currentSumY);
        doc.text(`- ${formatCurrency(appliedCoupon.discount)}`, summaryX + summaryWidth - 5, currentSumY, { align: "right" });
        currentSumY += 7;
      }

      // Taxes & GST (Inclusive)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Taxes & GST (0%):", summaryX + 5, currentSumY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(5, 150, 105);
      doc.text("FREE (Included)", summaryX + summaryWidth - 5, currentSumY, { align: "right" });
      currentSumY += 6;

      // Total Paid Banner (Deep Slate / Navy)
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(summaryX + 2, currentSumY, summaryWidth - 4, 10, 2, 2, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("TOTAL PAID:", summaryX + 6, currentSumY + 6.5);
      doc.setFontSize(10);
      doc.text(formatCurrency(finalPayableTotal), summaryX + summaryWidth - 6, currentSumY + 6.5, { align: "right" });

      // 5. FOOTER
      const pageHeight = doc.internal.pageSize.height || 297;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(15, pageHeight - 16, 195, pageHeight - 16);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("Bizleap Marketplace Inc. • Official Tax Receipt & Invoice • All rights reserved.", 105, pageHeight - 11, { align: "center" });
      doc.text("This is an electronically verified invoice and serves as legal proof of purchase and license grant.", 105, pageHeight - 7, { align: "center" });

      // Automatically trigger browser download for the customer
      try {
        const invoiceFileName = `Bizleap_Invoice_${orderRef}.pdf`;
        doc.save(invoiceFileName);
      } catch (saveErr) {
        console.warn("Auto-download PDF note:", saveErr?.message);
      }

      return doc.output('datauristring');
    } catch (err) {
      console.error("Failed to generate invoice PDF:", err);
      return null;
    }
  };

  const processSuccessfulPayment = (paymentId, razorpayMeta = {}) => {
    const customerEmail = user?.email || '';
    const customerName = user?.full_name || user?.user_metadata?.full_name || 'Customer';

    // 1. INSTANT Checkout & IMMEDIATE Redirect to My Templates (0ms UI wait!)
    checkout(paymentId, cartItems);
    toast.success('🎉 Purchase complete! Your templates are ready.');
    navigate('/my-templates', { state: { showConfetti: true } });

    // 2. Fire-and-Forget Background Task: DB Record Sync in Neon & Invoice Email Dispatch
    (async () => {
      try {
        // Generate PDF
        let invoicePdfBase64 = null;
        try {
          invoicePdfBase64 = await generateInvoicePDF(paymentId);
        } catch (pdfErr) {
          console.warn("PDF generation note:", pdfErr?.message);
        }

        const token = localStorage.getItem('bizleap_token') || '';
        const verifyPayload = {
          paymentId: paymentId,
          orderId: razorpayMeta?.razorpay_order_id || `order_${paymentId}`,
          signature: razorpayMeta?.razorpay_signature || '',
          cartItems: cartItems.map(it => ({ id: it.id, title: it.title, price: it.price, category: it.category })),
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          couponId: appliedCoupon ? appliedCoupon.id : null,
          invoicePdfBase64: invoicePdfBase64
        };

        const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '');
        const targetUrls = [];
        if (backendUrl) targetUrls.push(`${backendUrl}/api/verify-payment`);
        targetUrls.push('/api/verify-payment');

        let verified = false;
        for (const url of targetUrls) {
          try {
            const res = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify(verifyPayload),
              keepalive: true
            });
            if (res.ok) {
              verified = true;
              window.dispatchEvent(new Event('purchases_updated'));
              window.dispatchEvent(new Event('templates_updated'));
              break;
            }
          } catch (e) {
            console.warn('verify-payment attempt note:', e?.message);
          }
        }

        // Failsafe backup email dispatch if verify-payment didn't finish
        if (!verified) {
          const emailPayload = {
            to: customerEmail,
            email: customerEmail,
            customerName: customerName,
            paymentId: paymentId,
            totalAmount: finalPayableTotal,
            frontendUrl: window.location.origin,
            orderDetails: {
              orderId: paymentId,
              total: finalPayableTotal.toFixed(2),
              subtotal: cartTotal.toFixed(2),
              discount: appliedCoupon ? appliedCoupon.discount : 0,
              couponCode: appliedCoupon ? appliedCoupon.code : null,
              items: cartItems.map(item => ({
                id: item.id,
                title: item.title,
                price: item.price,
                author: item.author || 'Bizleap Partner',
                category: item.category || 'Web',
                downloadUrl: `${window.location.origin}/my-templates?download=${item.id}&payment_id=${paymentId}`
              }))
            },
            cartItems: cartItems.map(item => ({
              id: item.id,
              title: item.title,
              price: item.price,
              author: item.author || 'Bizleap Partner',
              category: item.category || 'Web',
              downloadUrl: `${window.location.origin}/my-templates?download=${item.id}&payment_id=${paymentId}`
            })),
            invoicePdfBase64: invoicePdfBase64
          };

          const emailTargetUrls = [];
          if (backendUrl) emailTargetUrls.push(`${backendUrl}/api/send-receipt`);
          emailTargetUrls.push('/api/send-receipt');

          for (const url of emailTargetUrls) {
            try {
              const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailPayload),
                keepalive: true
              });
              if (res.ok) break;
            } catch {}
          }
        }
      } catch (bgErr) {
        console.warn("Background order/email dispatch note:", bgErr);
      }
    })();
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.info('Please sign in or create an account to proceed with purchase.');
      requireAuth(() => handleCheckout());
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      toast.error('Razorpay SDK failed to load. Please check your connection.');
      return;
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY || import.meta.env.VITE_RAZORPAY_TEST_KEY || 'rzp_test_1DP5mmOlF5G5ag';

    if (razorpayKey === 'rzp_test_1DP5mmOlF5G5ag') {
      toast.loading('Simulating payment (dummy key detected)...', { id: 'mock-payment' });
      setTimeout(() => {
        toast.dismiss('mock-payment');
        processSuccessfulPayment('pay_mock_' + Math.random().toString(36).substr(2, 9));
      }, 2000);
      return;
    }

    const options = {
      key: razorpayKey,
      amount: Math.round(convertPrice(finalPayableTotal) * 100),
      currency: currency,
      name: 'Bizleap Marketplace',
      description: appliedCoupon ? `Discount applied: ${appliedCoupon.code}` : 'Premium Templates & UI Kits',
      image: 'https://cdn-icons-png.flaticon.com/512/3176/3176366.png',
      handler: function (response) {
        processSuccessfulPayment(response.razorpay_payment_id, response);
      },
      prefill: {
        name: activeUser?.user_metadata?.full_name || '',
        email: activeUser?.email || '',
      },
      theme: {
        color: isDark ? '#000000' : '#111827',
      },
    };

    try {
      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        toast.error('Payment failed: ' + response.error.description);
      });
      paymentObject.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      toast.error("Failed to open payment gateway. Please try again.");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>

    <div className={`min-h-screen font-sans pb-24 transition-colors duration-1000 ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-black'}`}>
      {/* Mini Nav */}
      <nav className="h-[80px] w-full px-6 md:px-16 flex items-center justify-between border-b sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-gray-200/80 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="w-px h-6 bg-gray-200 dark:bg-white/10 hidden md:block"></div>
          <Link to="/" className="hidden md:flex items-center gap-2 text-gray-500 hover:text-black dark:hover:text-white font-bold transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <UserMenu />
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 md:px-12 mt-8 md:mt-12">
        
        {/* Header with Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200/80 dark:border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Instant Delivery Marketplace
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              Your Cart
              <span className="text-sm font-bold px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-gray-600 dark:text-gray-300">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-500/20 shrink-0">
            <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Encrypted Checkout
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white/70 dark:bg-[#111111]/80 backdrop-blur-xl p-12 md:p-24 rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-sm text-center relative overflow-hidden">
             <div className="relative z-10 flex flex-col items-center">
               <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-10 h-10 text-black dark:text-white" />
               </div>
               
               <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-3">Your cart is feeling light</h2>
               <p className="text-base text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto font-medium">
                 Discover industry-leading templates, landing pages, and UI kits curated for modern businesses.
               </p>
               
               <Link to="/" className="inline-flex items-center justify-center px-8 py-4 bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-sm">
                  Explore Marketplace
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
               </Link>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Cart Items + Value Guarantees (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
               {cartItems.map(item => (
                  <div 
                    key={item.id} 
                    className="group relative rounded-3xl bg-white dark:bg-[#111111] border border-gray-200/80 dark:border-white/10 p-5 sm:p-6 shadow-sm hover:border-black/30 dark:hover:border-white/30 transition-all duration-300 overflow-hidden"
                  >
                     <div className="flex flex-col sm:flex-row gap-5 items-start">
                        {/* Thumbnail */}
                        <div className="relative w-full sm:w-48 aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 dark:bg-black/60 border border-gray-200 dark:border-white/10 shrink-0">
                           <img 
                             src={item.image} 
                             alt={item.title} 
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                           />
                           <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white border border-white/10">
                              {item.category || 'React'}
                           </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between w-full">
                           <div className="pr-8">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                                 <span>by {item.author || 'Verified Author'}</span>
                                 <BadgeCheck className="w-3.5 h-3.5 text-black dark:text-white" />
                              </div>
                              <h3 className="text-lg font-black tracking-tight text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">
                                 {item.title}
                              </h3>
                           </div>

                           {/* Benefit Chips */}
                           <div className="flex flex-wrap items-center gap-1.5 mt-3">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                 <Download className="w-3 h-3 text-black dark:text-white" /> Full ZIP Code
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                 <Zap className="w-3 h-3 text-black dark:text-white" /> Commercial Rights
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                 <RefreshCw className="w-3 h-3 text-emerald-500" /> Lifetime Updates
                              </span>
                           </div>

                           {/* Price Row */}
                           <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-400">Unit Price</span>
                              <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                 {formatPrice(item.price)}
                              </span>
                           </div>
                        </div>

                        {/* Remove Action */}
                        <button 
                           onClick={() => removeFromCart(item.id)}
                           className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                           title="Remove item"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               ))}

               {/* Value Proposition Cards */}
               <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 text-black dark:text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Download className="w-4 h-4" />
                     </div>
                     <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">Instant ZIP Download</div>
                        <div className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Direct download right after payment confirmation.</div>
                     </div>
                  </div>

                  <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                     </div>
                     <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">Clean & Verified Code</div>
                        <div className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Production-ready syntax with zero setup friction.</div>
                     </div>
                  </div>

                  <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 text-black dark:text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Zap className="w-4 h-4" />
                     </div>
                     <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">Commercial License</div>
                        <div className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Build client sites & SaaS with full ownership.</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right: Order Summary Card (5 cols) */}
            <div className="lg:col-span-5">
                <div className="bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-sm sticky top-[100px]">
                  <div className="flex items-center justify-between pb-5 mb-5 border-b border-gray-100 dark:border-white/10">
                    <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Order Summary</h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      <Lock className="w-3 h-3" /> Safe Checkout
                    </span>
                  </div>
                  
                  {/* Promo Code Input Box */}
                  <div className="mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-black dark:text-white" /> Have a Promo Code?
                      </span>
                    </label>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 animate-fade-in">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div>
                            <div className="font-mono font-black text-xs text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                              {appliedCoupon.code}
                            </div>
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              You save ₹{appliedCoupon.discount} ({appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}% OFF` : 'Flat Discount'})
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="p-1.5 rounded-lg hover:bg-emerald-200/50 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer"
                          title="Remove Coupon"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <form onSubmit={handleApplyCoupon} className="relative flex items-center">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="Enter promo code (e.g. LAUNCH50)"
                            className="w-full pl-3.5 pr-20 py-2.5 bg-white dark:bg-black/60 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold tracking-wide placeholder:normal-case placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white uppercase"
                          />
                          <button
                            type="submit"
                            disabled={couponLoading || !couponInput.trim()}
                            className="absolute right-1.5 px-3.5 py-1.5 bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            {couponLoading ? 'Verifying...' : 'Apply'}
                          </button>
                        </form>

                        {/* Quick One-Click Offer Suggestion */}
                        <div 
                          onClick={(e) => handleApplyCoupon(e, 'LAUNCH50')}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 cursor-pointer transition-colors text-[11px]"
                        >
                          <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                            <span>Apply code <strong className="font-mono bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">LAUNCH50</strong> for 50% OFF</span>
                          </div>
                          <span className="font-black text-black dark:text-white text-[10px] uppercase">Apply</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 font-medium">
                       <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                       <span className="font-bold text-gray-900 dark:text-gray-100">{formatPrice(cartTotal)}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold animate-fade-in">
                         <span className="flex items-center gap-1.5">
                           <Sparkles className="w-3.5 h-3.5" /> Coupon Discount ({appliedCoupon.code})
                         </span>
                         <span>-₹{appliedCoupon.discount}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 font-medium">
                       <span>Taxes & Gateway Fee</span>
                       <span className="text-emerald-600 font-bold text-xs bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                         FREE (Included)
                       </span>
                    </div>
                  </div>
                  
                  {/* Total Due Section */}
                  <div className="flex justify-between items-baseline border-t border-gray-100 dark:border-white/10 pt-5 mb-6">
                     <div>
                       <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Total Payable</span>
                       {appliedCoupon && (
                         <span className="text-xs text-gray-400 line-through font-semibold mr-2">{formatPrice(cartTotal)}</span>
                       )}
                     </div>
                     <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                       {formatPrice(finalPayableTotal)}
                     </span>
                  </div>

                  {/* Primary Checkout Button */}
                  <button 
                    onClick={handleCheckout}
                    className="w-full py-4 bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white rounded-2xl font-black text-base hover:scale-[1.01] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 mb-4 cursor-pointer"
                  >
                     <Lock className="w-4 h-4" /> Pay {formatPrice(finalPayableTotal)} & Download
                  </button>

                  {/* Payment Methods Trust Badge */}
                  <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-3 text-center">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Supported Payment Methods
                    </div>
                    <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-gray-500 dark:text-gray-400 font-bold">
                      <span className="px-2 py-1 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">UPI</span>
                      <span className="px-2 py-1 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">GPay</span>
                      <span className="px-2 py-1 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">PhonePe</span>
                      <span className="px-2 py-1 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">Paytm</span>
                      <span className="px-2 py-1 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">Cards</span>
                      <span className="px-2 py-1 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">NetBanking</span>
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Satisfaction Guaranteed &bull; Instant Code Access
                    </div>
                  </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
