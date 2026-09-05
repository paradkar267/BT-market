"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Send, 
  Mail, 
  MessageCircle, 
  FileText, 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  ArrowUp,
  Zap,
  ShieldCheck,
  Code2,
  CreditCard,
  ExternalLink,
  Layers,
  Star,
  Check
} from "lucide-react"
import { FaInstagram, FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa"
import { Link } from "react-router-dom"
import { Logo } from "@/components/ui/Logo"
import { toast } from "sonner"

function Footerdemo() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid work email.")
      return
    }
    setIsSubscribed(true)
    toast.success("Welcome to the BizLeap VIP Club!", {
      description: "You'll receive exclusive template drops and discount codes."
    })
    setEmail("")
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  return (
    <footer className="relative border-t border-black/[0.08] dark:border-white/10 bg-gradient-to-b from-white via-gray-50/50 to-gray-100/70 dark:from-[#090b0e] dark:via-[#07080a] dark:to-[#040507] text-foreground transition-colors duration-300 overflow-hidden">
      {/* Background Ambient Glow Highlights */}
      <div className="absolute -top-32 left-1/3 w-[500px] h-[300px] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.07] blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-10 w-[420px] h-[260px] bg-amber-500/[0.03] dark:bg-amber-500/[0.05] blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 pt-14 pb-10 relative z-10">
        
        {/* ══════════════════════════════════════════════
            1. PRE-FOOTER VALUE & TRUST HIGHLIGHTS STRIP
        ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-14 border-b border-black/[0.07] dark:border-white/10">
          
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md shadow-sm hover:shadow-md hover:border-black/15 dark:hover:border-white/20 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  Instant Code Access
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Direct .zip download and lifetime updates right inside your account.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md shadow-sm hover:shadow-md hover:border-black/15 dark:hover:border-white/20 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  Commercial License
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Use on unlimited client projects and SaaS startups with zero royalties.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md shadow-sm hover:shadow-md hover:border-black/15 dark:hover:border-white/20 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  100% Quality Inspected
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Clean React 19, Next.js & Tailwind CSS. Zero bloat, 100/100 performance.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md shadow-sm hover:shadow-md hover:border-black/15 dark:hover:border-white/20 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  256-Bit SSL Checkout
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Bank-grade security powered by Razorpay, UPI, NetBanking & Cards.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════════════
            2. MAIN 5-COLUMN FOOTER NAVIGATION GRID
        ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 py-14">
          
          {/* Column 1: Brand Info, Live Status & Socials (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Logo imgClassName="h-10 md:h-11" />
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm font-normal">
              The premier marketplace for production-grade React, Next.js, and Dashboard website templates. Engineered to help developers, agencies, and founders ship 10x faster.
            </p>

            {/* Live Operational Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational • Instant Delivery Active</span>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-3">
                Connect With Us
              </span>
              <div className="flex items-center gap-2.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => window.open('https://www.instagram.com/bizleap.in/?utm_source=ig_web_button_share_sheet', '_blank')}
                        className="w-10 h-10 rounded-xl bg-white dark:bg-white/[0.03] border border-black/10 dark:border-white/10 hover:border-pink-500 hover:bg-pink-500 hover:text-white dark:hover:border-pink-500 dark:hover:bg-pink-500 dark:hover:text-white text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all hover:scale-110 shadow-sm cursor-pointer group"
                      >
                        <FaInstagram className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span className="sr-only">Instagram</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Follow @bizleap.in on Instagram</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => window.open('https://www.linkedin.com/company/bizleapinc/posts/?feedView=all', '_blank')}
                        className="w-10 h-10 rounded-xl bg-white dark:bg-white/[0.03] border border-black/10 dark:border-white/10 hover:border-blue-600 hover:bg-blue-600 hover:text-white dark:hover:border-blue-500 dark:hover:bg-blue-500 dark:hover:text-white text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all hover:scale-110 shadow-sm cursor-pointer group"
                      >
                        <FaLinkedin className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span className="sr-only">LinkedIn</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Connect with BizLeap on LinkedIn</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="mailto:bizleap1@gmail.com"
                        className="w-10 h-10 rounded-xl bg-white dark:bg-white/[0.03] border border-black/10 dark:border-white/10 hover:border-indigo-600 hover:bg-indigo-600 hover:text-white dark:hover:border-indigo-500 dark:hover:bg-indigo-500 dark:hover:text-white text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all hover:scale-110 shadow-sm cursor-pointer group"
                      >
                        <Mail className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span className="sr-only">Email</span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Email: bizleap1@gmail.com</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Verified Rating Strip */}
            <div className="pt-1 flex items-center gap-2 text-xs">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-gray-700 dark:text-gray-300">4.9 / 5.0</span>
              <span className="text-gray-400 dark:text-gray-500">from 1,200+ verified buyers</span>
            </div>
          </div>

          {/* Column 2: Marketplace Catalog (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Marketplace
            </h3>
            <nav className="flex flex-col space-y-2.5 text-sm font-medium">
              <Link to="/templates" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">All Templates</span>
              </Link>
              <Link to="/featured" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 group">
                <span className="group-hover:translate-x-1 transition-transform">Featured Drops</span>
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Hot
                </span>
              </Link>
              <Link to="/ui-kits" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">UI Kits & Systems</span>
              </Link>
              <Link to="/templates?category=React" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">React 19 Templates</span>
              </Link>
              <Link to="/templates?category=Next.js" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">Next.js 15 Stacks</span>
              </Link>
              <Link to="/templates?category=Dashboard" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">Admin Dashboards</span>
              </Link>
            </nav>
          </div>

          {/* Column 3: Tech & Platform (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Tech & Features
            </h3>
            <nav className="flex flex-col space-y-2.5 text-sm font-medium">
              <Link to="/templates?category=React" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">React 19 & Vite</span>
              </Link>
              <Link to="/templates?category=Next.js" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">Next.js App Router</span>
              </Link>
              <Link to="/templates" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">Tailwind CSS v4</span>
              </Link>
              <Link to="/templates" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">Framer Motion & GSAP</span>
              </Link>
              <Link to="/templates" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">Live Previews</span>
              </Link>
              <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">Licensing Rights</span>
              </Link>
            </nav>
          </div>

          {/* Column 4: Company & Support (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              Company & Help
            </h3>
            <nav className="flex flex-col space-y-2.5 text-sm font-medium">
              <Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 group">
                <MessageCircle className="w-3.5 h-3.5 text-gray-500 group-hover:text-black dark:group-hover:text-white shrink-0 transition-colors" />
                <span className="group-hover:translate-x-1 transition-transform">Contact Support</span>
              </Link>
              <a href="mailto:bizleap1@gmail.com" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 group">
                <Mail className="w-3.5 h-3.5 text-gray-500 group-hover:text-black dark:group-hover:text-white shrink-0 transition-colors" />
                <span className="group-hover:translate-x-1 transition-transform truncate">bizleap1@gmail.com</span>
              </a>
              <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 group">
                <FileText className="w-3.5 h-3.5 text-gray-500 group-hover:text-black dark:group-hover:text-white shrink-0 transition-colors" />
                <span className="group-hover:translate-x-1 transition-transform">Terms of Service</span>
              </Link>
              <Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 group">
                <Shield className="w-3.5 h-3.5 text-gray-500 group-hover:text-black dark:group-hover:text-white shrink-0 transition-colors" />
                <span className="group-hover:translate-x-1 transition-transform">Privacy Policy</span>
              </Link>
              <Link to="/cookies" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 group">
                <Layers className="w-3.5 h-3.5 text-gray-500 group-hover:text-black dark:group-hover:text-white shrink-0 transition-colors" />
                <span className="group-hover:translate-x-1 transition-transform">Cookie Policy</span>
              </Link>
            </nav>
          </div>

          {/* Column 5: VIP Newsletter Card (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 shadow-sm backdrop-blur-md">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 mb-2.5">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>VIP DROP ALERTS</span>
              </div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight">
                Get 15% off first drop
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Join 3,500+ developers getting weekly releases and secret discount codes.
              </p>

              <form onSubmit={handleSubscribe} className="mt-3.5 space-y-2">
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter work email..."
                    className="pr-10 h-10 rounded-xl backdrop-blur-sm bg-white dark:bg-black/40 border-black/15 dark:border-white/15 text-xs focus-visible:ring-indigo-500 shadow-inner"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all hover:scale-105 cursor-pointer"
                  >
                    {isSubscribed ? <Check className="h-3.5 w-3.5 text-white" /> : <Send className="h-3.5 w-3.5" />}
                    <span className="sr-only">Subscribe</span>
                  </Button>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-gray-400 shrink-0" /> Zero spam. 1-click unsubscribe.
                </p>
              </form>
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════════════
            3. SUB-FOOTER BOTTOM BAR & TRUST BADGES
        ══════════════════════════════════════════════ */}
        <div className="pt-8 mt-2 border-t border-black/[0.07] dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-gray-500 dark:text-gray-400">
          
          <div className="flex items-center gap-2 text-center md:text-left">
            <p className="font-medium">
              © {new Date().getFullYear()} <span className="font-black text-gray-900 dark:text-white">BizLeap</span>. All rights reserved. Crafted for high-growth builders.
            </p>
          </div>

          {/* Secure Payment Badges Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/10 text-[11px] font-medium text-gray-600 dark:text-gray-400">
            <CreditCard className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Razorpay Secured</span>
            <span>•</span>
            <span>UPI</span>
            <span>•</span>
            <span>Cards</span>
            <span>•</span>
            <span>NetBanking</span>
          </div>

          {/* Legal Links & Back to Top Button */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link to="/privacy" className="hover:text-black dark:hover:text-white transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-black dark:hover:text-white transition-colors">
              Terms
            </Link>
            <span>•</span>
            <Link to="/cookies" className="hover:text-black dark:hover:text-white transition-colors">
              Cookies
            </Link>

            <button
              type="button"
              onClick={scrollToTop}
              className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 text-gray-700 dark:text-gray-300 font-bold hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Scroll back to top"
            >
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </footer>
  )
}

export { Footerdemo }
