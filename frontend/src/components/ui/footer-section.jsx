"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Send } from "lucide-react"
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa"
import { Link } from "react-router-dom"

function Footerdemo() {

  return (
    <footer className="relative border-t border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-[#050505] text-foreground transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">Stay Connected</h2>
            <p className="mb-6 text-muted-foreground">
              Join our newsletter for the latest updates and exclusive offers.
            </p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="pr-12 backdrop-blur-sm bg-white dark:bg-white/5 border-black/10 dark:border-white/10 focus-visible:ring-violet-500"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all hover:scale-105"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />
          </div>
          <div>
            <h3 className="mb-6 text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">Quick Links</h3>
            <nav className="space-y-3 text-sm font-medium">
              <Link to="/" className="block text-gray-500 dark:text-gray-400 transition-all hover:text-violet-600 dark:hover:text-violet-400 hover:translate-x-1">
                Home
              </Link>
              <Link to="/templates" className="block text-gray-500 dark:text-gray-400 transition-all hover:text-violet-600 dark:hover:text-violet-400 hover:translate-x-1">
                Templates
              </Link>
              <Link to="/featured" className="block text-gray-500 dark:text-gray-400 transition-all hover:text-violet-600 dark:hover:text-violet-400 hover:translate-x-1">
                Featured
              </Link>
              <Link to="/ui-kits" className="block text-gray-500 dark:text-gray-400 transition-all hover:text-violet-600 dark:hover:text-violet-400 hover:translate-x-1">
                UI Kits
              </Link>
              <Link to="/contact" className="block text-gray-500 dark:text-gray-400 transition-all hover:text-violet-600 dark:hover:text-violet-400 hover:translate-x-1">
                Contact
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="mb-6 text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">Contact Us</h3>
            <address className="space-y-3 text-sm not-italic text-gray-500 dark:text-gray-400 font-medium">
              <a href="mailto:bizleap1@gmail.com" className="block hover:text-violet-600 dark:hover:text-violet-400 transition-colors">✉ bizleap1@gmail.com</a>
              <Link to="/contact" className="block hover:text-violet-600 dark:hover:text-violet-400 transition-colors">💬 Send us a message</Link>
              <Link to="/terms" className="block hover:text-violet-600 dark:hover:text-violet-400 transition-colors">📄 Terms & Conditions</Link>
            </address>
          </div>
          <div className="relative">
            <h3 className="mb-6 text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">Follow Us</h3>
            <div className="mb-6 flex space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-white dark:bg-white/5 border-black/10 dark:border-white/10 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 transition-all hover:scale-110 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                      <FaFacebook className="h-4 w-4" />
                      <span className="sr-only">Facebook</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Facebook</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-white dark:bg-white/5 border-black/10 dark:border-white/10 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 transition-all hover:scale-110 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                      <FaTwitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Twitter</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-white dark:bg-white/5 border-black/10 dark:border-white/10 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 transition-all hover:scale-110 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                      <FaInstagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Instagram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-white dark:bg-white/5 border-black/10 dark:border-white/10 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 transition-all hover:scale-110 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                      <FaLinkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Connect with us on LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-black/5 dark:border-white/5 pt-8 text-center md:flex-row relative z-10">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            © {new Date().getFullYear()} Bizleap. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm">
            <Link to="/privacy" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-primary">
              Terms of Service
            </Link>
            <Link to="/cookies" className="transition-colors hover:text-primary">
              Cookie Settings
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }
