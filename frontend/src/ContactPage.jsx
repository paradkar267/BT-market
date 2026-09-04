import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, MapPin, Clock, ArrowLeft, Send, Loader2, Sparkles, MessageSquare, ShoppingCart, CheckCircle2 } from 'lucide-react';
import UserMenu from './UserMenu';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import SEO from './components/SEO';


export default function ContactPage() {
  const { cartItems } = useCart();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://bt-templates-twwr.onrender.com';
      const response = await fetch(`${backendUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast.success("Message sent successfully! We'll get back to you within 24 hours.");
      e.target.reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-900">
      <SEO 
        title="Contact Us | BizLeap Marketplace" 
        description="Have a question about our templates or need custom work? Contact the BizLeap team."
        url="/contact"
      />

      {/* Global Unified Navigation */}
      <Navbar />


      {/* Main Content */}
      <main className="max-w-[1200px] w-full mx-auto px-5 md:px-10 pt-8 pb-20">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-black bg-gray-100 border border-gray-200 px-3 py-1 rounded-full mb-3">
            <MessageSquare className="w-3 h-3" /> Get in Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
            We're here to help you ship faster.
          </h1>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            Have questions about templates, custom development, licenses, or refunds? Send us a message and our team will get back to you within 24 hours.
          </p>
        </div>

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Contact Details & Trust */}
          <div className="lg:col-span-5 space-y-5">
            {/* Email card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-gray-300 transition-all">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-black flex items-center justify-center shrink-0 border border-gray-200">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email Support</h3>
                  <a href="mailto:bizleap1@gmail.com" className="text-sm font-semibold text-black hover:text-gray-600 hover:underline">
                    bizleap1@gmail.com
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Direct replies within 24 hours.</p>
                </div>
              </div>
            </div>

            {/* Response Time Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-gray-300 transition-all">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Operating Hours</h3>
                  <p className="text-sm font-semibold text-gray-900">Monday – Friday</p>
                  <p className="text-xs text-gray-500 mt-0.5">9:00 AM to 6:00 PM EST (Support online)</p>
                </div>
              </div>
            </div>

            {/* Office Location */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-gray-300 transition-all">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-black flex items-center justify-center shrink-0 border border-gray-200">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Headquarters</h3>
                  <p className="text-sm font-semibold text-gray-900">BizLeap Digital Marketplace</p>
                  <p className="text-xs text-gray-500 mt-0.5">Serving creators & agencies worldwide.</p>
                </div>
              </div>
            </div>

            {/* Fast Response Guarantee Strip */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-black shrink-0" />
              <p className="text-xs text-gray-900 font-medium">
                100% human support from developers who know the templates inside out.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Send className="w-4 h-4 text-black" /> Send us a Message
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Fill out the details below and we'll respond promptly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">First Name</label>
                  <input
                    name="firstName"
                    required
                    type="text"
                    placeholder="John"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Last Name</label>
                  <input
                    name="lastName"
                    required
                    type="text"
                    placeholder="Doe"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  name="email"
                  required
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Inquiry Type</label>
                <select
                  name="subject"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all cursor-pointer"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Template Support">Template Technical Support</option>
                  <option value="Custom Template">Custom Website / Template Request</option>
                  <option value="Billing & Refund">Billing & Refund Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Tell us about your project or what you need help with..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-5 bg-black hover:bg-zinc-800 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
