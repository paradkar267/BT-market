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
    'Next.js':      { bg: 'bg-gray-900', text: 'text-white' },
    'React':        { bg: 'bg-sky-100', text: 'text-sky-700' },
    'Webflow':      { bg: 'bg-blue-100', text: 'text-blue-700' },
    'Framer':       { bg: 'bg-pink-100', text: 'text-pink-700' },
    'Shopify':      { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    'HTML':         { bg: 'bg-orange-100', text: 'text-orange-700' },
    'Tailwind':     { bg: 'bg-cyan-100', text: 'text-cyan-700' },
    'React Native': { bg: 'bg-sky-100', text: 'text-sky-700' },
  };
  const { bg, text } = categoryColors[template.category] || { bg: 'bg-gray-100', text: 'text-gray-600' };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative w-full bg-white rounded-2xl border border-gray-200/90 overflow-hidden cursor-pointer flex flex-col
        hover:shadow-[0_12px_36px_rgba(0,0,0,0.10)] hover:border-black/30
        transition-all duration-300 ${className}`}
      {...props}
    >
      {/* Thumbnail */}
      <div
        className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100"
        onClick={() => navigate(`/product/${template.id}`)}
      >
        <img
          src={template.image}
          alt={template.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />

        {/* Category badge top-left */}
        <span className={`absolute top-3 left-3 z-10 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm ${bg} ${text}`}>
          {template.category || 'Template'}
        </span>

        {/* Wishlist top-right */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(template); }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md shadow-md transition-all
            ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/95 text-gray-500 hover:text-red-500'}
            opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 duration-200`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Hover overlay — View + Cart */}
        <div
          className={`absolute inset-0 bg-gray-950/40 backdrop-blur-[2px] flex items-center justify-center gap-3 transition-opacity duration-250 ${hovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <button
            onClick={e => { e.stopPropagation(); navigate(`/product/${template.id}`); }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-100 transition shadow-lg"
          >
            <Eye className="w-4 h-4 text-black" /> Preview
          </button>
          <button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              if (!isOwned && !template.is_sold_out) requireAuth(() => addToCart(template));
            }}
            disabled={isOwned || template.is_sold_out}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-xl shadow-lg transition ${
              isOwned
                ? 'bg-emerald-500 text-white cursor-default'
                : inCart
                  ? 'bg-black text-white hover:bg-zinc-800'
                  : 'bg-black text-white hover:bg-zinc-800'
            }`}
          >
            {isOwned
              ? <><CheckCircle className="w-4 h-4" /> Owned</>
              : <><ShoppingCart className="w-4 h-4" /> {inCart ? 'In Cart' : 'Add'}</>
            }
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div
        className="flex flex-col flex-1 p-5"
        onClick={() => navigate(`/product/${template.id}`)}
      >
        {/* Tag / tier label */}
        {template.tag && (
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{template.tag}</p>
        )}

        {/* Title */}
        <h3 className="font-bold text-[16px] text-gray-900 leading-snug line-clamp-2 mb-1.5 group-hover:text-black transition-colors">
          {template.title}
        </h3>

        {/* Author */}
        <p className="text-xs text-gray-400 mb-4">
          by <span className="text-gray-600 font-semibold">{template.author}</span>
        </p>

        {/* Footer — stars + price */}
        <div className="mt-auto flex items-center justify-between pt-3.5 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(template.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-400 ml-1">({(template.sales || 0).toLocaleString()})</span>
          </div>
          <span className="text-lg sm:text-xl font-black text-gray-900">
            {formatPrice(template.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
