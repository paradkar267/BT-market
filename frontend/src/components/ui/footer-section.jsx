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
import { Send, Mail, MessageCircle, FileText, Shield, Sparkles, CheckCircle2, Lock, ArrowRight } from "lucide-react"
import { FaInstagram, FaLinkedin } from "react-icons/fa"
import { Link } from "react-router-dom"
import { Logo } from "@/components/ui/Logo"
import { toast } from "sonner"

function Footerdemo() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.")
      return
    }
    setIsSubscribed(true)
    toast.success("Welcome to BizLeap!", {
      description: "You're now subscribed to weekly template drops & exclusive discounts."
    })
    setEmail("")
  }

  return (
    <footer className="relative border-t border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#050608] text-foreground transition-colors duration-300 overflow-hidden">
      {/* Subtle Background Monochrome Ambience */}
      <div className="absolute -top-24 left-1/4 w-96 h-48 bg-black/[0.02] dark:bg-white/[0.02] blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-80 h-40 bg-black/[0.01] dark:bg-white/[0.01] blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Column 1: Brand Info & Socials (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Logo imgClassName="h-10 md:h-11" />
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm font-normal">
              The modern marketplace for production-grade React, Next.js, and Dashboard templates. Engineered to help developers and agencies ship 10x faster.
            </p>

            {/* Follow Us Socials */}
            <div className="pt-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block mb-3">
                Connect With Us
              </span>
              <div className="flex items-center gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => window.open('https://www.instagram.com/bizleap.in/?utm_source=ig_web_button_share_sheet', '_blank')}
                        className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black hover:bg-black hover:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all hover:scale-110 shadow-sm cursor-pointer group"
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
                        className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black hover:bg-black hover:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black text-gray-600 dark:text-gray-300 flex items-center justify-center transition-all hover:scale-110 shadow-sm cursor-pointer group"
                      >
                        <FaLinkedin className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span className="sr-only">LinkedIn</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Connect with BIZLEAP on LinkedIn</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Column 2: Marketplace Links (2.5 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 dark:text-white font-display">
              Marketplace
            </h3>
            <nav className="flex flex-col space-y-2.5 text-sm font-medium">
              <Link to="/templates" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">All Templates</span>
              </Link>
              <Link to="/featured" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">Featured Drops</span>
              </Link>
              <Link to="/ui-kits" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">UI Kits</span>
              </Link>
              <Link to="/templates?category=React" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">React Templates</span>
              </Link>
              <Link to="/templates?category=Next.js" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 group">
                <span className="group-hover:translate-x-1 transition-transform">Next.js Stacks</span>
              </Link>
            </nav>
          </div>

          {/* Column 3: Support & Legal (2.5 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 dark:text-white font-display">
              Support & Company
            </h3>
            <nav className="flex flex-col space-y-2.5 text-sm font-medium">
              <Link to="/contact" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 group">
                <MessageCircle className="w-4 h-4 text-gray-700 dark:text-gray-300 shrink-0" />
                <span className="group-hover:translate-x-1 transition-transform">Contact & Support</span>
              </Link>
              <a href="mailto:bizleap1@gmail.com" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 group">
                <Mail className="w-4 h-4 text-gray-700 dark:text-gray-300 shrink-0" />
                <span className="group-hover:translate-x-1 transition-transform">bizleap1@gmail.com</span>
              </a>
              <Link to="/terms" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 group">
                <FileText className="w-4 h-4 text-gray-700 dark:text-gray-300 shrink-0" />
                <span className="group-hover:translate-x-1 transition-transform">Terms of Service</span>
              </Link>
              <Link to="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 group">
                <Shield className="w-4 h-4 text-gray-700 dark:text-gray-300 shrink-0" />
                <span className="group-hover:translate-x-1 transition-transform">Privacy Policy</span>
              </Link>
            </nav>
          </div>

          {/* Column 4: Newsletter Box (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-zinc-700">
              <Sparkles className="w-3 h-3 text-gray-700 dark:text-gray-300" />
              <span>Newsletter</span>
            </div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
              Stay in the loop
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Subscribe to get notified about new template releases, flash sales, and frontend tips.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email..."
                  className="pr-11 h-11 rounded-xl backdrop-blur-sm bg-white dark:bg-white/5 border-black/10 dark:border-white/10 text-xs focus-visible:ring-black dark:focus-visible:ring-white shadow-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1.5 top-1.5 h-8 w-8 rounded-lg bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black shadow-md transition-all hover:scale-105 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="sr-only">Subscribe</span>
                </Button>
              </div>
              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-gray-600 dark:text-gray-400 shrink-0" /> Zero spam. Unsubscribe anytime.
              </p>
            </form>
          </div>

        </div>

        {/* Sub-Footer Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-black/[0.06] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <p className="font-medium text-center sm:text-left">
            © {new Date().getFullYear()} <span className="font-bold text-gray-800 dark:text-gray-200">BizLeap</span>. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold">
            <Link to="/privacy" className="hover:text-black dark:hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-black dark:hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/cookies" className="hover:text-black dark:hover:text-white transition-colors">
              Cookie Preferences
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }
