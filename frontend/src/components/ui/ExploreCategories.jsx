import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const categories = [
  {
    id: 'saas',
    name: 'SaaS & Startups',
    count: '28+ Templates',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    link: '/templates?tag=SaaS',
    badge: 'Popular'
  },
  {
    id: 'dashboards',
    name: 'Dashboards & Admin',
    count: '34+ Templates',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    link: '/templates?tag=Dashboard',
    badge: 'Hot'
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce & Stores',
    count: '19+ Templates',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
    link: '/templates?tag=E-Commerce',
    badge: 'Trending'
  },
  {
    id: 'ui-kits',
    name: 'UI Kits & Design Systems',
    count: '22+ Kits',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    link: '/ui-kits',
    badge: 'New'
  },
];

export function ExploreCategories() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {categories.map(cat => (
        <div
          key={cat.id}
          onClick={() => navigate(cat.link)}
          className="group relative h-48 sm:h-56 rounded-xl overflow-hidden cursor-pointer border border-gray-200/90 dark:border-zinc-800 shadow-xs hover:shadow-xl transition-all duration-300"
        >
          {/* Background Visual Preview Image */}
          <img
            src={cat.image}
            alt={cat.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Gradient Overlay for high visual contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          {/* Top Floating Badge */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider border border-white/10">
              {cat.badge}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white text-[11px] font-bold">
              {cat.count}
            </span>
          </div>

          {/* Bottom Clean Category Label */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-neutral-200 transition-colors">
                {cat.name}
              </h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:translate-x-1 transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
