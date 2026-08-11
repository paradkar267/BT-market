import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Eye, Heart } from "lucide-react";
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
  const cardRef = React.useRef(null);
  const [tiltStyle, setTiltStyle] = React.useState({});
  const [hovered, setHovered] = React.useState(false);
  const inCart = cartItems.some(item => item.id === template.id);
  const isOwned = purchasedTemplates?.some(item => item.id === template.id);
  const isWishlisted = isInWishlist(template.id);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const rotateX = ((y - height / 2) / (height / 2)) * -6;
    const rotateY = ((x - width / 2) / (width / 2)) * 6;
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`,
      transition: "transform 0.1s ease-out",
    });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.5s ease-in-out",
    });
  };

  const categoryStyles = {
    'Figma':        'bg-violet-100 text-violet-700',
    'Next.js':      'bg-slate-900 text-white',
    'React':        'bg-cyan-100 text-cyan-700',
    'Webflow':      'bg-blue-100 text-blue-700',
    'Framer':       'bg-pink-100 text-pink-700',
    'Shopify':      'bg-green-100 text-green-700',
    'HTML':         'bg-orange-100 text-orange-700',
    'Tailwind':     'bg-sky-100 text-sky-700',
    'React Native': 'bg-cyan-100 text-cyan-700',
  };
  const catStyle = categoryStyles[template.category] || 'bg-gray-100 dark:bg-gray-800 text-gray-600';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className={`relative w-full rounded-[1.75rem] bg-white dark:bg-black border border-black/[0.06] flex flex-col cursor-pointer
        hover:border-violet-200 hover:shadow-[0_20px_50px_rgba(120,80,255,0.12)]
        shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-shadow duration-500 ${className}`}
      {...props}
    >
      {/* Image Area */}
      <div 
        className="relative w-full aspect-[16/10] overflow-hidden rounded-t-[1.75rem] bg-gray-100 dark:bg-gray-800"
        style={{ WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}
      >
        <img
          src={template.image}
          alt={template.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
        />

        {/* Category badge & Sold Out badge — top left */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${catStyle} shadow-sm w-fit`}>
            {template.category}
          </span>
          {template.is_sold_out && (
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-red-600 text-white shadow-sm w-fit">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist button — top right */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(template); }}
            className="p-2 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm hover:scale-110 transition-transform"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`} />
          </button>
        </div>

        {/* Hover action overlay */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center gap-3 transition-opacity duration-300"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <button
            onClick={e => { e.stopPropagation(); requireAuth(() => navigate(`/product/${template.id}`)); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-black text-black dark:text-white text-sm font-bold rounded-full hover:scale-105 transition-transform shadow-xl"
          >
            <Eye className="w-4 h-4" /> View
          </button>
          <button
            onClick={e => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              if (!isOwned && !template.is_sold_out) requireAuth(() => addToCart(template)); 
            }}
            disabled={isOwned || template.is_sold_out}
            title={template.is_sold_out ? "Sold Out" : isOwned ? "Already Owned" : inCart ? "Added to Cart" : "Add to Cart"}
            className={`p-2.5 rounded-full transition-all shadow-xl ${
              template.is_sold_out 
                ? 'bg-red-500 text-white cursor-not-allowed opacity-50'
                : isOwned 
                  ? 'bg-emerald-500 text-white cursor-default' 
                  : inCart 
                    ? 'bg-green-500 text-white hover:scale-105' 
                    : 'bg-violet-600 hover:bg-violet-700 text-white hover:scale-105'
            }`}
          >
            {isOwned ? <ShoppingCart className="w-4 h-4 opacity-50" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div 
        onClick={(e) => { e.stopPropagation(); requireAuth(() => navigate(`/product/${template.id}`)); }}
        className="flex flex-col flex-1 p-5 bg-white dark:bg-black rounded-b-[1.75rem]"
      >
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">{template.tag}</p>
        <h3 className={`font-black text-[15px] leading-tight line-clamp-2 mb-1 transition-colors ${hovered ? 'text-violet-600 dark:text-violet-400' : 'text-gray-900 dark:text-gray-100'}`}>
          {template.title}
        </h3>
        <p className="text-xs text-gray-400 mb-4">by <span className="text-gray-600 font-semibold">{template.author}</span></p>

        <div className="mt-auto flex justify-between items-center pt-4 border-t border-black/[0.04]">
          <div className="flex flex-col gap-0.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.floor(template.rating) ? 'fill-current' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              {template.is_sold_out ? '1/1 Edition' : `${(template.sales || 0).toLocaleString()} sales`}
            </span>
          </div>
          <div className={`text-xl font-black ${template.is_sold_out ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>
            {template.is_sold_out ? 'Sold Out' : formatPrice(template.price)}
          </div>
        </div>
      </div>
    </div>
  );
}
