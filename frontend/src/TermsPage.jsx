import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './components/ui/Logo';
import UserMenu from './UserMenu';
import { useTheme } from './ThemeContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from './components/SEO';

export default function TermsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
      <SEO 
        title="Terms and Conditions | BizLeap Marketplace"
        description="Review BizLeap commercial license terms, template usage rights, and customer service conditions."
        url="/terms"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Terms & Conditions", url: "/terms" }
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
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">Terms and Conditions</h1>
          
          <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using BT Market (Bizleap), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform or purchase any products.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">2. Digital Products and Licensing</h2>
              <p className="mb-4">
                BT Market is a marketplace for digital assets, including website templates, UI kits, and design components.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All products are digital downloads. No physical items will be shipped.</li>
                <li>Upon purchase, you are granted a non-exclusive, non-transferable license to use the purchased item for personal or commercial projects.</li>
                <li>You may not redistribute, resell, lease, license, or offer the purchased products as part of another marketplace or digital product offering.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">3. Payments and Refunds</h2>
              <p className="mb-4">
                All transactions are processed securely. Due to the digital nature of our products, all sales are considered final once the download has commenced.
              </p>
              <p>
                However, if you experience technical issues with a file that cannot be resolved by our support team, we may issue a refund at our sole discretion within 14 days of purchase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">4. User Accounts</h2>
              <p>
                To purchase items, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">5. Intellectual Property</h2>
              <p>
                All content on BT Market, including text, graphics, logos, images, and software, is the property of BT Market or its content suppliers and is protected by international copyright laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">6. Limitation of Liability</h2>
              <p>
                BT Market and its creators shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to, or use of, the platform or any digital products purchased from it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">7. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to the website. Your continued use of the platform constitutes your acceptance of the revised terms.
              </p>
            </section>
            
            <section className="pt-8 border-t border-gray-200 dark:border-white/10">
              <p className="text-sm">
                Last updated: June 30, 2026. For any questions regarding these terms, please contact us at bizleap1@gmail.com.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
