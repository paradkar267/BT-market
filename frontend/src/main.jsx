import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { CartProvider } from './CartContext'
import './index.css'
import App from './App.jsx'
import ProductPage from './ProductPage.jsx'
import CartPage from './CartPage.jsx'
import TemplatesPage from './TemplatesPage.jsx'
import FeaturedPage from './FeaturedPage.jsx'
import MyTemplatesPage from './MyTemplatesPage.jsx'
import SettingsPage from './SettingsPage.jsx'
import DashboardPage from './DashboardPage.jsx'
import WishlistPage from './WishlistPage.jsx'
import ProfilePage from './ProfilePage.jsx'
import ContactPage from './ContactPage.jsx'
import UiKitsPage from './UiKitsPage.jsx'
import ResetPasswordPage from './ResetPasswordPage.jsx'
import TermsPage from './TermsPage.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import PrivacyPage from './PrivacyPage.jsx'
import CookiePage from './CookiePage.jsx'
import PreviewPage from './PreviewPage.jsx'

import { ThemeProvider } from './ThemeContext'
import { AuthProvider, useAuth } from './AuthContext'
import { WishlistProvider } from './WishlistContext'
import { CurrencyProvider } from './CurrencyContext'
import { HelmetProvider } from 'react-helmet-async'
import { GradientBackground } from '@/components/ui/gradient-background-4'
import SmoothScroll from './SmoothScroll'
import { CommandPalette } from './components/ui/CommandPalette'
import { SocialProofToast } from './components/ui/SocialProofToast'
import { ErrorBoundary } from './ErrorBoundary.jsx'

// Guard for normal logged in users
function ProtectedRoute({ children }) {
  const { user, loading, openAuthModal } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    setTimeout(() => {
      openAuthModal();
    }, 100);
    return <Navigate to="/" replace />;
  }

  return children;
}

// Guard for admin dashboard
function AdminRoute({ children }) {
  const { user, loading, isAdmin, openAuthModal } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    setTimeout(() => {
      if (!user) openAuthModal();
    }, 100);
    return <Navigate to="/" replace />;
  }

  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider>
          <GradientBackground />
          <AuthProvider>
            <CurrencyProvider>
              <CartProvider>
                <WishlistProvider>
                  <HelmetProvider>
                    <SmoothScroll>
                    <SocialProofToast />
                    <Toaster position="top-center" richColors />
                    <CommandPalette />
                    <Routes>
                      <Route path="/" element={<App />} />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                      <Route path="/templates" element={<TemplatesPage />} />
                      <Route path="/featured" element={<FeaturedPage />} />
                      <Route path="/my-templates" element={<ProtectedRoute><MyTemplatesPage /></ProtectedRoute>} />
                      <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/ui-kits" element={<UiKitsPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/cookies" element={<CookiePage />} />
                      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                      <Route path="/preview/:id" element={<PreviewPage />} />
                    </Routes>
                    </SmoothScroll>
                  </HelmetProvider>
                </WishlistProvider>
              </CartProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)
