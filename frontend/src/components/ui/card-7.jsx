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
    'Next.js':      { bg: 'bg-neutral-900 text-white', text: 'text-white' },
    'React':        { bg: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200', text: 'text-neutral-800 dark:text-neutral-200' },
    'Webflow':      { bg: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200', text: 'text-neutral-800 dark:text-neutral-200' },
    'Framer':       { bg: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200', text: 'text-neutral-800 dark:text-neutral-200' },
    'Shopify':      { bg: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200', text: 'text-neutral-800 dark:text-neutral-200' },
    'HTML':         { bg: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200', text: 'text-neutral-800 dark:text-neutral-200' },
    'Tailwind':     { bg: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200', text: 'text-neutral-800 dark:text-neutral-200' },
    'React Native': { bg: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200', text: 'text-neutral-800 dark:text-neutral-200' },
  };
  const { bg, text } = categoryColors[template.category] || { bg: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300', text: 'text-neutral-700 dark:text-neutral-300' };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative w-full bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden cursor-pointer flex flex-col hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-black/50 dark:hover:border-white/50 transition-all duration-300 ${className}`}
      {...props}
    >
      {/* Thumbnail: 70% Visual Ratio */}
      <div
        className="relative w-full aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-800"
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
            ${isWishlisted ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white/90 dark:bg-neutral-900/90 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'}
            opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 duration-200`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Hover overlay — Preview + Add */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center gap-2 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <button
            onClick={e => { e.stopPropagation(); navigate(`/product/${template.id}`); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-100 transition shadow-sm cursor-pointer"
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
                ? 'bg-neutral-800 text-white cursor-default'
                : inCart
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-black text-white hover:bg-neutral-800'
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
        className="flex flex-col justify-between p-3.5 sm:p-4 bg-white dark:bg-neutral-900 flex-1"
        onClick={() => navigate(`/product/${template.id}`)}
      >
        <div>
          {/* Tag / Tier Label */}
          {template.tag && (
            <p className="text-[10px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-0.5">
              {template.tag}
            </p>
          )}

          {/* Title */}
          <h3 className="font-bold text-sm sm:text-[15px] text-black dark:text-white leading-snug line-clamp-1 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
            {template.title}
          </h3>

          {/* Author */}
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate mb-2">
            by <span className="text-neutral-700 dark:text-neutral-300 font-medium">{template.author}</span>
          </p>
        </div>

        {/* Footer — Stars + Price */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-auto">
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.floor(template.rating) ? 'fill-black text-black dark:fill-white dark:text-white' : 'text-neutral-200 dark:text-neutral-700'}`} 
                />
              ))}
            </div>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 ml-0.5">({(template.sales || 0).toLocaleString()})</span>
          </div>
          <span className="text-sm sm:text-base font-black text-black dark:text-white">
            {formatPrice(template.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
