import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useTemplates } from './useTemplates';
import { useCurrency } from './CurrencyContext';
import { supabase } from './lib/supabase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Package,
  Upload,
  ShoppingBag,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  FileArchive,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Search,
  Users,
  DollarSign,
  Calendar,
  Mail,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  X,
  CreditCard,
  BarChart3,
  Activity,
  Check,
  ChevronDown,
  LayoutDashboard,
  Tag,
  Percent,
  Copy,
  Plus,
  Trash2,
  Ticket,
  ToggleLeft,
  ToggleRight,
  Send,
  Megaphone,
  Flame,
  Gift,
  Bell,
  Crown,
  Award,
  History,
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Palette,
  ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Logo } from './components/ui/Logo';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { LivePreviewModal } from './components/ui/LivePreviewModal';

const CATEGORY_COLORS = ['#6366f1', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AdminDashboard() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const { templates, refetch } = useTemplates();
  const { formatPrice, currency, convertPrice } = useCurrency();
  
  // Navigation tabs: 'overview' | 'templates' | 'orders' | 'upload' | 'coupons' | 'campaigns' | 'customers'
  const [activeTab, setActiveTab] = useState('overview');

  // Customer CRM State
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerStats, setCustomerStats] = useState({ totalUsers: 0, vipUsers: 0, payingCustomers: 0, totalRevenue: 0, averageLtv: 0 });
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerTierFilter, setCustomerTierFilter] = useState('all'); // 'all' | 'vip' | 'buyers' | 'leads'
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState(null);
  const [isGrantAccessOpen, setIsGrantAccessOpen] = useState(false);
  const [grantingCustomer, setGrantingCustomer] = useState(null);
  const [grantForm, setGrantForm] = useState({ user_id: '', user_email: '', template_id: '', note: '' });
  const [grantSubmitting, setGrantSubmitting] = useState(false);
  const [directEmailModalOpen, setDirectEmailModalOpen] = useState(false);
  const [directEmailForm, setDirectEmailForm] = useState({ user_email: '', subject: '', message: '' });
  const [directEmailSubmitting, setDirectEmailSubmitting] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // Orders and Analytics state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStats, setOrderStats] = useState({ totalOrders: 0, totalRevenue: 0, totalCustomers: 0, totalUsers: 0 });
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dateFilter, setDateFilter] = useState('all'); // '7days' | '30days' | 'all'
  const [chartRevenueData, setChartRevenueData] = useState([]);
  const [chartCategoryData, setChartCategoryData] = useState([]);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportState, setExportState] = useState({ status: 'idle', type: null });
  // Refund state
  const [refundTarget, setRefundTarget] = useState(null); // order to refund
  const [refundReason, setRefundReason] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponSearchQuery, setCouponSearchQuery] = useState('');
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);
  const [couponSubmitting, setCouponSubmitting] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    usage_limit: '',
    expires_at: '',
    is_active: true
  });

  // Campaigns State
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignAudienceStats, setCampaignAudienceStats] = useState({ totalUsers: 0, verifiedBuyers: 0, activeSubscribers: 0 });
  const [campaignSearchQuery, setCampaignSearchQuery] = useState('');
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [campaignSubmitting, setCampaignSubmitting] = useState(false);
  const [previewingCampaignEmail, setPreviewingCampaignEmail] = useState(null);
  const [campaignPreviewDevice, setCampaignPreviewDevice] = useState('desktop');

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'launch', // 'launch' | 'sale' | 'announcement' | 'vip'
    subject: '',
    preview_text: '',
    headline: '',
    body_text: '',
    button_text: 'Explore Templates →',
    button_url: '/explore',
    template_id: '',
    coupon_code: '',
    audience_type: 'all', // 'all' | 'template_buyers' | 'test'
    test_email: ''
  });

  // Broadcast Update Modal state
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastTemplate, setBroadcastTemplate] = useState(null);
  const [broadcastVersion, setBroadcastVersion] = useState('');
  const [broadcastChangelog, setBroadcastChangelog] = useState('');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastBuyers, setBroadcastBuyers] = useState([]);
  // Flash Sale Top Bar & Announcement State
  const [bannerConfig, setBannerConfig] = useState({
    is_enabled: true,
    headline: '🔥 Weekend Mega Flash Sale Ends in:',
    coupon_code: 'LAUNCH50',
    discount_badge: '50% OFF',
    button_text: 'Claim 50% OFF Now →',
    button_url: '/explore',
    end_time: new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16),
    theme: 'fire',
    is_dismissible: true
  });
  const [bannerLoading, setBannerLoading] = useState(false);
  const [bannerSaving, setBannerSaving] = useState(false);

  // Upload state
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Automatic Live Preview state
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [modalPreviewTemplate, setModalPreviewTemplate] = useState(null);

  // Edit modal state
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Delete modal state
  const [deleteTemplateId, setDeleteTemplateId] = useState(null);

  // Form state (for upload)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'React',
    tag: 'SaaS',
    keywords: '',
    image: '',
    previewUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isEditUploadingImage, setIsEditUploadingImage] = useState(false);

  // Check Admin Access
  const isAdmin = user?.email?.toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase() || 'bizleap1@gmail.com');

  useEffect(() => {
    if (session && !isAdmin) {
      navigate('/');
    }
  }, [session, isAdmin, navigate]);

  // Fetch Customer Orders & Analytics Data
  const fetchOrdersAndAnalytics = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) return;

      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/orders`);
      targetUrls.push('/api/admin/orders');
      targetUrls.push('/api/admin-orders');

      let data = null;
      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${currentSession.access_token}`
            }
          });
          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch {
          // try next
        }
      }

      if (data && data.orders) {
        setOrders(data.orders);
        if (data.stats) {
          setOrderStats(data.stats);
        }

        // Aggregate 7-Day Revenue Trend
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            dateObj: d,
            name: d.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: 0,
            orders: 0
          };
        });

        // Category Map
        const categoryMap = {};

        data.orders.forEach(o => {
          const oDate = new Date(o.createdAt);
          const dayMatch = last7Days.find(d => 
            d.dateObj.getDate() === oDate.getDate() && 
            d.dateObj.getMonth() === oDate.getMonth() &&
            d.dateObj.getFullYear() === oDate.getFullYear()
          );
          if (dayMatch) {
            dayMatch.revenue += o.amount || 0;
            dayMatch.orders += 1;
          }

          const cat = o.template?.category || 'Other';
          categoryMap[cat] = (categoryMap[cat] || 0) + (o.amount || 0);
        });

        setChartRevenueData(last7Days);

        const categoryArray = Object.entries(categoryMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);

        setChartCategoryData(categoryArray);
      }
    } catch (err) {
      console.error("Failed to load admin orders & analytics:", err);
      toast.error("Failed to load analytics data");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Fetch Announcement Banner Settings
  const fetchBannerSettings = useCallback(async () => {
    setBannerLoading(true);
    try {
      const res = await fetch(`/api/announcement-banner?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.banner) {
          const formattedEndTime = data.banner.end_time
            ? new Date(data.banner.end_time).toISOString().slice(0, 16)
            : new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16);
          setBannerConfig({
            ...data.banner,
            end_time: formattedEndTime
          });
        }
      }
    } catch (err) {
      console.error('Failed to load flash sale banner:', err);
    } finally {
      setBannerLoading(false);
    }
  }, []);

  const handleIssueRefund = async () => {
    if (!refundTarget) return;
    setRefundSubmitting(true);
    const toastId = toast.loading(`Processing refund for ${refundTarget.customer.name}...`);
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin-refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${s?.access_token}` },
        body: JSON.stringify({
          purchaseId: refundTarget.id,
          reason: refundReason || 'Refund issued by admin',
          frontendUrl: window.location.origin
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Refund failed');
      toast.success(`✅ Refund processed! Ref: ${data.refundId}`, { id: toastId });
      setRefundTarget(null);
      setRefundReason('');
      // Update local order status instantly
      setOrders(prev => prev.map(o => o.id === refundTarget.id ? { ...o, status: 'refunded', refundId: data.refundId } : o));
    } catch (err) {
      toast.error(err.message || 'Refund failed', { id: toastId });
    } finally {
      setRefundSubmitting(false);
    }
  };

  const handleToggleBannerStatus = async () => {
    const newStatus = !bannerConfig.is_enabled;
    setBannerConfig(prev => ({ ...prev, is_enabled: newStatus }));

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const payload = {
        ...bannerConfig,
        is_enabled: newStatus,
        end_time: new Date(bannerConfig.end_time).toISOString()
      };

      const res = await fetch('/api/announcement-banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession?.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (newStatus) {
          toast.success('🟢 Flash sale banner is now LIVE on store!');
        } else {
          toast.info('⚪ Flash sale banner is now DISABLED / HIDDEN on store.');
        }
        window.dispatchEvent(new CustomEvent('flash_banner_updated'));
      }
    } catch (err) {
      console.error('Error toggling banner status:', err);
    }
  };

  const handleSaveBannerSettings = async (e) => {
    if (e) e.preventDefault();
    setBannerSaving(true);
    const toastId = toast.loading('Saving flash sale banner settings...');

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const payload = {
        ...bannerConfig,
        end_time: new Date(bannerConfig.end_time).toISOString()
      };

      const res = await fetch('/api/announcement-banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession?.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update banner');

      toast.success(data.message || '⚡ Flash sale top bar updated live on store!', { id: toastId });
      window.dispatchEvent(new CustomEvent('flash_banner_updated'));
    } catch (err) {
      toast.error(err.message || 'Error saving banner settings', { id: toastId });
    } finally {
      setBannerSaving(false);
    }
  };

  const handleApplyPresetDuration = (hours) => {
    const targetDate = new Date(Date.now() + hours * 3600 * 1000);
    setBannerConfig(prev => ({
      ...prev,
      end_time: targetDate.toISOString().slice(0, 16)
    }));
    toast.info(`Countdown set to expire in +${hours} hours (${targetDate.toLocaleDateString()})`);
  };

  const handleSetWeekendPreset = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
    const sundayNight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 0);
    setBannerConfig(prev => ({
      ...prev,
      end_time: sundayNight.toISOString().slice(0, 16)
    }));
    toast.info(`Countdown set to end this Sunday midnight!`);
  };

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        fetchOrdersAndAnalytics();
        fetchBannerSettings();
      }
    }, 50);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchOrdersAndAnalytics, fetchBannerSettings]);

  // Fetch Coupons
  const fetchCoupons = useCallback(async () => {
    setCouponsLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) return;

      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/coupons`);
      targetUrls.push('/api/admin/coupons');
      targetUrls.push('/api/admin-coupons');

      let data = null;
      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${currentSession.access_token}` }
          });
          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch {
          // try next
        }
      }

      if (Array.isArray(data)) {
        setCoupons(data);
      }
    } catch (err) {
      console.error('Error loading coupons:', err);
    } finally {
      setCouponsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) fetchCoupons();
    }, 60);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchCoupons]);

  // Fetch Campaigns
  const fetchCampaigns = useCallback(async () => {
    setCampaignsLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/campaigns`);
      targetUrls.push('/api/admin-campaigns');
      targetUrls.push('/api/campaigns');

      let data = null;
      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${currentSession?.access_token}`
            }
          });
          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch {
          // try next
        }
      }

      if (data && data.campaigns) {
        setCampaigns(data.campaigns);
        if (data.audienceStats) {
          setCampaignAudienceStats(data.audienceStats);
        }
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) fetchCampaigns();
    }, 70);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchCampaigns]);

  // Fetch Customers CRM
  const fetchCustomers = useCallback(async () => {
    setCustomersLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/customers`);
      targetUrls.push('/api/admin-customers');
      targetUrls.push('/api/admin/customers');

      let data = null;
      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${currentSession?.access_token}`
            }
          });
          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch {
          // try next
        }
      }

      if (data && data.customers) {
        setCustomers(data.customers);
        if (data.stats) {
          setCustomerStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching CRM customers:', err);
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) fetchCustomers();
    }, 80);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchCustomers]);

  const handleGrantAccess = async (e) => {
    if (e) e.preventDefault();
    if (!grantForm.user_id || !grantForm.template_id) {
      toast.error('Please select a customer and a template.');
      return;
    }

    setGrantSubmitting(true);
    const toastId = toast.loading('Granting free license and sending gift email...');

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/customers/grant`);
      targetUrls.push('/api/admin-customers');

      let response = null;
      let resJson = null;

      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentSession?.access_token}`
            },
            body: JSON.stringify({
              action: 'grant',
              ...grantForm
            })
          });
          resJson = await res.json().catch(() => ({}));
          if (res.ok) {
            response = res;
            break;
          } else if (resJson.error) {
            throw new Error(resJson.error);
          }
        } catch (err) {
          if (err.message && !err.message.includes('fetch')) throw err;
        }
      }

      if (!response || !response.ok) {
        throw new Error(resJson?.error || 'Failed to grant license');
      }

      toast.success(resJson?.message || '🎁 Free template access successfully granted to customer!', { id: toastId });
      setIsGrantAccessOpen(false);
      setGrantForm({ user_id: '', user_email: '', template_id: '', note: '' });
      fetchCustomers();
      if (selectedCustomerProfile) {
        const updatedCustomer = customers.find(c => c.id === grantForm.user_id);
        if (updatedCustomer) setSelectedCustomerProfile(updatedCustomer);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to grant template access', { id: toastId });
    } finally {
      setGrantSubmitting(false);
    }
  };

  const handleRevokeAccess = async (target) => {
    if (!target) return;
    const { purchaseId, userId, templateId, title } = target;
    const toastId = toast.loading(`Revoking license for ${title || 'template'}...`);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/customers/revoke`);
      targetUrls.push('/api/admin-customers');

      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentSession?.access_token}`
            },
            body: JSON.stringify({
              purchase_id: purchaseId,
              user_id: userId,
              template_id: templateId
            })
          });
          if (res.ok) break;
        } catch {
          // fallback
        }
      }

      toast.success(`Access to '${title || 'Template'}' has been permanently revoked.`, { id: toastId });
      setRevokeTarget(null);
      fetchCustomers();

      if (selectedCustomerProfile) {
        setSelectedCustomerProfile(prev => prev ? {
          ...prev,
          purchased_templates: prev.purchased_templates.filter(t => (purchaseId && t.purchase_id && t.purchase_id !== purchaseId) && (templateId && String(t.id) !== String(templateId))),
          total_purchases: Math.max(0, prev.total_purchases - 1)
        } : null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to revoke template access', { id: toastId });
    }
  };

  const handleDeleteUserAccount = async (targetUser) => {
    if (!targetUser) return;
    const toastId = toast.loading(`Permanently deleting account for ${targetUser.email}...`);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/customers/delete-user`);
      targetUrls.push('/api/admin-customers');

      let response = null;
      let resJson = null;

      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentSession?.access_token}`
            },
            body: JSON.stringify({
              action: 'delete_user',
              user_id: targetUser.id
            })
          });
          resJson = await res.json().catch(() => ({}));
          if (res.ok) {
            response = res;
            break;
          } else if (resJson.error) {
            throw new Error(resJson.error);
          }
        } catch (err) {
          if (err.message && !err.message.includes('fetch')) throw err;
        }
      }

      if (!response || !response.ok) {
        throw new Error(resJson?.error || 'Failed to delete user account');
      }

      toast.success(`Account for ${targetUser.email} has been permanently deleted.`, { id: toastId });
      setUserToDelete(null);
      if (selectedCustomerProfile?.id === targetUser.id) {
        setSelectedCustomerProfile(null);
      }
      fetchCustomers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to delete account', { id: toastId });
    }
  };

  const handleSendDirectEmail = async (e) => {
    if (e) e.preventDefault();
    if (!directEmailForm.user_email || !directEmailForm.subject || !directEmailForm.message) {
      toast.error('Recipient email, subject, and message are required.');
      return;
    }

    setDirectEmailSubmitting(true);
    const toastId = toast.loading('Sending direct message to customer...');

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/customers/email`);
      targetUrls.push('/api/admin-customers');

      let response = null;
      let resJson = null;

      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentSession?.access_token}`
            },
            body: JSON.stringify({
              action: 'email',
              ...directEmailForm
            })
          });
          resJson = await res.json().catch(() => ({}));
          if (res.ok) {
            response = res;
            break;
          }
        } catch {
          // try next
        }
      }

      if (!response || !response.ok) {
        throw new Error(resJson?.error || 'Failed to send email');
      }

      toast.success(resJson?.message || 'Email message sent successfully!', { id: toastId });
      setDirectEmailModalOpen(false);
      setDirectEmailForm({ user_email: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to send direct email', { id: toastId });
    } finally {
      setDirectEmailSubmitting(false);
    }
  };

  const handleImageFileUpload = async (file, target = 'create') => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB.');
      return;
    }

    const toastId = toast.loading('Uploading cover image...');
    if (target === 'create') setIsUploadingImage(true);
    else setIsEditUploadingImage(true);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          fileName: file.name,
          mimeType: file.type
        })
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to upload image');
      }

      if (target === 'create') {
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        setEditForm(prev => ({ ...prev, image: data.url }));
      }

      toast.success('Cover image uploaded successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Image upload failed', { id: toastId });
    } finally {
      if (target === 'create') setIsUploadingImage(false);
      else setIsEditUploadingImage(false);
    }
  };

  const handleSendCampaign = async (e) => {
    if (e) e.preventDefault();
    if (!campaignForm.subject.trim() || !campaignForm.headline.trim() || !campaignForm.body_text.trim()) {
      toast.error('Subject, headline, and message body are required.');
      return;
    }

    setCampaignSubmitting(true);
    const toastId = toast.loading('Dispatching campaign emails to target audience...');

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      
      const targetUrls = [];
      targetUrls.push('/api/admin-campaigns');
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/campaigns/send`);

      const payload = {
        ...campaignForm,
        frontendUrl: window.location.origin
      };

      let response = null;
      let resData = null;

      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentSession?.access_token}`
            },
            body: JSON.stringify(payload)
          });
          resData = await res.json().catch(() => ({}));
          if (res.ok) {
            response = res;
            break;
          } else if (resData?.error) {
            throw new Error(resData.error);
          }
        } catch (err) {
          if (err.message && !err.message.includes('fetch')) throw err;
        }
      }

      if (!response || !response.ok) {
        throw new Error(resData?.error || 'Failed to dispatch campaign');
      }

      toast.success(resData?.message || `🎉 Campaign successfully sent to ${resData?.sent_count || 0} recipient(s)!`, { id: toastId });
      setIsCreateCampaignOpen(false);
      fetchCampaigns();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to send campaign', { id: toastId });
    } finally {
      setCampaignSubmitting(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/campaigns/${id}`);
      targetUrls.push(`/api/admin-campaigns?id=${id}`);

      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${currentSession?.access_token}`
            }
          });
          if (res.ok) break;
        } catch {
          // fallback
        }
      }

      setCampaigns(prev => prev.filter(c => c.id !== id));
      toast.success('Campaign removed from history');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete campaign');
    }
  };

  const applyCampaignPreset = (type) => {
    const presets = {
      launch: {
        name: 'New Template Release Blast',
        subject: '🚀 New Release: [Template Name] is now live on Bizleap Marketplace!',
        preview_text: 'Get instant source code download & lifetime updates',
        headline: 'Exciting New Template Added to Bizleap! 🚀',
        body_text: '• Built with modern responsive UI and clean architecture\n• Includes complete Figma designs, components, and full source code\n• 100/100 Lighthouse performance & SEO ready\n• Available now with instant download!',
        button_text: 'Explore New Template →',
        button_url: '/explore'
      },
      sale: {
        name: 'Weekend Flash Sale 50% OFF',
        subject: '🔥 Flash Sale: 50% OFF All Premium Digital Templates!',
        preview_text: 'Use promo code LAUNCH50 at checkout. 48 hours only!',
        headline: 'Exclusive Flash Sale — 50% OFF Everything! 🔥',
        body_text: '• Enjoy 50% instant discount on all React, Next.js, and Figma templates\n• Commercial license granted for personal and client projects\n• Verified code with lifetime free version updates\n• Limited to the first 50 buyers only!',
        button_text: 'Claim 50% OFF Now →',
        button_url: '/explore',
        coupon_code: coupons[0]?.code || 'LAUNCH50'
      },
      announcement: {
        name: 'Major Marketplace Feature Update',
        subject: '📢 Big News: Marketplace Improvements & New Features are Live!',
        preview_text: 'Faster downloads, dark mode enhancements, and new categories',
        headline: 'We just leveled up your marketplace experience! ⚡',
        body_text: '• Ultra-fast template downloads & automatic invoice generation\n• Revamped UI with modern Bento Grid designs\n• 1-Click update notifications for all template buyers\n• Expanded collection of SaaS and startup boilerplates',
        button_text: 'Visit Marketplace →',
        button_url: '/explore'
      },
      vip: {
        name: 'Exclusive VIP Customer Reward',
        subject: '🎁 A Special Thank You Gift for our Valued Creators & Buyers',
        preview_text: 'Unlock exclusive benefits and early access on Bizleap',
        headline: 'You’ve Unlocked Exclusive VIP Perks! 🎁',
        body_text: '• Exclusive early access to upcoming boilerplate releases\n• Special VIP discount codes for your next purchase\n• Direct priority developer support\n• Free lifetime access to updated versions and design systems',
        button_text: 'Access VIP Collection →',
        button_url: '/explore'
      }
    };

    const preset = presets[type];
    if (preset) {
      setCampaignForm(prev => ({
        ...prev,
        type,
        ...preset
      }));
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discount_value) {
      toast.error("Please fill in code and discount value");
      return;
    }

    setCouponSubmitting(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/coupons`);
      targetUrls.push('/api/admin/coupons');
      targetUrls.push('/api/admin-coupons');

      let success = false;
      let errorMsg = 'Failed to create coupon';

      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentSession?.access_token}`
            },
            body: JSON.stringify(couponForm)
          });
          const resJson = await res.json();
          if (res.ok && (resJson.success || resJson.id)) {
            success = true;
            break;
          } else if (resJson.error) {
            errorMsg = resJson.error;
            break;
          }
        } catch {
          // try next
        }
      }

      if (success) {
        toast.success(`🎉 Coupon '${couponForm.code.toUpperCase()}' created successfully!`);
        setIsCreateCouponOpen(false);
        setCouponForm({
          code: '',
          discount_type: 'percentage',
          discount_value: '',
          min_order_amount: '',
          usage_limit: '',
          expires_at: '',
          is_active: true
        });
        fetchCoupons();
      } else {
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create coupon');
    } finally {
      setCouponSubmitting(false);
    }
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/coupons/${coupon.id}`);
      targetUrls.push(`/api/admin/coupons/${coupon.id}`);
      targetUrls.push(`/api/admin-coupons`);

      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentSession?.access_token}`
            },
            body: JSON.stringify({ id: coupon.id, is_active: !coupon.is_active })
          });
          if (res.ok) break;
        } catch (err) {
          console.warn(err);
        }
      }

      toast.success(`Coupon status updated!`);
      fetchCoupons();
    } catch {
      toast.error('Failed to update coupon status');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/coupons/${couponId}`);
      targetUrls.push(`/api/admin/coupons/${couponId}`);
      targetUrls.push(`/api/admin-coupons?id=${couponId}`);

      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${currentSession?.access_token}`
            }
          });
          if (res.ok) break;
        } catch (err) {
          console.warn(err);
        }
      }

      toast.success("Coupon deleted");
      fetchCoupons();
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const filteredCoupons = coupons.filter(c => {
    if (!couponSearchQuery) return true;
    const q = couponSearchQuery.toLowerCase();
    return c.code?.toLowerCase().includes(q) || c.discount_type?.toLowerCase().includes(q);
  });

  // Export Executive PDF / CSV Reports
  const handleExportReport = (type) => {
    setExportState({ status: 'loading', type });
    setIsExportMenuOpen(false);

    setTimeout(() => {
      if (type === 'csv') {
        let csv = "Order ID,Customer Name,Customer Email,Purchased Template,Category,Amount (INR),Date & Time,Status\n";
        orders.forEach(o => {
          csv += `"${o.paymentId}","${o.customer.name}","${o.customer.email}","${o.template.title}","${o.template.category}","${o.amount}","${new Date(o.createdAt).toLocaleString()}","${o.status}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bizleap_executive_report_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV Report exported successfully!');
      } else if (type === 'pdf') {
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42);
        doc.text("Bizleap Marketplace Executive Report", 14, 25);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated: ${new Date().toLocaleString()} | Official Admin Copy`, 14, 33);
        
        doc.setLineWidth(0.5);
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 38, 196, 38);
        
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text("Financial & Sales Summary", 14, 48);
        
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        doc.text(`• Gross Revenue: INR ${orderStats.totalRevenue.toLocaleString('en-IN')}`, 14, 56);
        doc.text(`• Completed Orders: ${orderStats.totalOrders}`, 14, 63);
        doc.text(`• Unique Customers: ${orderStats.totalCustomers}`, 14, 70);
        doc.text(`• Total Products in Store: ${templates.length}`, 14, 77);

        const tableColumn = ["Order / Payment ID", "Customer", "Product", "Amount", "Status", "Date"];
        const tableRows = orders.map(o => [
          o.paymentId,
          `${o.customer.name}\n(${o.customer.email})`,
          o.template.title,
          `INR ${o.amount}`,
          o.status,
          new Date(o.createdAt).toLocaleDateString('en-IN')
        ]);

        autoTable(doc, {
          startY: 85,
          head: [tableColumn],
          body: tableRows,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229] },
          styles: { fontSize: 8, cellPadding: 3 }
        });

        doc.save(`bizleap_executive_report_${new Date().toISOString().slice(0, 10)}.pdf`);
        toast.success('PDF Report downloaded successfully!');
      }

      setExportState({ status: 'success', type });
      setTimeout(() => setExportState({ status: 'idle', type: null }), 2000);
    }, 800);
  };

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    if (!orderSearchQuery) return true;
    const q = orderSearchQuery.toLowerCase();
    return (
      o.customer?.email?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.template?.title?.toLowerCase().includes(q) ||
      o.paymentId?.toLowerCase().includes(q)
    );
  });

  // Top selling products calculation
  const topSellingTemplates = [...templates]
    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
    .slice(0, 5);

  // Edit template prefill
  const handleEditTemplate = (template) => {
    setEditForm({
      title: template.title || '',
      description: template.description || '',
      price: template.price || '',
      category: template.category || 'React',
      tag: template.tag || '',
      keywords: Array.isArray(template.keywords) ? template.keywords.join(', ') : (template.keywords || ''),
      image: template.image || '',
    });
    setEditingTemplate(template);
  };

  // Save template edit
  const handleSaveEdit = async () => {
    setEditLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/template/${editingTemplate.id}`);
      targetUrls.push(`/api/admin/template/${editingTemplate.id}`);

      let res = null;
      let errorMsg = 'Failed to update template';

      for (const url of targetUrls) {
        try {
          const response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentSession?.access_token}`
            },
            body: JSON.stringify(editForm)
          });
          if (response.ok) {
            res = response;
            break;
          } else {
            const data = await response.json().catch(() => ({}));
            errorMsg = data.error || `Server error (${response.status})`;
          }
        } catch {
          // Fallback candidate
        }
      }

      if (!res || !res.ok) throw new Error(errorMsg);

      toast.success('Template updated successfully!');
      setEditingTemplate(null);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update template');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete modal confirm
  const handleDeleteTemplate = (id) => {
    setDeleteTemplateId(id);
  };

  const confirmDeleteTemplate = async () => {
    if (!deleteTemplateId) return;
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/template/${deleteTemplateId}`);
      targetUrls.push(`/api/admin/template/${deleteTemplateId}`);

      let res = null;
      let errorMsg = 'Failed to delete template';

      for (const url of targetUrls) {
        try {
          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${currentSession?.access_token}`
            }
          });
          if (response.ok) {
            res = response;
            break;
          } else {
            const data = await response.json().catch(() => ({}));
            errorMsg = data.error || `Server error (${response.status})`;
          }
        } catch {
          // Fallback
        }
      }

      if (!res || !res.ok) throw new Error(errorMsg);

      toast.success('Template deleted permanently');
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to delete template');
    } finally {
      setDeleteTemplateId(null);
    }
  };

  // ── 1-Click Update Broadcast Handlers ──
  const openBroadcastModal = async (template) => {
    setBroadcastTemplate(template);
    const currVerNum = parseFloat((template.version || 'v1.0').replace(/[^0-9.]/g, '')) || 1.0;
    setBroadcastVersion(`v${(currVerNum + 0.1).toFixed(1)}`);
    setBroadcastChangelog(`• Modernized UI components and responsive layout\n• Performance optimizations and faster load times\n• Clean source code documentation and latest dependencies`);
    setBroadcastModalOpen(true);
    setBroadcastFetchingBuyers(true);
    setBroadcastBuyers([]);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/templates/${template.id}/buyers`);
      targetUrls.push(`/api/admin/templates/${template.id}/buyers`);

      let buyersData = null;
      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${currentSession?.access_token}`
            }
          });
          if (res.ok) {
            buyersData = await res.json();
            break;
          }
        } catch {
          // Continue fallback
        }
      }

      if (buyersData && buyersData.buyers) {
        setBroadcastBuyers(buyersData.buyers);
      } else {
        const { data: purchases } = await supabase
          .from('purchases')
          .select('user_id')
          .eq('template_id', template.id);
        const uniqueUids = [...new Set((purchases || []).map(p => p.user_id).filter(Boolean))];
        setBroadcastBuyers(uniqueUids.map(u => ({ id: u })));
      }
    } catch (err) {
      console.warn("Could not fetch buyers list preview:", err);
    } finally {
      setBroadcastFetchingBuyers(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTemplate || !broadcastVersion.trim()) {
      toast.error("Please specify the version number (e.g. v2.0)");
      return;
    }

    setBroadcastLoading(true);
    const toastId = toast.loading(`Broadcasting update notification to buyers...`);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/broadcast-update`);
      targetUrls.push(`/api/broadcast-update`);
      targetUrls.push(`/api/admin/broadcast-update`);

      const payload = {
        templateId: broadcastTemplate.id,
        version: broadcastVersion.trim(),
        changelog: broadcastChangelog.trim(),
        frontendUrl: window.location.origin
      };

      let response = null;
      let responseData = null;

      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentSession?.access_token}`
            },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            response = res;
            responseData = await res.json();
            break;
          } else {
            const errData = await res.json().catch(() => ({}));
            responseData = errData;
          }
        } catch {
          // Fallback
        }
      }

      if (!response || !response.ok) {
        throw new Error(responseData?.error || 'Failed to dispatch broadcast emails');
      }

      toast.success(
        responseData.count > 0
          ? `🎉 Broadcast sent to ${responseData.count} buyer(s) of "${broadcastTemplate.title}"!`
          : `✅ Template updated to ${broadcastVersion}! (No previous buyers found to email)`,
        { id: toastId }
      );

      setBroadcastModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to send update broadcast', { id: toastId });
    } finally {
      setBroadcastLoading(false);
    }
  };

  // Automatic live preview generator triggered upon ZIP selection
  const handleGeneratePreview = async (file) => {
    if (!file) return;
    setPreviewLoading(true);
    setPreviewError('');
    setPreviewData(null);

    const formPayload = new FormData();
    formPayload.append('file', file);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/generate-preview`);
      targetUrls.push('/api/admin/generate-preview');

      let response = null;
      let resultData = null;
      let errorMsg = 'Preview generation failed';

      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentSession?.access_token}`
            },
            body: formPayload
          });

          if (res.ok) {
            resultData = await res.json();
            response = res;
            break;
          } else {
            const errJson = await res.json().catch(() => ({}));
            errorMsg = errJson.error || `Server error (${res.status})`;
          }
        } catch {
          // Try next target URL
        }
      }

      if (!response || !resultData || !resultData.success) {
        throw new Error(errorMsg);
      }

      setPreviewData(resultData);

      // Auto-populate form metadata if empty
      setFormData(prev => ({
        ...prev,
        title: prev.title || resultData.detectedTitle || file.name.replace(/\.zip$/i, '').replace(/[-_]/g, ' '),
        category: prev.category === 'React' && resultData.suggestedCategory ? resultData.suggestedCategory : prev.category,
        tag: prev.tag || (resultData.detectedType ? resultData.detectedType.split(' ')[0] : 'Web'),
      }));

      toast.success(`Live preview generated successfully (${resultData.detectedType})!`);
    } catch (err) {
      console.error("Preview generation error:", err);
      setPreviewError(err.message || 'Could not generate preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    handleGeneratePreview(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a ZIP file');
      return;
    }

    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess(false);

    const formPayload = new FormData();
    formPayload.append('file', selectedFile);
    formPayload.append('title', formData.title);
    formPayload.append('description', formData.description);
    formPayload.append('price', formData.price);
    formPayload.append('category', formData.category);
    formPayload.append('tag', formData.tag);
    formPayload.append('keywords', formData.keywords);
    formPayload.append('image', formData.image);
    formPayload.append('previewUrl', formData.previewUrl);
    formPayload.append('demo_url', formData.previewUrl);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';
      const targetUrls = [];
      if (backendUrl) targetUrls.push(`${backendUrl}/api/admin/upload-template`);
      targetUrls.push('/api/admin/upload-template');

      let res = null;
      let errorMsg = 'Upload failed';

      for (const url of targetUrls) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentSession?.access_token}`
            },
            body: formPayload
          });
          if (response.ok) {
            res = response;
            break;
          } else {
            const data = await response.json().catch(() => ({}));
            errorMsg = data.error || `Server error (${response.status})`;
          }
        } catch {
          // Try next target URL
        }
      }

      if (!res || !res.ok) throw new Error(errorMsg);

      setUploadSuccess(true);
      toast.success('Template published successfully to the store!');
      setFormData({
        title: '', description: '', price: '', category: 'React', tag: 'SaaS', keywords: '', image: ''
      });
      setSelectedFile(null);
      setPreviewData(null);
      refetch(); // Refresh template list
      window.dispatchEvent(new Event('templates_updated'));
    } catch (error) {
      console.error(error);
      setUploadError(error.message);
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const inputCls = "w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-sm";

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-black dark:text-white font-sans flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-white/10 h-screen sticky top-0 flex flex-col z-30">
        <div className="p-6 border-b border-gray-200 dark:border-white/10">
          <Logo />
          <div className="mt-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Unified Admin Suite
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer text-sm ${activeTab === 'overview' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}
          >
            <BarChart3 className="w-4 h-4" /> Overview & Analytics
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer text-sm ${activeTab === 'orders' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}
          >
            <ShoppingBag className="w-4 h-4" /> Customer Purchases
          </button>

          <button
            onClick={() => {
              setActiveTab('customers');
              fetchCustomers();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all cursor-pointer text-sm ${activeTab === 'customers' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-emerald-500" />
              <span>Customer CRM</span>
            </div>
            <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 text-[10px] rounded-full font-black">
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer text-sm ${activeTab === 'templates' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}
          >
            <Package className="w-4 h-4" /> Manage Templates
          </button>

          <button
            onClick={() => {
              setActiveTab('coupons');
              fetchCoupons();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer text-sm ${activeTab === 'coupons' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}
          >
            <Tag className="w-4 h-4" /> Coupons & Discounts
          </button>

          <button
            onClick={() => {
              setActiveTab('campaigns');
              fetchCampaigns();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all cursor-pointer text-sm ${activeTab === 'campaigns' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Megaphone className="w-4 h-4 text-purple-500" />
              <span>Promotions & Campaigns</span>
            </div>
            <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 text-[10px] rounded-full font-black">
              {campaigns.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('flash-sale');
              fetchBannerSettings();
              fetchCoupons();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all cursor-pointer text-sm ${activeTab === 'flash-sale' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Flash Sale Top Bar</span>
            </div>
            {bannerConfig.is_enabled ? (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer text-sm ${activeTab === 'upload' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}
          >
            <Upload className="w-4 h-4" /> Add New Template
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-white/10">
          <Link to="/" className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl font-bold text-sm transition-colors">
            Back to Store
          </Link>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-12">

        {/* ══════════════════════════════════════════════
            1. OVERVIEW & VENDOR ANALYTICS TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
            {/* Header with Export & Refresh Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black">Vendor & Store Analytics</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Real-time sales performance, revenue trajectory, and product category distribution.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchOrdersAndAnalytics}
                  disabled={ordersLoading}
                  className="px-4 py-2.5 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                  Live Sync
                </button>

                {/* Export Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                    disabled={exportState.status === 'loading'}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-indigo-500/20"
                  >
                    {exportState.status === 'loading' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : exportState.status === 'success' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4" />
                    )}
                    <span>{exportState.status === 'loading' ? 'Exporting...' : 'Export Report'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isExportMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 p-1 space-y-1">
                      <button
                        onClick={() => handleExportReport('pdf')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-left transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-red-500" />
                        <span>Executive PDF Report</span>
                      </button>
                      <button
                        onClick={() => handleExportReport('csv')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-left transition-colors cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                        <span>Orders CSV Dataset</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gross Revenue</div>
                  <div className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
                    {formatPrice(orderStats.totalRevenue)}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed Orders</div>
                  <div className="text-2xl font-black mt-1">{orderStats.totalOrders}</div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Unique Buyers</div>
                  <div className="text-2xl font-black mt-1">{orderStats.totalCustomers}</div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Templates</div>
                  <div className="text-2xl font-black mt-1">{templates.length}</div>
                </div>
              </div>
            </div>

            {/* Interactive Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Revenue Trend Area Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-black text-lg">Revenue Trajectory</h3>
                    <p className="text-xs text-gray-500">7-day gross sales volume in {currency}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Real-time</span>
                  </div>
                </div>

                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartRevenueData}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          borderColor: '#27272a',
                          borderRadius: '10px',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                        formatter={(val) => [`₹${val}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Breakdown Pie Chart */}
              <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col">
                <div className="mb-4">
                  <h3 className="font-black text-lg">Sales by Category</h3>
                  <p className="text-xs text-gray-500">Distribution across tech stacks</p>
                </div>

                <div className="h-[200px] w-full relative flex items-center justify-center">
                  {chartCategoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {chartCategoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            borderColor: '#27272a',
                            borderRadius: '10px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                          formatter={(val) => [`₹${val}`, 'Sales']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-gray-400 text-xs">No category sales data yet</div>
                  )}
                </div>

                <div className="mt-auto space-y-2 pt-2 border-t border-gray-100 dark:border-white/5">
                  {chartCategoryData.slice(0, 4).map((cat, idx) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}></span>
                        <span>{cat.name}</span>
                      </div>
                      <span className="text-gray-500">₹{cat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Products & Recent Sales Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Best Sellers */}
              <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-black text-base">Top Performing Products</h3>
                  <button onClick={() => setActiveTab('templates')} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    View All &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {topSellingTemplates.map((t, idx) => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        {t.image && <img src={t.image} alt={t.title} className="w-9 h-9 rounded-lg object-cover shrink-0" />}
                        <div className="min-w-0">
                          <div className="font-bold text-sm truncate">{t.title}</div>
                          <span className="text-[11px] text-gray-500">{t.category} &bull; {formatPrice(t.price)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-3">
                        <div className="font-black text-sm">{t.sales || 0}</div>
                        <span className="text-[10px] text-gray-500">units sold</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-black text-base">Recent Purchases</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    View All &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {o.customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm truncate">{o.customer.name}</div>
                          <div className="text-xs text-indigo-600 dark:text-indigo-400 truncate">{o.template.title}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-3">
                        <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">{formatPrice(o.amount)}</div>
                        <span className="text-[10px] text-gray-500">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            2. MANAGE TEMPLATES TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'templates' && (
          <div className="max-w-6xl mx-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black">Manage Templates</h1>
                <p className="text-gray-500 text-sm mt-1">View, edit, preview, and manage all templates in your marketplace.</p>
              </div>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Add Template
              </button>
            </div>

            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-xs uppercase font-bold text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Sales</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                    {templates.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={t.image} alt={t.title} className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <div className="font-bold flex items-center gap-2">
                                <span>{t.title}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 rounded font-bold">
                                  {t.version || 'v1.0'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">ID: {t.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-md">
                            {t.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold">{formatPrice(t.price)}</td>
                        <td className="px-6 py-4 text-gray-500">{t.sales}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openBroadcastModal(t)}
                              className="px-3 py-1.5 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-purple-500/5"
                              title="Broadcast update notification email to buyers"
                            >
                              <Megaphone className="w-4 h-4 text-purple-500" />
                              <span>Notify Buyers</span>
                            </button>
                            <button
                              onClick={() => setModalPreviewTemplate(t)}
                              className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-black dark:text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Open Live Preview"
                            >
                              <Eye className="w-4 h-4 text-indigo-500" />
                              <span>Preview</span>
                            </button>
                            <button
                              onClick={() => handleEditTemplate(t)}
                              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(t.id)}
                              className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            3. CUSTOMER PURCHASES TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="max-w-6xl mx-auto animate-fade-in-up space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black">Customer Purchases & Orders</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Complete list of customer purchases, verified buyer emails, transaction IDs, and revenue.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchOrdersAndAnalytics}
                  disabled={ordersLoading}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => handleExportReport('csv')}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-indigo-500/20"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Search Filter Strip */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer email, name, template title, or payment ID..."
                value={orderSearchQuery}
                onChange={e => setOrderSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium shadow-sm transition-all"
              />
            </div>

            {/* Purchases Table */}
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-xs uppercase font-bold text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Customer Details</th>
                      <th className="px-6 py-4">Purchased Template</th>
                      <th className="px-6 py-4">Payment ID</th>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                    {ordersLoading ? (
                      <tr>
                        <td colSpan="7" className="py-16 text-center text-gray-500">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
                          <span>Fetching customer orders...</span>
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-16 text-center text-gray-500">
                          <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                          <h3 className="font-bold text-base text-gray-700 dark:text-gray-300">No purchases found</h3>
                          <p className="text-xs text-gray-400 mt-1">
                            {orderSearchQuery ? 'Try adjusting your search query' : 'When customers buy templates, their verified details will appear here automatically.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                          {/* Customer */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                                {order.customer.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-sm truncate">{order.customer.name}</div>
                                <a
                                  href={`mailto:${order.customer.email}`}
                                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline truncate block"
                                  title="Send Email"
                                >
                                  {order.customer.email}
                                </a>
                              </div>
                            </div>
                          </td>

                          {/* Template */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {order.template.image ? (
                                <img src={order.template.image} alt={order.template.title} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-sm truncate max-w-[200px]">{order.template.title}</div>
                                <span className="inline-block px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 text-[10px] font-bold rounded text-gray-600 dark:text-gray-400">
                                  {order.template.category}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Payment ID */}
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs px-2.5 py-1 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 font-bold">
                              {order.paymentId}
                            </span>
                          </td>

                          {/* Date & Time */}
                          <td className="px-6 py-4 text-xs text-gray-500">
                            <div className="font-bold text-black dark:text-white">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                            <div>
                              {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 font-black text-sm text-black dark:text-white">
                            {formatPrice(order.amount)}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {order.status === 'refunded' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Refunded
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Paid
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {order.status !== 'refunded' && (
                                <button
                                  onClick={() => { setRefundTarget(order); setRefundReason(''); }}
                                  className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                  title="Issue Refund & Revoke License"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" /> Refund
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                Inspect
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            REFUND CONFIRMATION MODAL (Global)
        ══════════════════════════════════════════════ */}
        {refundTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#111111] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-md animate-fade-in-up">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">💳</span>
                    <h3 className="font-black text-lg">Issue Refund</h3>
                  </div>
                  <p className="text-xs text-gray-500">This will revoke the customer's download license and initiate a refund.</p>
                </div>
                <button onClick={() => setRefundTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order Summary */}
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Customer</span>
                    <span className="text-sm font-black">{refundTarget.customer.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Template</span>
                    <span className="text-sm font-bold truncate max-w-[200px]">{refundTarget.template.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Refund Amount</span>
                    <span className="text-base font-black text-red-600 dark:text-red-400">{formatPrice(refundTarget.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Payment ID</span>
                    <span className="font-mono text-xs">{refundTarget.paymentId}</span>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Refund Reason</label>
                  <select
                    value={refundReason}
                    onChange={e => setRefundReason(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                  >
                    <option value="">— Select a reason —</option>
                    <option value="Customer request">Customer request</option>
                    <option value="Accidental purchase">Accidental purchase</option>
                    <option value="Duplicate payment">Duplicate payment</option>
                    <option value="Technical issue">Technical issue / product not working</option>
                    <option value="Not as described">Product not as described</option>
                    <option value="Goodwill refund">Goodwill refund</option>
                  </select>
                  <input
                    type="text"
                    value={refundReason}
                    onChange={e => setRefundReason(e.target.value)}
                    placeholder="Or type a custom reason..."
                    className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-3 py-2">
                  ⚠️ This action <strong>immediately revokes download access</strong> and sends an automated refund confirmation email to the customer.
                </p>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  onClick={() => setRefundTarget(null)}
                  disabled={refundSubmitting}
                  className="px-5 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleIssueRefund}
                  disabled={refundSubmitting || !refundReason}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-black flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-lg shadow-red-500/20"
                >
                  {refundSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <><RefreshCw className="w-4 h-4" /> Confirm Refund</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            4. ADD NEW TEMPLATE TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'upload' && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="text-3xl font-black mb-8">Add New Template</h1>
            
            {uploadError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{uploadError}</p>
              </div>
            )}

            {uploadSuccess && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl flex items-center gap-3 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">Template uploaded & published successfully!</p>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-8">
              {/* File Dropzone */}
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-sm">
                <label className="block text-sm font-bold mb-4">Template Archive (.ZIP)</label>
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-8 text-center transition-colors cursor-pointer bg-gray-50 dark:bg-black/50"
                  onClick={() => document.getElementById('templateZipInput').click()}
                >
                  <FileArchive className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  {selectedFile ? (
                    <div>
                      <p className="font-bold text-indigo-500">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold">Click to select template ZIP</p>
                      <p className="text-xs text-gray-500 mt-1">Supports React, Vue, Next.js, HTML/CSS archives</p>
                    </div>
                  )}
                  <input 
                    id="templateZipInput"
                    type="file" 
                    accept=".zip" 
                    className="hidden" 
                    onChange={e => handleFileSelect(e.target.files[0])}
                  />
                </div>

                {/* ── Live Demo URL Input (ThemeForest / Envato Standard) ── */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span>Live Demo URL (ThemeForest / Envato Standard)</span>
                    </label>
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">
                      Live Preview Link
                    </span>
                  </div>
                  <input
                    type="url"
                    value={formData.previewUrl}
                    onChange={e => setFormData({ ...formData, previewUrl: e.target.value })}
                    className={inputCls}
                    placeholder="https://dental-clinic-demo.vercel.app"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Enter the live working demo URL of your template. Marketplace customers will see an interactive responsive preview.
                  </p>
                </div>

                {/* ── Live Device Frame Preview ── */}
                {formData.previewUrl ? (
                  <div className="mt-6 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden bg-gray-50 dark:bg-black">
                    <div className="bg-gray-100 dark:bg-white/5 px-6 py-4 border-b border-gray-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="font-bold text-sm">Live Demo Frame Preview</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gray-200 dark:bg-white/10 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => setPreviewDevice('desktop')}
                            className={`p-1.5 rounded-md transition-colors ${previewDevice === 'desktop' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-gray-500'}`}
                            title="Desktop View"
                          >
                            <Monitor className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewDevice('tablet')}
                            className={`p-1.5 rounded-md transition-colors ${previewDevice === 'tablet' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-gray-500'}`}
                            title="Tablet View"
                          >
                            <Tablet className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewDevice('mobile')}
                            className={`p-1.5 rounded-md transition-colors ${previewDevice === 'mobile' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-gray-500'}`}
                            title="Mobile View"
                          >
                            <Smartphone className="w-4 h-4" />
                          </button>
                        </div>

                        <a
                          href={formData.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Tab</span>
                        </a>
                      </div>
                    </div>

                    <div className="p-6 flex justify-center items-center bg-[#09090b]">
                      <div 
                        className={`transition-all duration-300 overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-white ${
                          previewDevice === 'desktop' ? 'w-full h-[480px]' : 
                          previewDevice === 'tablet' ? 'w-[600px] h-[550px]' : 'w-[360px] h-[550px]'
                        }`}
                      >
                        <iframe
                          src={formData.previewUrl}
                          title="Template Preview"
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Template Details Form */}
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-sm space-y-6">
                <h3 className="font-black text-lg">Template Details</h3>

                <div>
                  <label className="block text-sm font-bold mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Modern SaaS Landing Page"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Description</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className={inputCls}
                    placeholder="Describe key features, stack details, and customization options..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. 3999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className={inputCls}
                    >
                      <option value="React">React</option>
                      <option value="Vue">Vue</option>
                      <option value="Next.js">Next.js</option>
                      <option value="Svelte">Svelte</option>
                      <option value="HTML">HTML</option>
                      <option value="Tailwind">Tailwind</option>
                      <option value="Webflow">Webflow</option>
                      <option value="Framer">Framer</option>
                      <option value="Figma">Figma</option>
                      <option value="React Native">React Native</option>
                      <option value="Shopify">Shopify</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2">Tag</label>
                    <input
                      type="text"
                      required
                      value={formData.tag}
                      onChange={e => setFormData({ ...formData, tag: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. Dashboard, SaaS, Portfolio"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Keywords (comma separated)</label>
                    <input
                      type="text"
                      required
                      value={formData.keywords}
                      onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                      className={inputCls}
                      placeholder="react, admin, dark mode"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Cover Image</label>
                  
                  {formData.image ? (
                    <div className="p-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={formData.image}
                          alt="Cover Preview"
                          className="w-16 h-12 object-cover rounded-lg border border-gray-200 dark:border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate text-gray-900 dark:text-white">Selected Cover Image</div>
                          <div className="text-[10px] text-gray-400 truncate">{formData.image}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <label className="px-3 py-1.5 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => e.target.files?.[0] && handleImageFileUpload(e.target.files[0], 'create')}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove Image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Upload Dropzone */}
                      <label className="border-2 border-dashed border-gray-200 dark:border-white/15 hover:border-indigo-500 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-gray-50/50 dark:bg-white/[0.02] hover:bg-indigo-50/20 transition-all text-center">
                        {isUploadingImage ? (
                          <div className="flex flex-col items-center gap-2 py-2">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                            <span className="text-xs font-bold text-gray-500">Uploading cover image...</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Click to upload cover image</span>
                              <span className="text-xs text-gray-400"> or drag & drop</span>
                            </div>
                            <p className="text-[10px] text-gray-400">PNG, JPG, WebP, SVG up to 10MB</p>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingImage}
                          onChange={e => e.target.files?.[0] && handleImageFileUpload(e.target.files[0], 'create')}
                        />
                      </label>

                      {/* Or paste URL fallback */}
                      <div className="relative">
                        <input
                          type="url"
                          value={formData.image}
                          onChange={e => setFormData({ ...formData, image: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Or paste external image URL (https://...)"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  {uploadLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Publishing Template...</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5" /> Confirm & Publish Template</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            5. COUPONS & PROMO CODE ENGINE TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'coupons' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <Tag className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  Coupons & Promo Codes
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage flat and percentage discounts, redemption limits, expiry dates, and real-time revenue analytics.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchCoupons}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${couponsLoading ? 'animate-spin' : ''}`} />
                  <span>Sync</span>
                </button>

                <button
                  onClick={() => setIsCreateCouponOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>
            </div>

            {/* Coupons KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Coupons</span>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Tag className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black mt-3">
                  {coupons.filter(c => c.is_active).length}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  out of {coupons.length} total codes
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Redemptions</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Ticket className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black mt-3 text-emerald-600 dark:text-emerald-400">
                  {coupons.reduce((sum, c) => sum + (c.times_used || 0), 0)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  total orders with discounts
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Max Promotion Model</span>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Percent className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black mt-3">
                  {coupons.filter(c => c.discount_type === 'percentage').length >= coupons.filter(c => c.discount_type === 'flat').length ? 'Percentage' : 'Flat (₹)'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  top performing discount type
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Store Adoption</span>
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black mt-3 text-cyan-600 dark:text-cyan-400">
                  {orders.length > 0 ? `${Math.min(100, Math.round((coupons.reduce((sum, c) => sum + (c.times_used || 0), 0) / orders.length) * 100))}%` : '100%'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  of purchases used a promo
                </div>
              </div>
            </div>

            {/* Coupons Table & List */}
            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
              {/* Search Bar */}
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponSearchQuery}
                    onChange={(e) => setCouponSearchQuery(e.target.value)}
                    placeholder="Search by code (e.g. LAUNCH50)..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="text-xs text-gray-500 font-bold">
                  Showing {filteredCoupons.length} of {coupons.length} coupons
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/10 text-xs uppercase font-bold text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Promo Code</th>
                      <th className="px-6 py-4">Discount</th>
                      <th className="px-6 py-4">Min. Cart</th>
                      <th className="px-6 py-4">Redemptions</th>
                      <th className="px-6 py-4">Expiry Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredCoupons.map((coupon) => {
                      const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                      const isLimitReached = coupon.usage_limit && coupon.times_used >= coupon.usage_limit;
                      const usagePercent = coupon.usage_limit ? Math.min(100, Math.round((coupon.times_used / coupon.usage_limit) * 100)) : null;

                      return (
                        <tr key={coupon.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                          {/* Code */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-lg">
                                {coupon.code}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(coupon.code);
                                  toast.success(`Copied '${coupon.code}' to clipboard!`);
                                }}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                title="Copy code"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Discount */}
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-900 dark:text-white">
                              {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} Flat`}
                            </span>
                            <span className="block text-[11px] text-gray-400">
                              {coupon.discount_type === 'percentage' ? 'Percentage Discount' : 'Direct Cart Reduction'}
                            </span>
                          </td>

                          {/* Min Order */}
                          <td className="px-6 py-4">
                            <span className="font-medium">
                              {coupon.min_order_amount > 0 ? `₹${coupon.min_order_amount}` : 'No Minimum'}
                            </span>
                          </td>

                          {/* Redemptions */}
                          <td className="px-6 py-4 min-w-[160px]">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold">{coupon.times_used || 0} used</span>
                              <span className="text-gray-400">{coupon.usage_limit ? `Limit: ${coupon.usage_limit}` : 'Unlimited'}</span>
                            </div>
                            {coupon.usage_limit && (
                              <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${usagePercent >= 100 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                  style={{ width: `${usagePercent}%` }}
                                />
                              </div>
                            )}
                          </td>

                          {/* Expiry */}
                          <td className="px-6 py-4 text-xs">
                            {coupon.expires_at ? (
                              <div>
                                <span className={isExpired ? 'text-red-500 font-bold' : 'font-medium'}>
                                  {new Date(coupon.expires_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                                {isExpired && <span className="block text-[10px] text-red-500 font-bold">Expired</span>}
                              </div>
                            ) : (
                              <span className="text-gray-400 font-medium">Never Expires</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {isExpired ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold">
                                Expired
                              </span>
                            ) : isLimitReached ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
                                Limit Reached
                              </span>
                            ) : coupon.is_active ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 text-xs font-bold">
                                Disabled
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleCoupon(coupon)}
                                className={`p-2 rounded-xl transition-colors cursor-pointer ${coupon.is_active ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                title={coupon.is_active ? 'Disable coupon' : 'Enable coupon'}
                              >
                                {coupon.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                              </button>

                              <button
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Delete coupon"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredCoupons.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-16 text-center text-gray-500">
                          <Tag className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                          <p className="font-bold">No coupons found.</p>
                          <p className="text-xs mt-1">Create your first promo code to boost conversions!</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            5. PROMOTIONAL CAMPAIGNS & BROADCASTS TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'campaigns' && (
          <div className="max-w-6xl mx-auto animate-fade-in-up space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 uppercase tracking-wider">
                    Marketing & Growth
                  </span>
                  <span className="text-xs text-gray-400">Audience: {campaignAudienceStats.totalUsers} registered customers</span>
                </div>
                <h1 className="text-3xl font-black mt-2">Campaigns & Email Broadcasts</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Send product launch announcements, discount flash sales, seasonal promos, and VIP updates to your audience in 1-click.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    applyCampaignPreset('launch');
                    setIsCreateCampaignOpen(true);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" /> Create New Campaign
                </button>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Campaigns Sent</span>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Megaphone className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black mt-3">{campaigns.length}</div>
                <div className="text-xs text-gray-500 mt-1">
                  total broadcasts launched
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Emails Delivered</span>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black mt-3 text-indigo-600 dark:text-indigo-400">
                  {campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  verified mailboxes reached
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Audience</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black mt-3 text-emerald-600 dark:text-emerald-400">
                  {campaignAudienceStats.totalUsers || 150}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  registered marketplace customers
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Quick Blast Presets</span>
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <button
                    onClick={() => { applyCampaignPreset('sale'); setIsCreateCampaignOpen(true); }}
                    className="px-2 py-1 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-600 text-[11px] font-black rounded-lg cursor-pointer transition-colors"
                  >
                    🔥 Flash Sale
                  </button>
                  <button
                    onClick={() => { applyCampaignPreset('launch'); setIsCreateCampaignOpen(true); }}
                    className="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-600 text-[11px] font-black rounded-lg cursor-pointer transition-colors"
                  >
                    🚀 Launch
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  instant prefilled templates
                </div>
              </div>
            </div>

            {/* Campaigns History Table */}
            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={campaignSearchQuery}
                    onChange={(e) => setCampaignSearchQuery(e.target.value)}
                    placeholder="Search by campaign name or subject..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="text-xs text-gray-500 font-bold">
                  Showing {campaigns.filter(c => c.name?.toLowerCase().includes(campaignSearchQuery.toLowerCase()) || c.subject?.toLowerCase().includes(campaignSearchQuery.toLowerCase())).length} of {campaigns.length} campaigns
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/10 text-xs uppercase font-bold text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Campaign Name & Subject</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Audience</th>
                      <th className="px-6 py-4">Promo Coupon</th>
                      <th className="px-6 py-4">Delivered</th>
                      <th className="px-6 py-4">Date Sent</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {campaigns
                      .filter(c => c.name?.toLowerCase().includes(campaignSearchQuery.toLowerCase()) || c.subject?.toLowerCase().includes(campaignSearchQuery.toLowerCase()))
                      .map((c) => {
                        const typeBadgeClasses = {
                          launch: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
                          sale: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
                          vip: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
                          announcement: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                        };

                        const typeLabel = {
                          launch: '🚀 Launch',
                          sale: '🔥 Flash Sale',
                          vip: '🎁 VIP Offer',
                          announcement: '📢 Announcement'
                        };

                        return (
                          <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-sm text-gray-900 dark:text-white">{c.name}</div>
                              <div className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{c.subject}</div>
                            </td>

                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${typeBadgeClasses[c.type] || typeBadgeClasses.announcement}`}>
                                {typeLabel[c.type] || '📢 Broadcast'}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300">
                              <span className="capitalize">{c.audience_type?.replace('_', ' ') || 'All Users'}</span>
                            </td>

                            <td className="px-6 py-4">
                              {c.coupon_code ? (
                                <span className="font-mono font-bold text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded">
                                  {c.coupon_code}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {c.sent_count || c.recipients_count || 0} Sent
                              </span>
                            </td>

                            <td className="px-6 py-4 text-xs text-gray-500">
                              {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setPreviewingCampaignEmail(c)}
                                  className="px-2.5 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-black dark:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  title="View email preview"
                                >
                                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>Preview</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setCampaignForm({
                                      name: `${c.name} (Copy)`,
                                      type: c.type || 'launch',
                                      subject: c.subject || '',
                                      preview_text: c.preview_text || '',
                                      headline: c.headline || '',
                                      body_text: c.body_text || '',
                                      button_text: c.button_text || 'Explore Now →',
                                      button_url: c.button_url || '',
                                      template_id: c.template_id || '',
                                      coupon_code: c.coupon_code || '',
                                      audience_type: c.audience_type || 'all',
                                      test_email: ''
                                    });
                                    setIsCreateCampaignOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Duplicate campaign"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Clone</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteCampaign(c.id)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                                  title="Delete campaign record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                    {campaigns.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-16 text-center text-gray-500">
                          <Megaphone className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                          <p className="font-bold">No campaigns found.</p>
                          <p className="text-xs mt-1">Create your first broadcast campaign to engage your buyers!</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            FLASH SALE TOP BAR & ANNOUNCEMENTS TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'flash-sale' && (
          <div className="max-w-6xl mx-auto animate-fade-in-up space-y-8">
            {/* Header with Master Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    High-Conversion Storefront Booster
                  </span>
                  {bannerConfig.is_enabled ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live On Store
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-500">
                      Disabled / Hidden
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-black mt-2">Flash Sale Top Bar & Countdown</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Control real-time countdown timer, coupon code highlight, and promotional styling floating on top of your marketplace.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleBannerStatus}
                  title="1-Click toggle live status on store"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer border ${bannerConfig.is_enabled ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30 shadow-sm' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10'}`}
                >
                  {bannerConfig.is_enabled ? (
                    <><ToggleRight className="w-5 h-5 text-emerald-500 animate-pulse" /> Banner Active</>
                  ) : (
                    <><ToggleLeft className="w-5 h-5 text-gray-400" /> Banner Inactive</>
                  )}
                </button>

                <button
                  type="button"
                  disabled={bannerSaving}
                  onClick={handleSaveBannerSettings}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-600 hover:to-red-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {bannerSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Save Live Settings</>
                  )}
                </button>
              </div>
            </div>

            {/* LIVE REAL-TIME PREVIEW CARD */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-500" />
                  Live Storefront Banner Preview
                </span>
                <span className="text-xs text-gray-400">Updates in real-time as you customize</span>
              </div>

              {/* Preview Box */}
              <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-inner">
                {bannerConfig.is_enabled ? (
                  <div className={`w-full py-3 px-4 sm:px-6 transition-all duration-300 ${
                    bannerConfig.theme === 'cyber' ? 'bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-700 text-white' :
                    bannerConfig.theme === 'emerald' ? 'bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-700 text-white' :
                    bannerConfig.theme === 'sunset' ? 'bg-gradient-to-r from-rose-700 via-orange-600 to-amber-600 text-white' :
                    'bg-gradient-to-r from-red-700 via-amber-600 to-orange-600 text-white'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium">
                      {/* Left: Badge & Headline */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {bannerConfig.discount_badge && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/30 text-amber-200 border border-amber-300/40">
                            <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                            {bannerConfig.discount_badge}
                          </span>
                        )}
                        <span className="font-bold text-white drop-shadow-sm">
                          {bannerConfig.headline || 'Flash Sale Ends in:'}
                        </span>

                        {/* Real-time Counter Preview */}
                        <div className="inline-flex items-center gap-1 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 font-mono font-bold text-white tracking-wider text-xs">
                          <Clock className="w-3.5 h-3.5 text-amber-300" />
                          <span className="text-amber-200">02d</span>:
                          <span>08h</span>:
                          <span>42m</span>:
                          <span className="text-amber-300">19s</span>
                        </div>
                      </div>

                      {/* Right: Coupon, Button, X */}
                      <div className="flex items-center gap-2.5 flex-wrap ml-auto">
                        {bannerConfig.coupon_code && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-black text-xs bg-white text-gray-900 shadow-sm border border-white/60">
                            <span className="text-[10px] text-gray-500 uppercase font-sans font-bold">Use Code:</span>
                            <span className="tracking-wider text-orange-600">{bannerConfig.coupon_code}</span>
                            <Copy className="w-3 h-3 text-gray-400" />
                          </div>
                        )}

                        {bannerConfig.button_text && (
                          <div className="flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-xs bg-black/40 text-white border border-white/30">
                            <span>{bannerConfig.button_text}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        )}

                        {bannerConfig.is_dismissible && (
                          <div className="p-1 rounded-full text-white/70">
                            <X className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50 dark:bg-black/40 text-gray-400 text-sm">
                    <p className="font-bold">Banner is currently disabled.</p>
                    <p className="text-xs mt-1">Toggle "Banner Active" above to turn on the top bar for all marketplace visitors.</p>
                  </div>
                )}
              </div>
            </div>

            {/* CONFIGURATION FORM CARDS GRID */}
            <form onSubmit={handleSaveBannerSettings} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Headline & Copy Settings */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-amber-500" />
                    1. Promotional Copy & Text
                  </h3>

                  {/* Headline */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Banner Headline Text *
                    </label>
                    <input
                      type="text"
                      required
                      value={bannerConfig.headline}
                      onChange={e => setBannerConfig({ ...bannerConfig, headline: e.target.value })}
                      placeholder="e.g. 🔥 Weekend Mega Flash Sale Ends in:"
                      className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Discount Badge */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Highlight Badge (Optional)
                    </label>
                    <input
                      type="text"
                      value={bannerConfig.discount_badge}
                      onChange={e => setBannerConfig({ ...bannerConfig, discount_badge: e.target.value })}
                      placeholder="e.g. 50% OFF or ⚡ LIMITED DEAL"
                      className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Button Text & Target URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={bannerConfig.button_text}
                        onChange={e => setBannerConfig({ ...bannerConfig, button_text: e.target.value })}
                        placeholder="e.g. Claim 50% OFF Now →"
                        className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Button Link URL
                      </label>
                      <input
                        type="text"
                        value={bannerConfig.button_url}
                        onChange={e => setBannerConfig({ ...bannerConfig, button_url: e.target.value })}
                        placeholder="e.g. /explore or /cart"
                        className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Countdown Timer & Expiration Presets */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    2. Countdown Timer Expiration
                  </h3>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Sale End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={bannerConfig.end_time}
                      onChange={e => setBannerConfig({ ...bannerConfig, end_time: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* 1-Click Quick Presets */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      1-Click Duration Presets:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleApplyPresetDuration(12)}
                        className="p-2.5 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                      >
                        +12 Hours
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetDuration(24)}
                        className="p-2.5 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                      >
                        +24 Hours
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetDuration(48)}
                        className="p-2.5 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                      >
                        +48 Hours
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetDuration(72)}
                        className="p-2.5 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                      >
                        +3 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetDuration(168)}
                        className="p-2.5 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                      >
                        +7 Days
                      </button>
                      <button
                        type="button"
                        onClick={handleSetWeekendPreset}
                        className="p-2.5 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 rounded-xl text-xs font-bold transition-all text-center cursor-pointer"
                      >
                        End of Weekend
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Coupon Promo Code Attachment */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <Tag className="w-5 h-5 text-emerald-500" />
                    3. Highlight Promo Coupon Code
                  </h3>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                        Select From Active Store Coupons:
                      </label>
                      <button
                        type="button"
                        onClick={async () => {
                          await fetchCoupons();
                          toast.success('Active store coupons synced!');
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${couponsLoading ? 'animate-spin' : ''}`} />
                        <span>Sync Coupons ({coupons.length})</span>
                      </button>
                    </div>
                    <select
                      value={bannerConfig.coupon_code}
                      onChange={e => setBannerConfig({ ...bannerConfig, coupon_code: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">None (Don't show promo coupon pill)</option>
                      {coupons.map(c => (
                        <option key={c.id} value={c.code}>
                          {c.is_active ? '🟢' : '⚪'} {c.code} — {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT OFF`} {c.usage_limit ? `(Limit: ${c.times_used || 0}/${c.usage_limit})` : '(Unlimited)'}
                        </option>
                      ))}
                      {!coupons.some(c => c.code === bannerConfig.coupon_code) && bannerConfig.coupon_code && (
                        <option value={bannerConfig.coupon_code}>Custom Code: {bannerConfig.coupon_code}</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Or Type Custom Promo Code:
                    </label>
                    <input
                      type="text"
                      value={bannerConfig.coupon_code}
                      onChange={e => setBannerConfig({ ...bannerConfig, coupon_code: e.target.value.toUpperCase() })}
                      placeholder="e.g. LAUNCH50 or SUMMER40"
                      className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* 4. Color Theme & Dismiss Options */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    4. Visual Color Themes
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Fire Theme */}
                    <button
                      type="button"
                      onClick={() => setBannerConfig({ ...bannerConfig, theme: 'fire' })}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${bannerConfig.theme === 'fire' ? 'ring-2 ring-orange-500 border-transparent shadow-md' : 'border-gray-200 dark:border-white/10 hover:border-gray-300'}`}
                    >
                      <div className="h-4 w-full rounded-lg bg-gradient-to-r from-red-600 via-amber-500 to-orange-500 mb-2"></div>
                      <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center justify-between">
                        <span>🔥 Hot Fire</span>
                        {bannerConfig.theme === 'fire' && <Check className="w-3.5 h-3.5 text-orange-500" />}
                      </div>
                      <p className="text-[10px] text-gray-400">High urgency sales</p>
                    </button>

                    {/* Cyber Indigo */}
                    <button
                      type="button"
                      onClick={() => setBannerConfig({ ...bannerConfig, theme: 'cyber' })}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${bannerConfig.theme === 'cyber' ? 'ring-2 ring-indigo-500 border-transparent shadow-md' : 'border-gray-200 dark:border-white/10 hover:border-gray-300'}`}
                    >
                      <div className="h-4 w-full rounded-lg bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 mb-2"></div>
                      <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center justify-between">
                        <span>⚡ Cyber Indigo</span>
                        {bannerConfig.theme === 'cyber' && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                      </div>
                      <p className="text-[10px] text-gray-400">Tech & product releases</p>
                    </button>

                    {/* Emerald Luxe */}
                    <button
                      type="button"
                      onClick={() => setBannerConfig({ ...bannerConfig, theme: 'emerald' })}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${bannerConfig.theme === 'emerald' ? 'ring-2 ring-emerald-500 border-transparent shadow-md' : 'border-gray-200 dark:border-white/10 hover:border-gray-300'}`}
                    >
                      <div className="h-4 w-full rounded-lg bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 mb-2"></div>
                      <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center justify-between">
                        <span>💎 Emerald Luxe</span>
                        {bannerConfig.theme === 'emerald' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                      <p className="text-[10px] text-gray-400">VIP perks & rewards</p>
                    </button>

                    {/* Sunset Glow */}
                    <button
                      type="button"
                      onClick={() => setBannerConfig({ ...bannerConfig, theme: 'sunset' })}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${bannerConfig.theme === 'sunset' ? 'ring-2 ring-rose-500 border-transparent shadow-md' : 'border-gray-200 dark:border-white/10 hover:border-gray-300'}`}
                    >
                      <div className="h-4 w-full rounded-lg bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 mb-2"></div>
                      <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center justify-between">
                        <span>🌅 Sunset Glow</span>
                        {bannerConfig.theme === 'sunset' && <Check className="w-3.5 h-3.5 text-rose-500" />}
                      </div>
                      <p className="text-[10px] text-gray-400">Warm seasonal promos</p>
                    </button>
                  </div>

                  {/* Dismissible Toggle */}
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={bannerConfig.is_dismissible}
                      onChange={e => setBannerConfig({ ...bannerConfig, is_dismissible: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Allow visitors to close banner with (✕) for their session</span>
                  </label>
                </div>

              </div>

              {/* Bottom Submit Action */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={fetchBannerSettings}
                  className="px-5 py-3 rounded-xl font-bold text-sm bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Discard Changes
                </button>

                <button
                  type="submit"
                  disabled={bannerSaving}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-600 hover:to-red-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {bannerSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving Settings...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Save & Activate Live Banner</>
                  )}
                </button>
              </div>
            </form>

          </div>
        )}

        {/* ══════════════════════════════════════════════
            6. CUSTOMER MANAGEMENT CRM TAB
        ══════════════════════════════════════════════ */}
        {activeTab === 'customers' && (
          <div className="max-w-6xl mx-auto animate-fade-in-up space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    Customer Intelligence & CRM
                  </span>
                  <span className="text-xs text-gray-400">Total: {customers.length} registered accounts</span>
                </div>
                <h1 className="text-3xl font-black mt-2">Customer Management CRM</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Track buyer profiles, ranking tiers, lifetime revenue, and grant complimentary template licenses in 1-click.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setGrantForm({ user_id: '', user_email: '', template_id: '', note: '' });
                    setGrantingCustomer(null);
                    setIsGrantAccessOpen(true);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Gift className="w-4 h-4" /> Grant Template Access
                </button>
              </div>
            </div>

            {/* 4 Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Registered</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black mt-3">{customerStats.totalUsers || customers.length}</div>
                <div className="text-xs text-gray-500 mt-1">
                  all customer profiles
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">VIP Customers</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Crown className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black mt-3 text-amber-600 dark:text-amber-400">
                  {customers.filter(c => c.tier.includes('VIP')).length}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Platinum & Gold spenders
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Paying Buyers</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black mt-3 text-emerald-600 dark:text-emerald-400">
                  {customers.filter(c => c.total_purchases > 0).length}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {customers.length > 0 ? `${Math.round((customers.filter(c => c.total_purchases > 0).length / customers.length) * 100)}% conversion rate` : '100% conversion'}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Average Buyer LTV</span>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black mt-3 text-purple-600 dark:text-purple-400">
                  {formatPrice(convertPrice(customerStats.averageLtv || 0))}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  lifetime revenue per paying user
                </div>
              </div>
            </div>

            {/* Customers Filter & Table */}
            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    placeholder="Search by customer name, email, or item..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'vip', label: '👑 VIPs' },
                    { id: 'buyers', label: '🛍️ Buyers' },
                    { id: 'leads', label: '👤 Leads' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setCustomerTierFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        customerTierFilter === tab.id
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/10 text-xs uppercase font-bold text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Customer Details</th>
                      <th className="px-6 py-4">VIP Loyalty Tier</th>
                      <th className="px-6 py-4">Templates Owned</th>
                      <th className="px-6 py-4">Lifetime Spent</th>
                      <th className="px-6 py-4">Signup Date</th>
                      <th className="px-6 py-4 text-right">CRM Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {customers
                      .filter(c => {
                        const matchesSearch = c.name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                          c.email?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                          c.purchased_templates?.some(t => t.title?.toLowerCase().includes(customerSearchQuery.toLowerCase()));
                        
                        if (!matchesSearch) return false;

                        if (customerTierFilter === 'vip') return c.tier?.includes('VIP');
                        if (customerTierFilter === 'buyers') return c.total_purchases > 0;
                        if (customerTierFilter === 'leads') return c.total_purchases === 0;
                        return true;
                      })
                      .map((c) => {
                        const tierBadgeClasses = {
                          'Platinum VIP': 'bg-gradient-to-r from-purple-500/15 to-indigo-500/15 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
                          'Gold VIP': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
                          'Silver Buyer': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
                          'Member': 'bg-gray-100 dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/10'
                        };

                        const tierIcon = {
                          'Platinum VIP': <Crown className="w-3.5 h-3.5 text-purple-500 inline mr-1" />,
                          'Gold VIP': <Crown className="w-3.5 h-3.5 text-amber-500 inline mr-1" />,
                          'Silver Buyer': <Award className="w-3.5 h-3.5 text-emerald-500 inline mr-1" />,
                          'Member': <UserCheck className="w-3.5 h-3.5 text-gray-400 inline mr-1" />
                        };

                        return (
                          <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            {/* Customer details */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                                    {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  {c.rank <= 3 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                                      {c.rank}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-sm text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                                    <span>{c.name}</span>
                                    {c.rank === 1 && <span className="text-amber-500 text-xs" title="Top Customer #1">👑</span>}
                                  </div>
                                  <div className="text-xs text-gray-400 truncate">{c.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* Tier Badge */}
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center ${tierBadgeClasses[c.tier] || tierBadgeClasses['Member']}`}>
                                {tierIcon[c.tier]}
                                {c.tier}
                              </span>
                            </td>

                            {/* Purchases */}
                            <td className="px-6 py-4">
                              {c.total_purchases > 0 ? (
                                <button
                                  onClick={() => setSelectedCustomerProfile(c)}
                                  className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg border border-indigo-200 dark:border-indigo-500/20 transition-colors cursor-pointer"
                                >
                                  📦 {c.total_purchases} {c.total_purchases === 1 ? 'Template' : 'Templates'}
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400 italic">No purchases yet</span>
                              )}
                            </td>

                            {/* Lifetime Spent */}
                            <td className="px-6 py-4">
                              <span className="font-black text-sm text-gray-900 dark:text-white">
                                {formatPrice(convertPrice(c.total_spent))}
                              </span>
                            </td>

                            {/* Signup Date */}
                            <td className="px-6 py-4 text-xs text-gray-500">
                              {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedCustomerProfile(c)}
                                  className="px-2.5 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-black dark:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  title="View Customer Profile & History"
                                >
                                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>Profile</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setGrantingCustomer(c);
                                    setGrantForm({
                                      user_id: c.id,
                                      user_email: c.email,
                                      template_id: '',
                                      note: `Special VIP license granted for ${c.name}`
                                    });
                                    setIsGrantAccessOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Grant Free License"
                                >
                                  <Gift className="w-3.5 h-3.5" />
                                  <span>Gift</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setDirectEmailForm({
                                      user_email: c.email,
                                      subject: `Exclusive Special Update for ${c.name}`,
                                      message: `Hi ${c.name},\n\nThank you for being a valued creator on Bizleap Marketplace!`
                                    });
                                    setDirectEmailModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer"
                                  title="Send Direct Email Message"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => setUserToDelete({
                                    id: c.id,
                                    name: c.name,
                                    email: c.email,
                                    totalPurchases: c.total_purchases
                                  })}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                                  title="Permanently Delete / Ban User Account"
                                >
                                  <UserX className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                    {customers.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-16 text-center text-gray-500">
                          <Users className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                          <p className="font-bold">No customers registered yet.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Coupon Modal ── */}
      {isCreateCouponOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setIsCreateCouponOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xl bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-500" />
                <h3 className="font-black text-lg">Create New Promo Code</h3>
              </div>
              <button onClick={() => setIsCreateCouponOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. LAUNCH50, SUMMER20"
                  className={inputCls}
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Discount Type *
                  </label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                    className={inputCls}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    {couponForm.discount_type === 'percentage' ? 'Percentage (1 - 100%) *' : 'Flat Discount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={couponForm.discount_type === 'percentage' ? '100' : '100000'}
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                    placeholder={couponForm.discount_type === 'percentage' ? '20' : '500'}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Min Order & Usage Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.min_order_amount}
                    onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: e.target.value })}
                    placeholder="e.g. 1000 (0 for no min)"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Max Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={couponForm.usage_limit}
                    onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })}
                    placeholder="e.g. 50 (empty for unlimited)"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={couponForm.expires_at}
                  onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                  className={inputCls}
                />
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500">Live Customer Preview</span>
                  <div className="font-mono font-black text-base text-indigo-600 dark:text-indigo-400">
                    {couponForm.code || 'COUPON_CODE'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-gray-900 dark:text-white">
                    {couponForm.discount_value ? (
                      couponForm.discount_type === 'percentage' ? `${couponForm.discount_value}% OFF` : `₹${couponForm.discount_value} FLAT OFF`
                    ) : 'Discount Value'}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {couponForm.min_order_amount ? `Min cart: ₹${couponForm.min_order_amount}` : 'No minimum order'}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateCouponOpen(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 rounded-xl font-bold transition-colors cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={couponSubmitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {couponSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{couponSubmitting ? 'Creating...' : 'Create Promo Code'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Create Promotional Campaign Modal ── */}
      {isCreateCampaignOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" onClick={() => setIsCreateCampaignOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-5xl bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col h-[90vh] max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900 dark:text-white">Create Promotional Campaign</h3>
                  <p className="text-xs text-gray-500">Design, preview, and blast email broadcasts to your buyers in real-time.</p>
                </div>
              </div>
              <button onClick={() => setIsCreateCampaignOpen(false)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - 2 Columns */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:border-white/10 overflow-y-auto lg:overflow-hidden">
              {/* Form Controls Column (7 cols) */}
              <div className="lg:col-span-7 p-6 space-y-5 lg:overflow-y-auto lg:h-full">
                {/* Presets Strip */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                    ⚡ Quick Campaign Presets
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'launch', label: '🚀 Launch', desc: 'New Template' },
                      { id: 'sale', label: '🔥 Sale', desc: '50% Discount' },
                      { id: 'announcement', label: '📢 Update', desc: 'Platform News' },
                      { id: 'vip', label: '🎁 VIP Perk', desc: 'Special Offer' }
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyCampaignPreset(p.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          campaignForm.type === p.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold shadow-sm'
                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <div className="text-xs font-bold">{p.label}</div>
                        <div className="text-[10px] opacity-75">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campaign Name & Target Audience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Campaign Label (Internal) *
                    </label>
                    <input
                      type="text"
                      required
                      value={campaignForm.name}
                      onChange={e => setCampaignForm({ ...campaignForm, name: e.target.value })}
                      placeholder="e.g. Summer Flash Sale 2026"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Target Audience *
                    </label>
                    <select
                      value={campaignForm.audience_type}
                      onChange={e => setCampaignForm({ ...campaignForm, audience_type: e.target.value })}
                      className={inputCls}
                    >
                      <option value="all">👥 All Registered Users ({campaignAudienceStats.totalUsers || 150})</option>
                      <option value="template_buyers">📦 Buyers of Attached Template Only</option>
                      <option value="test">🧪 Test Send Only (Preview Mode)</option>
                    </select>
                  </div>
                </div>

                {campaignForm.audience_type === 'test' && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                    <label className="block text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                      Test Recipient Email Address:
                    </label>
                    <input
                      type="email"
                      value={campaignForm.test_email}
                      onChange={e => setCampaignForm({ ...campaignForm, test_email: e.target.value })}
                      placeholder="e.g. yourname@gmail.com"
                      className={inputCls}
                    />
                  </div>
                )}

                {/* Email Subject Line */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Email Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    value={campaignForm.subject}
                    onChange={e => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                    placeholder="e.g. 🔥 50% OFF All Next.js & React Templates — 48 Hours Only!"
                    className={inputCls}
                  />
                </div>

                {/* Headline Banner */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Email Hero Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={campaignForm.headline}
                    onChange={e => setCampaignForm({ ...campaignForm, headline: e.target.value })}
                    placeholder="e.g. Big Summer Sale Is Live! 🚀"
                    className={inputCls}
                  />
                </div>

                {/* Body Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Body Message & Bullet Highlights *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={campaignForm.body_text}
                    onChange={e => setCampaignForm({ ...campaignForm, body_text: e.target.value })}
                    placeholder="• Save 50% on every single template in the store&#10;• Instant source code download & lifetime updates included&#10;• Commercial license granted for unlimited projects"
                    className={`${inputCls} font-mono text-xs leading-relaxed`}
                  />
                </div>

                {/* Attach Template & Attach Promo Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Attach Featured Template (Optional)
                    </label>
                    <select
                      value={campaignForm.template_id}
                      onChange={e => {
                        const tId = e.target.value;
                        const tObj = templates.find(t => String(t.id) === String(tId));
                        setCampaignForm({
                          ...campaignForm,
                          template_id: tId,
                          button_text: tObj ? `Explore ${tObj.title} →` : campaignForm.button_text,
                          button_url: tObj ? `/preview/${tObj.id}` : '/explore'
                        });
                      }}
                      className={inputCls}
                    >
                      <option value="">None (General Broadcast)</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Attach Promo Coupon (Optional)
                    </label>
                    <select
                      value={campaignForm.coupon_code}
                      onChange={e => setCampaignForm({ ...campaignForm, coupon_code: e.target.value })}
                      className={inputCls}
                    >
                      <option value="">No Coupon Attached</option>
                      {coupons.filter(c => c.is_active).map(c => (
                        <option key={c.id} value={c.code}>
                          {c.code} ({c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} FLAT`})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CTA Button Text & Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Primary Button Text
                    </label>
                    <input
                      type="text"
                      value={campaignForm.button_text}
                      onChange={e => setCampaignForm({ ...campaignForm, button_text: e.target.value })}
                      placeholder="e.g. Claim 50% OFF Now →"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Button Target URL
                    </label>
                    <input
                      type="text"
                      value={campaignForm.button_url}
                      onChange={e => setCampaignForm({ ...campaignForm, button_url: e.target.value })}
                      placeholder="/explore"
                      className={inputCls}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      ✨ <strong>Smart Auto-Domain:</strong> Use <code className="text-indigo-500">/explore</code> or <code className="text-indigo-500">/preview/:id</code>. Auto-resolves to your live domain on production.
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Responsive Email Preview Column (5 cols) */}
              <div className="lg:col-span-5 p-6 bg-gray-100 dark:bg-black/50 lg:overflow-y-auto lg:h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-500" />
                    <span className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Real-Time Email Preview
                    </span>
                  </div>
                  <div className="flex items-center bg-gray-200 dark:bg-white/10 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setCampaignPreviewDevice('desktop')}
                      className={`p-1 rounded transition-colors ${campaignPreviewDevice === 'desktop' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-gray-500'}`}
                      title="Desktop Preview"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCampaignPreviewDevice('mobile')}
                      className={`p-1 rounded transition-colors ${campaignPreviewDevice === 'mobile' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-gray-500'}`}
                      title="Mobile Preview"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Email Mock Container */}
                <div className={`mx-auto w-full transition-all duration-300 ${campaignPreviewDevice === 'mobile' ? 'max-w-[320px]' : 'max-w-full'}`}>
                  <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-gray-200 overflow-hidden text-left font-sans">
                    {/* Clean White Email Header */}
                    <div className="bg-white p-6 border-b border-gray-100 text-slate-900">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-lg tracking-tight text-indigo-600">BIZLEAP</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Marketplace</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          campaignForm.type === 'sale' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          campaignForm.type === 'vip' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          campaignForm.type === 'update' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {campaignForm.type === 'launch' ? '🚀 Launch' :
                           campaignForm.type === 'sale' ? '🔥 50% Sale' :
                           campaignForm.type === 'vip' ? '🎁 VIP Offer' :
                           '📢 Update'}
                        </span>
                      </div>
                      <h4 className="font-black text-lg text-slate-900 mt-4 leading-snug">
                        {campaignForm.headline || 'Your Headline Appears Here'}
                      </h4>
                    </div>

                    {/* Coupon Strip */}
                    {campaignForm.coupon_code && (
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-center text-white text-xs font-black">
                        🏷️ USE CODE: <span className="bg-white text-amber-800 px-2 py-0.5 rounded font-mono ml-1">{campaignForm.coupon_code}</span>
                      </div>
                    )}

                    {/* Body */}
                    <div className="p-5 text-xs text-slate-700 space-y-2 leading-relaxed">
                      {campaignForm.body_text ? (
                        campaignForm.body_text.split('\n').filter(Boolean).map((line, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            {line.startsWith('•') || line.startsWith('-') ? (
                              <>
                                <span className="text-indigo-600 font-bold">•</span>
                                <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                              </>
                            ) : (
                              <p className="mb-1">{line}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 italic">Campaign bullet highlights will be rendered here...</p>
                      )}

                      {/* Attached Template Preview */}
                      {campaignForm.template_id && (
                        <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                          {templates.find(t => String(t.id) === String(campaignForm.template_id))?.image && (
                            <img
                              src={templates.find(t => String(t.id) === String(campaignForm.template_id))?.image}
                              alt="Template"
                              className="w-12 h-10 object-cover rounded-lg"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs truncate text-slate-900">
                              {templates.find(t => String(t.id) === String(campaignForm.template_id))?.title || 'Featured Template'}
                            </div>
                            <div className="text-[10px] text-slate-500">Commercial License Included</div>
                          </div>
                        </div>
                      )}

                      {/* CTA Button Preview */}
                      <div className="pt-3 text-center">
                        <div className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-black rounded-xl text-xs shadow-md shadow-indigo-500/30">
                          {campaignForm.button_text || 'Explore Marketplace →'}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 border-t border-slate-100 p-3 text-center text-[10px] text-slate-400">
                      © {new Date().getFullYear()} Bizleap Marketplace Inc.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02] shrink-0">
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>
                  {campaignForm.audience_type === 'test'
                    ? `Ready to test send to ${campaignForm.test_email || 'admin'}`
                    : `Ready to blast to ${campaignAudienceStats.totalUsers || 150} verified recipients`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateCampaignOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendCampaign}
                  disabled={campaignSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {campaignSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Broadcast...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        {campaignForm.audience_type === 'test' ? 'Send Test Email' : `🚀 Send Broadcast to Audience`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Campaign Email Inspector Modal ── */}
      {previewingCampaignEmail && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setPreviewingCampaignEmail(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-gray-900 dark:text-white">{previewingCampaignEmail.name}</h3>
                <p className="text-xs text-gray-500">Subject: {previewingCampaignEmail.subject}</p>
              </div>
              <button onClick={() => setPreviewingCampaignEmail(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                  <span className="text-gray-400 block mb-1">Delivered To</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{previewingCampaignEmail.sent_count || previewingCampaignEmail.recipients_count || 0} Recipients</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                  <span className="text-gray-400 block mb-1">Campaign Type</span>
                  <span className="font-bold uppercase">{previewingCampaignEmail.type}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                  <span className="text-gray-400 block mb-1">Promo Code</span>
                  <span className="font-mono font-bold">{previewingCampaignEmail.coupon_code || 'None'}</span>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-5 bg-white text-slate-900 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-black text-base text-slate-900">{previewingCampaignEmail.headline}</h4>
                <div className="text-xs leading-relaxed space-y-1 text-slate-700 font-mono whitespace-pre-line">
                  {previewingCampaignEmail.body_text}
                </div>
                {previewingCampaignEmail.button_text && (
                  <div className="pt-2">
                    <span className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">
                      {previewingCampaignEmail.button_text}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 flex justify-end">
              <button
                onClick={() => setPreviewingCampaignEmail(null)}
                className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Order Inspector Modal ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xl bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-500" />
                <h3 className="font-black text-lg">Purchase Details</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Buyer Info Card */}
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Customer Profile</span>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-base">
                    {selectedOrder.customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-base">{selectedOrder.customer.name}</div>
                    <div className="text-xs text-gray-500 font-mono">User ID: {selectedOrder.customer.id}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Contact Email:</span>
                  <a href={`mailto:${selectedOrder.customer.email}`} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    {selectedOrder.customer.email}
                  </a>
                </div>
              </div>

              {/* Template Info Card */}
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Purchased Product</span>
                <div className="flex items-center gap-3 mt-2">
                  {selectedOrder.template.image && (
                    <img src={selectedOrder.template.image} alt={selectedOrder.template.title} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <div className="font-bold text-base">{selectedOrder.template.title}</div>
                    <span className="inline-block px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded mt-1">
                      {selectedOrder.template.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                  <span className="text-gray-500 block mb-1">Razorpay Payment ID</span>
                  <span className="font-mono font-bold">{selectedOrder.paymentId}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                  <span className="text-gray-500 block mb-1">Total Amount Paid</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{formatPrice(selectedOrder.amount)}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                  <span className="text-gray-500 block mb-1">Transaction Date</span>
                  <span className="font-bold">{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                  <span className="text-gray-500 block mb-1">Verification Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Paid & Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Template Modal ── */}
      {editingTemplate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setEditingTemplate(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 px-8 py-5 flex items-center justify-between z-10">
              <h2 className="text-xl font-black">Edit Template</h2>
              <button onClick={() => setEditingTemplate(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-5">
              {/* Preview */}
              {editForm.image && (
                <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-2">Title</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className={inputCls} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Description</label>
                <textarea rows="3" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className={inputCls}></textarea>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold mb-2">Price (₹)</label>
                  <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Category</label>
                  <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className={inputCls}>
                    <option value="React">React</option>
                    <option value="Vue">Vue</option>
                    <option value="Next.js">Next.js</option>
                    <option value="Svelte">Svelte</option>
                    <option value="HTML">HTML</option>
                    <option value="Tailwind">Tailwind</option>
                    <option value="Webflow">Webflow</option>
                    <option value="Framer">Framer</option>
                    <option value="Figma">Figma</option>
                    <option value="React Native">React Native</option>
                    <option value="Shopify">Shopify</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold mb-2">Tag</label>
                  <input type="text" value={editForm.tag} onChange={e => setEditForm({ ...editForm, tag: e.target.value })} className={inputCls} placeholder="e.g. SaaS, Dashboard" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Keywords (comma separated)</label>
                  <input type="text" value={editForm.keywords} onChange={e => setEditForm({ ...editForm, keywords: e.target.value })} className={inputCls} placeholder="react, admin, dark" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Cover Image</label>
                {editForm.image ? (
                  <div className="p-3 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={editForm.image}
                        alt="Cover Preview"
                        className="w-16 h-12 object-cover rounded-lg border border-gray-200 dark:border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate text-gray-900 dark:text-white">Active Cover Image</div>
                        <div className="text-[10px] text-gray-400 truncate">{editForm.image}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <label className="px-3 py-1.5 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => e.target.files?.[0] && handleImageFileUpload(e.target.files[0], 'edit')}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, image: '' }))}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove Image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-gray-200 dark:border-white/15 hover:border-indigo-500 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-gray-50/50 dark:bg-white/[0.02] hover:bg-indigo-50/20 transition-all text-center">
                      {isEditUploadingImage ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                          <span className="text-xs font-bold text-gray-500">Uploading new image...</span>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-5 h-5 text-indigo-500" />
                          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Click to upload replacement image</div>
                          <p className="text-[10px] text-gray-400">PNG, JPG, WebP, SVG up to 10MB</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isEditUploadingImage}
                        onChange={e => e.target.files?.[0] && handleImageFileUpload(e.target.files[0], 'edit')}
                      />
                    </label>
                    <input
                      type="url"
                      value={editForm.image || ''}
                      onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                      className={inputCls}
                      placeholder="Or paste external image URL (https://...)"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editLoading}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20"
                >
                  {editLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 1-Click Update Broadcast Modal ── */}
      {broadcastModalOpen && broadcastTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-xl">1-Click Update Broadcast</h3>
                  <p className="text-purple-100 text-xs mt-0.5">Email instant update notification & ZIP download link to all previous buyers.</p>
                </div>
              </div>
              <button
                onClick={() => setBroadcastModalOpen(false)}
                className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Selected Template Preview */}
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 flex items-center gap-3">
                {broadcastTemplate.image ? (
                  <img src={broadcastTemplate.image} alt={broadcastTemplate.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm truncate">{broadcastTemplate.title}</h4>
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded">
                      {broadcastTemplate.category}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Current Version: <span className="font-mono font-bold text-gray-600 dark:text-gray-300">{broadcastTemplate.version || 'v1.0'}</span>
                  </div>
                </div>
              </div>

              {/* Target Audience Count */}
              <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
                  <Users className="w-4 h-4" />
                  <span>Target Recipients:</span>
                </div>
                {broadcastFetchingBuyers ? (
                  <span className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Counting verified buyers...
                  </span>
                ) : (
                  <span className="text-xs font-black px-2.5 py-1 bg-purple-600 text-white rounded-lg">
                    {broadcastBuyers.length} Verified Buyer{broadcastBuyers.length === 1 ? '' : 's'}
                  </span>
                )}
              </div>

              {/* New Version Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  New Release Version Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={broadcastVersion}
                    onChange={e => setBroadcastVersion(e.target.value)}
                    placeholder="e.g. v2.0.0 or v1.5.0"
                    className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Changelog / Release Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Release Changelog / What's New <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={broadcastChangelog}
                  onChange={e => setBroadcastChangelog(e.target.value)}
                  placeholder="• Fixed mobile responsive navbar&#10;• Added Dark Mode theme switch&#10;• Upgraded packages to latest LTS"
                  className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed font-mono"
                />
                <p className="text-[11px] text-gray-400 mt-1">Each line starting with bullet (• or -) will be formatted into a clean card inside the email.</p>
              </div>

              {/* Guarantee Notice */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  All existing buyers will receive an official branded email with the update changelog and a direct 1-click download link from their Bizleap dashboard.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setBroadcastModalOpen(false)}
                className="px-4 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 rounded-xl font-bold text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={broadcastLoading || !broadcastVersion.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {broadcastLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Broadcasting Emails...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Update Broadcast ({broadcastBuyers.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Customer Profile & Purchase History Modal ── */}
      {selectedCustomerProfile && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setSelectedCustomerProfile(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-white/10 p-6 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {selectedCustomerProfile.name ? selectedCustomerProfile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-gray-900 dark:text-white">
                      {selectedCustomerProfile.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                      {selectedCustomerProfile.tier}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{selectedCustomerProfile.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerProfile(null)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-white/5 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] shrink-0 text-center py-3">
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-400">Total Spent</div>
                <div className="font-black text-base text-emerald-600 dark:text-emerald-400">
                  {formatPrice(convertPrice(selectedCustomerProfile.total_spent))}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-400">Templates Owned</div>
                <div className="font-black text-base text-indigo-600 dark:text-indigo-400">
                  {selectedCustomerProfile.total_purchases}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-400">Customer Rank</div>
                <div className="font-black text-base text-amber-600 dark:text-amber-400">
                  #{selectedCustomerProfile.rank || 1}
                </div>
              </div>
            </div>

            {/* Owned Templates & History */}
            <div className="p-6 overflow-y-auto space-y-4 min-h-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">
                  Owned Licenses & Purchases ({selectedCustomerProfile.purchased_templates?.length || 0})
                </h4>
                <button
                  onClick={() => {
                    setGrantingCustomer(selectedCustomerProfile);
                    setGrantForm({
                      user_id: selectedCustomerProfile.id,
                      user_email: selectedCustomerProfile.email,
                      template_id: '',
                      note: `VIP Gift granted for ${selectedCustomerProfile.name}`
                    });
                    setIsGrantAccessOpen(true);
                  }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5" /> + Grant Free Template
                </button>
              </div>

              {selectedCustomerProfile.purchased_templates?.length > 0 ? (
                <div className="space-y-3">
                  {selectedCustomerProfile.purchased_templates.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-12 h-10 object-cover rounded-lg shrink-0 border border-gray-200 dark:border-white/10" />
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-indigo-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.title}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded">{item.payment_id}</span>
                            <span>&bull;</span>
                            <span>{new Date(item.purchased_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-sm text-gray-900 dark:text-white">
                          {item.price > 0 ? formatPrice(convertPrice(item.price)) : <span className="text-emerald-500 font-bold text-xs">FREE GIFT</span>}
                        </span>
                        <button
                          onClick={() => setRevokeTarget({
                            purchaseId: item.purchase_id,
                            userId: selectedCustomerProfile.id,
                            templateId: item.id,
                            title: item.title,
                            customerName: selectedCustomerProfile.name
                          })}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Revoke License"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400 text-xs italic bg-gray-50/50 dark:bg-white/[0.01] rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                  This user hasn't made any template purchases yet.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02] shrink-0">
              <button
                onClick={() => setUserToDelete({
                  id: selectedCustomerProfile.id,
                  name: selectedCustomerProfile.name,
                  email: selectedCustomerProfile.email,
                  totalPurchases: selectedCustomerProfile.total_purchases
                })}
                className="px-3 py-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-red-200 dark:border-red-500/20"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  Registered: {new Date(selectedCustomerProfile.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setSelectedCustomerProfile(null)}
                  className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Grant Custom Template Access / Gift Modal ── */}
      {isGrantAccessOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setIsGrantAccessOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-500" />
                <h3 className="font-black text-lg">Grant Complimentary License</h3>
              </div>
              <button onClick={() => setIsGrantAccessOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGrantAccess} className="p-6 space-y-4">
              {/* Customer Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Select Customer Account *
                </label>
                {grantingCustomer ? (
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-gray-900 dark:text-white">{grantingCustomer.name}</div>
                      <div className="text-xs text-gray-400">{grantingCustomer.email}</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {grantingCustomer.tier}
                    </span>
                  </div>
                ) : (
                  <select
                    value={grantForm.user_id}
                    onChange={(e) => {
                      const cust = customers.find(c => c.id === e.target.value);
                      setGrantForm({
                        ...grantForm,
                        user_id: e.target.value,
                        user_email: cust?.email || ''
                      });
                    }}
                    required
                    className={inputCls}
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email}) — {c.tier}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Template Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Choose Template to Gift *
                </label>
                <select
                  value={grantForm.template_id}
                  onChange={(e) => setGrantForm({ ...grantForm, template_id: e.target.value })}
                  required
                  className={inputCls}
                >
                  <option value="">-- Select Template --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.category || 'Digital Asset'}) — {t.price || '₹0'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Admin Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Optional Gift Note / Reason
                </label>
                <input
                  type="text"
                  value={grantForm.note}
                  onChange={(e) => setGrantForm({ ...grantForm, note: e.target.value })}
                  placeholder="e.g. Complimentary gift for participating in beta test"
                  className={inputCls}
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  This immediately activates full source code download access for the customer on their dashboard and sends an official gift email alert.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGrantAccessOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grantSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {grantSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5" />}
                  <span>{grantSubmitting ? 'Granting Access...' : 'Confirm & Grant Access'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Direct Customer Email Modal ── */}
      {directEmailModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setDirectEmailModalOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-500" />
                <h3 className="font-black text-lg">Send Direct Message</h3>
              </div>
              <button onClick={() => setDirectEmailModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendDirectEmail} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Recipient Email *</label>
                <input
                  type="email"
                  value={directEmailForm.user_email}
                  onChange={(e) => setDirectEmailForm({ ...directEmailForm, user_email: e.target.value })}
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Subject *</label>
                <input
                  type="text"
                  value={directEmailForm.subject}
                  onChange={(e) => setDirectEmailForm({ ...directEmailForm, subject: e.target.value })}
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Message *</label>
                <textarea
                  value={directEmailForm.message}
                  onChange={(e) => setDirectEmailForm({ ...directEmailForm, message: e.target.value })}
                  rows={5}
                  required
                  className={inputCls}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDirectEmailModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={directEmailSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {directEmailSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{directEmailSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTemplateId}
        onClose={() => setDeleteTemplateId(null)}
        onConfirm={confirmDeleteTemplate}
        title="Delete Template"
        message="Are you sure you want to delete this template completely? This will remove the original code, preview files, and database records forever."
        confirmText="Delete Forever"
      />

      {/* Revoke License Confirmation Modal */}
      <ConfirmModal
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => handleRevokeAccess(revokeTarget)}
        title="Revoke Template License"
        message={`Are you sure you want to permanently revoke access to "${revokeTarget?.title}" for ${revokeTarget?.customerName || 'this customer'}? The user will immediately lose access and will no longer be able to download the source code.`}
        confirmText="Revoke License"
      />

      {/* Delete User Account Confirmation Modal */}
      <ConfirmModal
        open={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => handleDeleteUserAccount(userToDelete)}
        title="⚠️ Delete User Account"
        message={`Are you sure you want to permanently delete the account for "${userToDelete?.name}" (${userToDelete?.email})? This will wipe their credentials, terminate all active sessions, and remove all ${userToDelete?.totalPurchases || 0} purchased licenses immediately.`}
        confirmText="Delete Account"
      />

      {/* ── Live Preview Modal (Reusing existing architecture) ── */}
      <LivePreviewModal
        isOpen={!!modalPreviewTemplate}
        onClose={() => setModalPreviewTemplate(null)}
        template={modalPreviewTemplate}
      />
    </div>
  );
}
