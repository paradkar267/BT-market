import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Eye, Heart, CheckCircle } from "lucide-react";
import { useCart } from "../../CartContext";
import { useAuth } from "../../AuthContext";
import { useWishlist } from "../../WishlistContext";
import { useCurrency } from "../../CurrencyContext";

export function InteractiveProductCard({
  className = "",
  template: propTemplate,
  ...props
}) {
  const template = { ...propTemplate, is_sold_out: false };
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const { addToCart, cartItems, purchasedTemplates } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const [hovered, setHovered] = React.useState(false);
  const inCart = cartItems.some(item => item.id === template.id);
  const isOwned = purchasedTemplates?.some(item => item.id === template.id);
  const isWishlisted = isInWishlist(template.id);

  const categoryColors = {
    'Figma':        { bg: 'bg-black/10 dark:bg-white/10', text: 'text-black dark:text-white' },
    'Next.js':      { bg: 'bg-gray-900 text-white', text: 'text-white' },
    'React':        { bg: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300', text: 'text-sky-800 dark:text-sky-300' },
    'Webflow':      { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300', text: 'text-blue-800 dark:text-blue-300' },
    'Framer':       { bg: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300', text: 'text-pink-800 dark:text-pink-300' },
    'Shopify':      { bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', text: 'text-emerald-800 dark:text-emerald-300' },
    'HTML':         { bg: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300', text: 'text-orange-800 dark:text-orange-300' },
    'Tailwind':     { bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300', text: 'text-cyan-800 dark:text-cyan-300' },
    'React Native': { bg: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300', text: 'text-sky-800 dark:text-sky-300' },
  };
  const { bg, text } = categoryColors[template.category] || { bg: 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300', text: 'text-gray-700 dark:text-gray-300' };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative w-full bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/90 dark:border-zinc-800 overflow-hidden cursor-pointer flex flex-col hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-black/30 dark:hover:border-white/30 transition-all duration-300 ${className}`}
      {...props}
    >
      {/* Thumbnail: 70% Visual Ratio */}
      <div
        className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-zinc-800"
        onClick={() => navigate(`/product/${template.id}`)}
      >
        <img
          src={template.image}
          alt={template.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />

        {/* Category badge top-left */}
        <span className={`absolute top-2.5 left-2.5 z-10 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs ${bg}`}>
          {template.category || 'Template'}
        </span>

        {/* Wishlist top-right */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(template); }}
          className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg backdrop-blur-md shadow-xs transition-all cursor-pointer
            ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-zinc-900/90 text-gray-600 dark:text-gray-300 hover:text-red-500'}
            opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 duration-200`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Hover overlay — Preview + Add */}
        <div
          className={`absolute inset-0 bg-gray-950/40 backdrop-blur-[2px] flex items-center justify-center gap-2 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <button
            onClick={e => { e.stopPropagation(); navigate(`/product/${template.id}`); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-lg hover:bg-gray-100 transition shadow-sm cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-black" /> Preview
          </button>
          <button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              if (!isOwned && !template.is_sold_out) requireAuth(() => addToCart(template));
            }}
            disabled={isOwned || template.is_sold_out}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition cursor-pointer ${
              isOwned
                ? 'bg-emerald-500 text-white cursor-default'
                : inCart
                  ? 'bg-black text-white hover:bg-zinc-800'
                  : 'bg-black text-white hover:bg-zinc-800'
            }`}
          >
            {isOwned
              ? <><CheckCircle className="w-3.5 h-3.5" /> Owned</>
              : <><ShoppingCart className="w-3.5 h-3.5" /> {inCart ? 'In Cart' : 'Add'}</>
            }
          </button>
        </div>
      </div>

      {/* Card Body: 30% Visual Ratio */}
      <div
        className="flex flex-col justify-between p-3.5 sm:p-4 bg-white dark:bg-zinc-900 flex-1"
        onClick={() => navigate(`/product/${template.id}`)}
      >
        <div>
          {/* Tag / Tier Label */}
          {template.tag && (
            <p className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
              {template.tag}
            </p>
          )}

          {/* Title */}
          <h3 className="font-bold text-sm sm:text-[15px] text-gray-900 dark:text-white leading-snug line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {template.title}
          </h3>

          {/* Author */}
          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mb-2">
            by <span className="text-gray-600 dark:text-gray-300 font-medium">{template.author}</span>
          </p>
        </div>

        {/* Footer — Stars + Price */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800/80 mt-auto">
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.floor(template.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-zinc-700'}`} 
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-0.5">({(template.sales || 0).toLocaleString()})</span>
          </div>
          <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
            {formatPrice(template.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
