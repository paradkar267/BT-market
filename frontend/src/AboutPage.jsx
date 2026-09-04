import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Code2, Gauge, ShieldCheck, Download, ArrowRight, 
  Target, Rocket, CheckCircle2, Zap, HeartHandshake, Layers,
  Users, Award, Calendar, Globe2, Briefcase, ChevronRight
} from 'lucide-react';
import Navbar from './components/Navbar';
import { Footerdemo } from '@/components/ui/footer-section';
import SEO from './components/SEO';

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { value: "200+", label: "Projects Delivered", desc: "Across India, UAE, UK & USA" },
    { value: "30+", label: "Creative Experts", desc: "Designers, developers & strategists" },
    { value: "6Y+", label: "Industry Experience", desc: "Empowering brands since 2020" },
    { value: "99%", label: "Client Satisfaction", desc: "Backed by results & performance" }
  ];

  const corePillars = [
    {
      title: "Creative Excellence",
      desc: "Our designs aren't just visually stunning; they're engineered to solve real problems, captivate audiences, and elevate brand authority.",
      icon: Sparkles
    },
    {
      title: "Data-Driven Strategy",
      desc: "We back creative instinct with hard analytics and conversion insights, ensuring every digital product drives measurable business growth.",
      icon: Target
    },
    {
      title: "Honest & Transparent",
      desc: "Zero confusing jargon or hidden fees. We believe in clear communication, realistic timelines, and high-impact deliverables.",
      icon: HeartHandshake
    },
    {
      title: "Speed & Scale",
      desc: "Production-ready architectures, sub-second load times, and modular codebases built to scale effortlessly from Day 1.",
      icon: Zap
    }
  ];

  const services = [
    {
      title: "UI/UX & Web Development",
      desc: "End-to-end modern interfaces built with React 19, Next.js 15, and Tailwind CSS. Clean, responsive, and performance-tuned.",
      icon: Code2
    },
    {
      title: "Brand Identity Design",
      desc: "Distinct visual identities, logos, comprehensive design systems, and digital assets that leave a lasting mark.",
      icon: Layers
    },
    {
      title: "SEO & High Performance",
      desc: "Audits, technical SEO, and 99+ Lighthouse performance optimizations to dominate search results and user engagement.",
      icon: Gauge
    },
    {
      title: "AI-Powered Workflows",
      desc: "Integrating cutting-edge AI technologies and automated workflows to accelerate business operations and digital products.",
      icon: Rocket
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <SEO 
        title="About Bizleap | Where Brands Leap Forward" 
        description="Driven by Design. Backed by Results. Discover Bizleap's journey since 2020, our mission, 200+ delivered projects, and 30+ expert team."
        url="/about"
      />

      {/* Global Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-28 px-5 md:px-10 max-w-[1400px] mx-auto text-center overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 shadow-xs mb-6">
            <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
            Since 2020 • Premium Digital Agency & Marketplace
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black dark:text-white leading-[1.1] mb-6">
            Where Brands <br className="hidden sm:inline" />
            Leap Forward.
          </h1>

          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal max-w-2xl mx-auto mb-8">
            Driven by Design. Backed by Results. We craft thoughtful digital experiences, production-ready templates, and software solutions that help businesses scale.
          </p>

          {/* Quote Card */}
          <div className="inline-block p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 italic font-medium max-w-xl">
            “We don't create for clients. We create for the dreamers, the builders, the ones who wake up wanting to leave a mark.”
          </div>
        </div>
      </section>

      {/* Real Stats Bar */}
      <section className="w-full py-10 px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((st) => (
            <div 
              key={st.label} 
              className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-center flex flex-col items-center justify-center hover:border-black dark:hover:border-white transition-all shadow-xs"
            >
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-black dark:text-white tracking-tight mb-1">
                {st.value}
              </span>
              <span className="text-sm font-bold text-black dark:text-white mb-0.5">
                {st.label}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {st.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Our Journey & Story */}
      <section className="w-full py-16 px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest block">Our Journey</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-black dark:text-white leading-tight">
              Started with a Single Spark & Zero Shortcuts.
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              At Bizleap, we’re proud of our journey from humble beginnings to becoming a leading digital agency and marketplace. We started from scratch with no outside investments—just sheer determination and a clear vision to redefine how brands communicate in the digital world.
            </p>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Today, with over 6 years of expertise and a squad of 30+ passionate creatives, developers, and strategists, we treat every project like our own.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-black dark:text-white" /> Transparent Pricing</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-black dark:text-white" /> Full Source Code Delivery</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-black dark:text-white" /> Global Client Base</span>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {corePillars.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-black dark:hover:border-white transition-colors">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-black dark:text-white mb-1.5">{p.title}</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What Bizleap Does */}
      <section className="w-full py-16 px-5 md:px-10 max-w-[1400px] mx-auto bg-neutral-50 dark:bg-neutral-950 rounded-3xl border border-neutral-200 dark:border-neutral-850 my-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest block mb-1">What We Do</span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-black dark:text-white">
            End-to-End Digital Capabilities
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            Whether you need turnkey production templates or custom software solutions, we provide the complete technical backbone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2 sm:px-6">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div key={svc.title} className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-black dark:hover:border-white transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white mb-4">
                    <Icon className="w-5 h-5 text-black dark:text-white" />
                  </div>
                  <h3 className="text-base font-bold text-black dark:text-white mb-2">{svc.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{svc.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Global Presence & HQ */}
      <section className="w-full py-14 px-5 md:px-10 max-w-[1400px] mx-auto text-center">
        <div className="max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest block mb-1">Global Reach</span>
          <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white">Serving Creators Worldwide</h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Headquartered in Nagpur, Maharashtra with active project footprints across Dubai, London, and New York.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          <span className="px-3.5 py-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800">🇮🇳 India (HQ)</span>
          <span className="px-3.5 py-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800">🇦🇪 Dubai, UAE</span>
          <span className="px-3.5 py-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800">🇬🇧 London, UK</span>
          <span className="px-3.5 py-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800">🇺🇸 New York, USA</span>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="w-full py-12 px-5 md:px-10 max-w-[1200px] mx-auto mb-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-neutral-950 dark:bg-neutral-900 text-white border border-neutral-800 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black mb-3 text-white">Ready to leap forward?</h2>
            <p className="text-sm sm:text-base text-neutral-400 mb-6">
              Explore our production-ready templates or get in touch for custom development.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/templates"
                className="px-6 py-3 bg-white hover:bg-neutral-200 text-black font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <span>Explore Templates</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm rounded-xl transition-all border border-neutral-700"
              >
                Contact Us
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
