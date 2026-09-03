import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 'saas',
    name: 'SaaS & Startups',
    desc: 'Landing pages, pricing sections, onboarding flows.',
    count: 28,
    color: 'bg-gray-50 border-gray-200 hover:border-black/30',
    badge: 'bg-black text-white',
    link: '/templates',
  },
  {
    id: 'dashboards',
    name: 'Dashboards & Admin',
    desc: 'Analytics, CRM, transaction tables, live stat widgets.',
    count: 34,
    color: 'bg-sky-50 border-sky-100 hover:border-sky-300',
    badge: 'bg-sky-100 text-sky-700',
    link: '/templates',
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce & Stores',
    desc: 'Product grids, checkout flows, cart & review modules.',
    count: 19,
    color: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-700',
    link: '/templates',
  },
  {
    id: 'ui-kits',
    name: 'UI Kits & Design Systems',
    desc: 'Figma tokens, Radix UI primitives, component sets.',
    count: 22,
    color: 'bg-pink-50 border-pink-100 hover:border-pink-300',
    badge: 'bg-pink-100 text-pink-700',
    link: '/ui-kits',
  },
];

export function ExploreCategories() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map(cat => (
        <div
          key={cat.id}
          onClick={() => navigate(cat.link)}
          className={`relative rounded-xl border p-5 cursor-pointer group transition-all duration-200 ${cat.color} hover:shadow-sm`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cat.badge}`}>
              {cat.count}+ kits
            </span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1.5 leading-snug">{cat.name}</h3>
          <p className="text-xs text-gray-500 leading-relaxed">{cat.desc}</p>
        </div>
      ))}
    </div>
  );
}
