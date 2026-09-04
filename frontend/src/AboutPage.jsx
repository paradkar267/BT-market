import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Code2, Gauge, ShieldCheck, Download, ArrowRight, 
  Target, Rocket, CheckCircle2, Zap, HeartHandshake, Layers
} from 'lucide-react';
import Navbar from './components/Navbar';
import { Footerdemo } from '@/components/ui/footer-section';
import SEO from './components/SEO';

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <SEO 
        title="About Bizleap - Mission, Architecture & Vision" 
        description="Learn about Bizleap's mission to empower developers and founders to ship production-ready websites in days, not months."
        url="/about"
      />

      {/* Global Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-28 px-5 md:px-10 max-w-[1400px] mx-auto text-center overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-xs mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            About Bizleap
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.1] mb-6">
            We empower builders to ship <br className="hidden sm:inline" />
            <span className="text-amber-500">world-class web apps</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Bizleap is a premium marketplace for handcrafted React 19, Next.js 15, and Tailwind CSS templates. 
            We build modular, lightning-fast architecture so developers and founders can skip months of boilerplate.
          </p>
        </div>
      </section>

      {/* Core Mission & Vision Cards */}
      <section className="w-full py-12 px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mission Card */}
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mb-5 shadow-xs">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-3">Our Mission</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                To eliminate tedious frontend setup by providing production-grade, unminified source code that can be deployed to production in minutes.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-200/70 dark:border-slate-800 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span>Velocity First Architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Vision Card */}
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center mb-5 shadow-xs">
                <Rocket className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-3">Our Vision</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                To build the world's most trusted, performance-obsessed digital asset ecosystem where agencies, indie hackers, and enterprises turn for exceptional design.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-200/70 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>Standards of Tomorrow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* What Bizleap Does */}
      <section className="w-full py-16 px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1 block">What We Do</span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
            Engineering at the Highest Standard
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Code2,
              title: "React & Next.js Stacks",
              desc: "100% modular, TypeScript-ready components with clean folder structures."
            },
            {
              icon: Gauge,
              title: "99+ Lighthouse Scores",
              desc: "Zero bloated libraries, sub-second paints, and SEO optimization."
            },
            {
              icon: ShieldCheck,
              title: "Unlimited Commercial Use",
              desc: "Deploy on unlimited client domains with zero recurring royalty fees."
            },
            {
              icon: Download,
              title: "Instant ZIP Delivery",
              desc: "Automatic archive download plus email copy right after checkout."
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white mb-4">
                    <Icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="w-full py-16 px-5 md:px-10 max-w-[1200px] mx-auto mb-16">
        <div className="p-8 sm:p-12 rounded-2xl bg-slate-950 text-white border border-slate-800 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black mb-3">Ready to start building?</h2>
            <p className="text-sm sm:text-base text-slate-400 mb-6">
              Browse our complete catalog of templates and launch your next big idea today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/templates"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <span>Browse All Templates</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl transition-all border border-white/15"
              >
                Contact Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footerdemo />
    </div>
  );
}
