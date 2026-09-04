import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './components/ui/Logo';
import UserMenu from './UserMenu';
import { useTheme } from './ThemeContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from './components/SEO';

export default function PrivacyPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
      <SEO 
        title="Privacy Policy | BizLeap Marketplace"
        description="Learn how BizLeap protects your personal data, payments, and account information."
        url="/privacy"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Privacy Policy", url: "/privacy" }
        ]}
      />
      <nav className="flex items-center justify-between p-6 md:px-16 border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <Logo />
        <UserMenu />
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-black dark:text-white transition-colors mb-8">
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 rounded-[2rem]"
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">Privacy Policy</h1>
          
          <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">2. Use of Information</h2>
              <p>
                We may use the information we collect about you to provide, maintain, and improve our services, including to facilitate payments, send receipts, provide products and services you request, and develop new features.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">3. Data Security</h2>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
              </p>
            </section>
            <section className="pt-8 border-t border-gray-200 dark:border-white/10">
              <p className="text-sm">
                Last updated: June 30, 2026. For any questions regarding this policy, please contact us at bizleap1@gmail.com.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
