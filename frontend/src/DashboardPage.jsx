import React, { useEffect, useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, DollarSign, Activity, CreditCard, ArrowUpRight, ArrowDownRight, Package, BarChart3, Bell, MoreHorizontal, Download, ChevronDown, FileText, FileSpreadsheet, Loader2, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import UserMenu from './UserMenu';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { useTemplates } from './useTemplates';
import { useCurrency } from './CurrencyContext';
import { Logo } from './components/ui/Logo';
import { api } from './lib/api';

// Data initialized from actual fetching
const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981'];

export default function DashboardPage() {
  const { theme } = useTheme();
  const { isAdmin } = useAuth();
  const { templates: marketplaceTemplates } = useTemplates();
  const { formatPrice, currency, convertPrice } = useCurrency();
  const isDark = theme === 'dark';

  const [stats, setStats] = useState({
    revenue: 0,
    sales: 0,
    users: 0,
    templates: marketplaceTemplates.length
  });
  const [transactions, setTransactions] = useState([]);
  const [syncKey, setSyncKey] = useState(0);
  const [chartRevenueData, setChartRevenueData] = useState([]);
  const [chartCategoryData, setChartCategoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('Analytics');
  const [dateFilter, setDateFilter] = useState('all'); // '7days', '30days', 'all'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [downloadState, setDownloadState] = useState({ status: 'idle', type: null }); // idle, loading, success

  // Handle report download
  const handleDownload = (type) => {
    setDownloadState({ status: 'loading', type });
    setIsDownloadMenuOpen(false);
    
    // Simulate download delay
    setTimeout(() => {
      setDownloadState({ status: 'success', type });
      
      if (type === 'csv') {
        const element = document.createElement("a");
        let content = "Date,Description,Amount,Status\n";
        transactions.forEach(t => {
          content += `"${t.date}","${t.template}","${t.amount}","${t.status}"\n`;
        });
        
        let filename = "dashboard_report.csv";
        const file = new Blob([content], {type: 'text/csv'});
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } else if (type === 'pdf') {
        const doc = new jsPDF();
        
        // Add header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("Dashboard Analytics Report", 20, 30);
        
        // Add generated date
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 40);
        
        // Add summary line
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 45, 190, 45);
        
        // Add Summary Stats
        doc.setFontSize(16);
        doc.setTextColor(60, 60, 60);
        doc.text("Executive Summary", 20, 60);
        
        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        doc.text(`Gross Revenue: ${currency} ${convertPrice ? convertPrice(stats.revenue).toLocaleString() : stats.revenue.toLocaleString()}`, 20, 75);
        doc.text(`Total Sales: ${stats.sales}`, 20, 85);
        doc.text(`Active Users: ${stats.users}`, 20, 95);
        doc.text(`Average Order Value: ${currency} ${convertPrice ? Math.round(convertPrice(stats.aov || 0)).toLocaleString() : Math.round(stats.aov || 0).toLocaleString()}`, 20, 105);
        
        // Add Transactions Table
        const tableColumn = ["Date", "Customer", "Product", "Amount", "Status"];
        const tableRows = [];

        transactions.forEach(t => {
          const rowData = [
            t.date,
            t.user,
            t.template,
            `${currency} ${convertPrice ? convertPrice(t.amount).toLocaleString() : t.amount.toLocaleString()}`,
            t.status
          ];
          tableRows.push(rowData);
        });

        autoTable(doc, {
          startY: 120,
          head: [tableColumn],
          body: tableRows,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] }, // Tailwind blue-500
          styles: { fontSize: 9 }
        });
        
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("BT Market Inc. - Confidential", 20, doc.internal.pageSize.height - 10);
        
        doc.save("dashboard_report.pdf");
      }
      
      // Reset state after showing success checkmark
      setTimeout(() => {
        setDownloadState({ status: 'idle', type: null });
      }, 2000);
    }, 1500);
  };


  useEffect(() => {
    let isMounted = true;
    if (!isAdmin) return;

    const loadData = async () => {
      try {
        let totalRevenue = 0;
        let formattedTransactions = [];
        let fetchedUsersCount = 0;

        // Fetch from authenticated Admin API backed by Neon
        try {
          const [ordersRes, statsRes] = await Promise.all([
            api.get('/api/admin/orders'),
            api.get('/api/admin/stats').catch(() => null)
          ]);

          if (statsRes?.totalUsers) {
            fetchedUsersCount = statsRes.totalUsers;
          }

          if (ordersRes && ordersRes.orders) {
            let filteredOrders = ordersRes.orders;
            if (dateFilter === '7days') {
              const d = new Date();
              d.setDate(d.getDate() - 7);
              filteredOrders = filteredOrders.filter(o => new Date(o.created_at) >= d);
            } else if (dateFilter === '30days') {
              const d = new Date();
              d.setDate(d.getDate() - 30);
              filteredOrders = filteredOrders.filter(o => new Date(o.created_at) >= d);
            }

            filteredOrders.forEach(o => {
              const orderAmount = parseFloat(o.template?.price || o.amount || 0);
              totalRevenue += orderAmount;
              formattedTransactions.push({
                id: o.paymentId || o.id,
                user: `${o.customer?.fullName || 'Customer'} (${o.customer?.email || 'N/A'})`,
                customerEmail: o.customer?.email,
                customerName: o.customer?.fullName,
                amount: orderAmount,
                status: o.status || 'Completed',
                date: new Date(o.created_at).toLocaleString(),
                template: o.template?.title || 'Template',
                avatar: (o.customer?.fullName || 'C').charAt(0).toUpperCase()
              });
            });
          }
        } catch (adminErr) {
          console.warn("Admin data fetch note:", adminErr.message);
        }

        if (!isMounted) return;

        setTransactions(formattedTransactions);

        const salesCount = formattedTransactions.length;
        setStats({
          revenue: totalRevenue,
          sales: salesCount,
          users: fetchedUsersCount,
          templates: marketplaceTemplates.length,
          aov: salesCount > 0 ? totalRevenue / salesCount : 0
        });
        
        // Calculate Real-Time Chart Data
        const last7Days = Array.from({length: 7}).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            dateObj: d,
            name: d.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: 0,
            visitors: 0
          };
        });

        const categoryMap = {};

        formattedTransactions.forEach(t => {
          // Revenue Chart aggregation
          const tDate = new Date(t.date);
          const dayMatch = last7Days.find(d => 
            d.dateObj.getDate() === tDate.getDate() && 
            d.dateObj.getMonth() === tDate.getMonth() &&
            d.dateObj.getFullYear() === tDate.getFullYear()
          );
          if (dayMatch) {
            dayMatch.revenue += t.amount;
          }

          // Category Pie Chart aggregation
          const tmpl = marketplaceTemplates.find(m => m.title === t.template);
          if (tmpl) {
            const cat = tmpl.tag;
            categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
          }
        });
        
        setChartRevenueData(last7Days);

        const newCategoryData = Object.entries(categoryMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 4); // Keep top 4 for pie chart

        setChartCategoryData(newCategoryData);
        setTransactions(formattedTransactions.slice(0, 10)); // Top 10 recent
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [isAdmin, dateFilter, marketplaceTemplates, syncKey]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!isAdmin) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans transition-colors duration-1000 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
        <div className="text-center flex flex-col items-center">
          <h1 className="text-4xl font-black mb-4">Access Denied</h1>
          <p className="text-gray-500 mb-8">You do not have permission to view the dashboard.</p>
          <Logo />
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-1000 relative overflow-hidden ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-gray-900'}`}>

      {/* Sidebar Navigation */}
      <aside className={`w-[260px] hidden lg:flex flex-col shrink-0 sticky top-0 h-screen transition-colors duration-1000 z-40 ${isDark ? 'bg-black/20 backdrop-blur-2xl border-r border-white/5' : 'bg-white/40 backdrop-blur-2xl border-r border-black/5'}`}>
        <div className="h-[80px] flex items-center px-8">
          <Logo />
        </div>
        <div className="flex-1 px-4 py-8 flex flex-col gap-1.5">
          <p className="px-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          <SidebarLink icon={<BarChart3 className="w-4 h-4" />} label="Analytics" active={activeTab === 'Analytics'} onClick={() => setActiveTab('Analytics')} isDark={isDark} />
          <SidebarLink icon={<CreditCard className="w-4 h-4" />} label="Transactions" active={activeTab === 'Transactions'} onClick={() => setActiveTab('Transactions')} isDark={isDark} />
          <SidebarLink icon={<Users className="w-4 h-4" />} label="Customers" active={activeTab === 'Customers'} onClick={() => setActiveTab('Customers')} isDark={isDark} />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        
        {/* Top Header */}
        <header className={`h-[80px] px-8 flex items-center justify-between sticky top-0 z-50 transition-colors duration-1000 ${isDark ? 'bg-[#050505]/60 backdrop-blur-xl border-b border-white/5' : 'bg-[#fafafa]/60 backdrop-blur-xl border-b border-black/5'}`}>
          <div className="flex items-center gap-4 flex-1">
            <Link to="/" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}>
              <ArrowLeft className="w-4 h-4" />
              Back to Store
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-sm font-bold">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              <span className="text-xs text-gray-500">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <button className={`p-2.5 rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <Bell className="w-5 h-5" />
            </button>
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                {activeTab === 'Analytics' && 'Analytics Dashboard'}
                {activeTab === 'Transactions' && 'Transactions History'}
                {activeTab === 'Customers' && 'Customer Directory'}
                {activeTab === 'Products' && 'Product Inventory'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                {activeTab === 'Analytics' ? 'Real-time metrics and platform analytics.' : `Manage and view your ${activeTab.toLowerCase()}.`}
              </p>
            </div>
            <div className="flex gap-3">
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl font-bold text-sm outline-none cursor-pointer text-gray-900 dark:text-white"
              >
                <option value="all" className="bg-white dark:bg-[#111] text-gray-900 dark:text-white">All Time</option>
                <option value="30days" className="bg-white dark:bg-[#111] text-gray-900 dark:text-white">Last 30 Days</option>
                <option value="7days" className="bg-white dark:bg-[#111] text-gray-900 dark:text-white">Last 7 Days</option>
              </select>
              <button 
                onClick={() => setSyncKey(k => k + 1)}
                className="px-5 py-2.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center gap-2"
              >
                {isLoading ? <Activity className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                {isLoading ? 'Syncing...' : 'Live Sync'}
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                  disabled={downloadState.status === 'loading'}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    downloadState.status === 'success' 
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25'
                  }`}
                >
                  {downloadState.status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : downloadState.status === 'success' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  
                  {downloadState.status === 'loading' 
                    ? 'Exporting...' 
                    : downloadState.status === 'success'
                      ? 'Exported!'
                      : 'Export Report'}
                  
                  {downloadState.status === 'idle' && (
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDownloadMenuOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Dropdown Menu */}
                {isDownloadMenuOpen && downloadState.status === 'idle' && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsDownloadMenuOpen(false)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl z-20 border overflow-hidden bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-white/10"
                    >
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Choose Format
                        </div>
                        <button 
                          onClick={() => handleDownload('pdf')}
                          className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center gap-3 group"
                        >
                          <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">PDF Document</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Detailed visual report</div>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleDownload('csv')}
                          className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center gap-3 group mt-1"
                        >
                          <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">CSV Spreadsheet</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Raw data for analysis</div>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>

          {activeTab === 'Analytics' && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10"
            >
              <PremiumStatCard 
                title="Gross Revenue" 
                value={formatPrice(stats.revenue)} 
                icon={<DollarSign className="w-6 h-6" />} 
                trend="+24.5%" 
                isPositive={true}
                color="blue"
                isDark={isDark} 
              />
              <PremiumStatCard 
                title="Total Sales" 
                value={stats.sales.toLocaleString()} 
                icon={<CreditCard className="w-6 h-6" />} 
                trend="+12.3%" 
                isPositive={true}
                color="purple"
                isDark={isDark} 
              />
              <PremiumStatCard 
                title="Active Users" 
                value={stats.users.toLocaleString()} 
                icon={<Users className="w-6 h-6" />} 
                trend="+5.2%" 
                isPositive={true}
                color="pink"
                isDark={isDark} 
              />
              <PremiumStatCard 
                title="Avg Order Value" 
                value={formatPrice(stats.aov || 0)} 
                icon={<CreditCard className="w-6 h-6" />} 
                trend="+8.1%" 
                isPositive={true}
                color="emerald"
                isDark={isDark} 
              />
            </motion.div>
          )}

          {/* Charts & Tables Section */}
          {activeTab === 'Analytics' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Main Chart */}
              <motion.div variants={itemVariants} className={`xl:col-span-2 p-8 rounded-3xl border transition-all duration-500 overflow-hidden relative ${isDark ? 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04]' : 'bg-white border-black/[0.05] shadow-sm hover:shadow-md hover:border-black/[0.1]'}`}>
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div>
                    <h3 className={`text-xl font-medium tracking-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Revenue Flow</h3>
                    <p className="text-[13px] font-medium text-gray-500">Visualizing income over the last 7 days.</p>
                  </div>
                  <select className={`rounded-xl px-4 py-2 text-sm font-semibold outline-none cursor-pointer transition-colors border ${isDark ? 'bg-[#111] border-white/10 text-white hover:bg-white/5' : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'}`}>
                    <option className="bg-white dark:bg-[#111] text-gray-900 dark:text-white">Last 7 Days</option>
                    <option className="bg-white dark:bg-[#111] text-gray-900 dark:text-white">This Month</option>
                    <option className="bg-white dark:bg-[#111] text-gray-900 dark:text-white">This Year</option>
                  </select>
                </div>
                <div className="h-[350px] relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartRevenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: isDark ? '#6b7280' : '#9ca3af', fontSize: 11, fontWeight: 600 }} 
                        dy={15}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: isDark ? '#6b7280' : '#9ca3af', fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(value) => formatPrice(value)}
                        dx={-15}
                      />
                      <Tooltip 
                        cursor={{ stroke: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', strokeWidth: 1 }}
                        contentStyle={{ 
                          backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)', 
                          backdropFilter: 'blur(16px)', 
                          borderRadius: '16px', 
                          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                          padding: '12px 16px'
                        }}
                        itemStyle={{ color: isDark ? '#fff' : '#000', fontSize: '13px', fontWeight: 700 }}
                        labelStyle={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}
                        formatter={(value, name) => {
                          if (name === 'revenue') return [formatPrice(value), 'Revenue'];
                          if (name === 'visitors') return [value.toLocaleString(), 'Visitors'];
                          return [value, name];
                        }}
                      />
                      <Area type="monotone" dataKey="visitors" stroke={isDark ? "#8b5cf6" : "#7c3aed"} strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisitors)" />
                      <Area type="monotone" dataKey="revenue" stroke={isDark ? "#3b82f6" : "#2563eb"} strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Side Content: Category Breakdown */}
              <div className="flex flex-col gap-8">
                <motion.div variants={itemVariants} className={`flex-1 flex flex-col p-8 rounded-3xl border transition-all duration-500 overflow-hidden relative ${isDark ? 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04]' : 'bg-white border-black/[0.05] shadow-sm hover:shadow-md hover:border-black/[0.1]'}`}>
                  <h3 className={`text-xl font-medium tracking-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sales by Category</h3>
                  <p className="text-[13px] font-medium text-gray-500 mb-6">Distribution of template types.</p>
                  {(() => {
                    const totalCategorySales = chartCategoryData.reduce((acc, curr) => acc + curr.value, 0);
                    return (
                      <>
                        <div className="flex-1 flex items-center justify-center relative z-10 min-h-[220px]">
                          {/* Centered Total */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Total Sales</span>
                            <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatPrice(totalCategorySales)}</span>
                          </div>
                          
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartCategoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={4}
                              >
                                {chartCategoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)', 
                                  backdropFilter: 'blur(16px)', 
                                  borderRadius: '16px', 
                                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                  padding: '12px 16px'
                                }}
                                itemStyle={{ color: isDark ? '#fff' : '#000', fontSize: '13px', fontWeight: 700 }}
                                formatter={(value, name) => {
                                  const percentage = totalCategorySales > 0 ? ((value / totalCategorySales) * 100).toFixed(1) : 0;
                                  return [`${formatPrice(value)} (${percentage}%)`, name];
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-5 gap-x-2 mt-8">
                          {chartCategoryData.map((category, index) => {
                            const percentage = totalCategorySales > 0 ? Math.round((category.value / totalCategorySales) * 100) : 0;
                            return (
                              <div key={index} className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest truncate">{category.name}</span>
                                </div>
                                <div className="pl-4 flex items-baseline gap-1.5">
                                  <span className={`text-sm font-black ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{percentage}%</span>
                                  <span className="text-[11px] text-gray-400 font-semibold">({formatPrice(category.value)})</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              </div>
            </div>
          )}
            
          {/* Recent Transactions Table */}
          {activeTab === 'Transactions' && (
            <motion.div variants={itemVariants} className={`mt-8 p-0 md:p-8 rounded-3xl border transition-all duration-500 overflow-hidden relative ${isDark ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-white border-black/[0.05] shadow-sm'}`}>
               <div className="p-8 md:p-0 flex items-center justify-between mb-8">
                  <div>
                    <h3 className={`text-xl font-medium tracking-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Latest Transactions</h3>
                    <p className="text-[13px] font-medium text-gray-500">Live feed of global purchases.</p>
                  </div>
                  <button className={`hidden md:flex items-center gap-2 text-[13px] font-semibold transition-colors px-4 py-2 rounded-xl ${isDark ? 'text-gray-300 bg-white/5 hover:bg-white/10' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}>
                    View All <ArrowUpRight className="w-4 h-4" />
                  </button>
               </div>
               <div className="overflow-x-auto px-8 md:px-0 pb-8 md:pb-0">
                 <table className="w-full text-left border-collapse min-w-[900px]">
                   <thead>
                     <tr className={`border-b text-[11px] font-bold uppercase tracking-widest ${isDark ? 'border-white/5 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                       <th className="pb-4 pl-4 font-semibold">Transaction Details</th>
                       <th className="pb-4 font-semibold">Customer</th>
                       <th className="pb-4 font-semibold">Product</th>
                       <th className="pb-4 font-semibold">Amount</th>
                       <th className="pb-4 font-semibold">Status</th>
                       <th className="pb-4 pr-4 text-right font-semibold">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {transactions.length > 0 ? transactions.map((trx, idx) => (
                       <tr key={trx.id + idx} className={`border-b last:border-0 transition-colors group ${isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-gray-100 hover:bg-gray-50'}`}>
                         <td className="py-4 pl-4">
                           <div className="flex flex-col">
                             <span className={`font-mono text-[13px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                               {trx.id.startsWith('pay_') ? trx.id : `TRX-${trx.id}`}
                             </span>
                             <span className="text-[12px] text-gray-500 mt-0.5">{trx.date}</span>
                           </div>
                         </td>
                         <td className="py-4">
                           <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}>
                               {trx.avatar}
                             </div>
                             <span className={`text-[14px] font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{trx.user}</span>
                           </div>
                         </td>
                         <td className="py-4">
                           <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isDark ? 'bg-white/5 border-white/5 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                             <Package className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                             <span className="text-[13px] font-medium">{trx.template}</span>
                           </div>
                         </td>
                         <td className={`py-4 text-[14px] font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatPrice(trx.amount)}</td>
                         <td className="py-4">
                           <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${trx.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                             <span className={`text-[13px] font-medium ${trx.status === 'Completed' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-amber-400' : 'text-amber-600')}`}>
                               {trx.status}
                             </span>
                           </div>
                         </td>
                         <td className="py-4 pr-4 text-right">
                           <button className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-black hover:bg-gray-100'}`}>
                             <MoreHorizontal className="w-4 h-4" />
                           </button>
                         </td>
                       </tr>
                     )) : (
                       <tr>
                         <td colSpan="6" className="py-12 text-center">
                           <div className="inline-flex flex-col items-center justify-center">
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                               <Package className={`w-6 h-6 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                             </div>
                             <p className={`text-[13px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{isLoading ? 'Syncing transactions...' : 'No transactions found.'}</p>
                           </div>
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </motion.div>
          )}

          {/* Customers Directory */}
          {activeTab === 'Customers' && (
             <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from(new Set(transactions.map(t => t.user))).map((userName, idx) => {
                  const userTrx = transactions.filter(t => t.user === userName);
                  const totalSpent = userTrx.reduce((acc, curr) => acc + curr.amount, 0);
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedCustomer({ name: userName, transactions: userTrx, totalSpent })}
                      className={`p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 cursor-pointer ${isDark ? 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04]' : 'bg-white border-black/[0.05] shadow-sm hover:shadow-md hover:border-black/[0.1]'}`}
                    >
                       <div className="flex items-center gap-4 mb-4">
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'}`}>
                           {userName.charAt(0).toUpperCase()}
                         </div>
                         <div>
                           <h4 className={`font-semibold text-[15px] ${isDark ? 'text-white' : 'text-gray-900'}`}>{userName}</h4>
                           <p className="text-[12px] text-gray-500 font-medium">{userTrx.length} Orders</p>
                         </div>
                       </div>
                       <div className={`pt-4 border-t flex justify-between items-center ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                         <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Lifetime Value</span>
                         <span className={`font-bold text-[14px] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatPrice(totalSpent)}</span>
                       </div>
                    </div>
                  )
                })}
             </motion.div>
          )}

          {/* Customer Profile Modal */}
          {selectedCustomer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setSelectedCustomer(null)}></div>
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-8 z-10 ${isDark ? 'bg-[#0a0a0a] border-white/10 shadow-black/50' : 'bg-white border-gray-200 shadow-xl'}`}
               >
                 <button 
                   onClick={() => setSelectedCustomer(null)}
                   className={`absolute top-6 right-6 p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-black'}`}
                 >
                   <ArrowLeft className="w-5 h-5 rotate-180" />
                 </button>
                 
                 <div className="flex items-center gap-5 mb-8">
                   <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'}`}>
                     {selectedCustomer.name.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <h2 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedCustomer.name}</h2>
                     <p className="text-[13px] font-medium text-gray-500 mt-1">Customer Profile</p>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                     <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Total Spent</p>
                     <p className={`text-xl font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatPrice(selectedCustomer.totalSpent)}</p>
                   </div>
                   <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                     <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Total Orders</p>
                     <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedCustomer.transactions.length}</p>
                   </div>
                 </div>
                 
                 <h3 className={`font-semibold text-[15px] mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Purchase History</h3>
                 <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                   {selectedCustomer.transactions.map((trx, idx) => (
                     <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-gray-100 hover:bg-gray-50'}`}>
                       <div className="flex items-center gap-4">
                         <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                           <Package className="w-5 h-5" />
                         </div>
                         <div>
                           <p className={`font-semibold text-[14px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{trx.template}</p>
                           <p className="text-[12px] text-gray-500 mt-0.5">{trx.date}</p>
                         </div>
                       </div>
                       <p className={`font-semibold text-[14px] ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{trx.amount.toLocaleString()}</p>
                     </div>
                   ))}
                 </div>
               </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick, isDark }) {
  return (
    <button onClick={onClick} className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all w-full group outline-none overflow-hidden ${active ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}>
      {active && (
        <motion.div layoutId="activeSidebar" className={`absolute inset-0 rounded-xl ${isDark ? 'bg-white/10' : 'bg-black/5'}`} />
      )}
      <div className={`relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="relative z-10 tracking-wide">{label}</span>
      {active && (
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-full ${isDark ? 'bg-white' : 'bg-black'}`} />
      )}
    </button>
  );
}

function PremiumStatCard({ title, value, icon, trend, isPositive, color, isDark }) {
  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const bgMap = {
    blue: 'bg-blue-500/10 text-blue-500',
    purple: 'bg-black/10 dark:bg-white/10 text-black dark:text-white',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    pink: 'bg-pink-500/10 text-pink-500'
  };

  return (
    <motion.div variants={itemVariant} className={`relative group p-6 rounded-3xl border transition-all duration-500 overflow-hidden ${isDark ? 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04]' : 'bg-white border-black/[0.05] shadow-sm hover:shadow-md hover:border-black/[0.1]'}`}>
      
      <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r opacity-50 group-hover:opacity-100 transition-opacity duration-500 ${color === 'blue' ? 'from-blue-500' : color === 'purple' ? 'from-black dark:from-white' : color === 'emerald' ? 'from-emerald-500' : 'from-pink-500'} to-transparent`} />

      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-2">{title}</p>
          <h4 className={`text-3xl font-medium tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</h4>
        </div>
        <div className={`p-2.5 rounded-xl ${bgMap[color]} transition-colors`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200/50 dark:border-white/5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </span>
        <span className="text-[11px] font-medium text-gray-400">vs last month</span>
      </div>
    </motion.div>
  );
}
