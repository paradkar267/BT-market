-- ====================================================================
-- BIZLEAP MARKETPLACE - COMPLETE NEON POSTGRESQL SCHEMA & SEED DATA
-- ====================================================================

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- 'user' or 'admin'
  purchased_templates JSONB DEFAULT '[]'::jsonb,
  wishlist_templates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. TEMPLATES CATALOG TABLE
CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY,
  tag TEXT,
  category TEXT,
  title TEXT NOT NULL,
  author TEXT,
  sales INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 5,
  price TEXT NOT NULL,
  image TEXT,
  description TEXT,
  keywords TEXT[],
  preview_url TEXT,
  demo_url TEXT,
  figma_url TEXT,
  github_repo_url TEXT,
  zip_download_url TEXT,
  live_preview_url TEXT,
  details JSONB,
  is_exclusive BOOLEAN DEFAULT false,
  is_sold_out BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PURCHASES TABLE
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES templates(id) ON DELETE CASCADE,
  payment_id TEXT,
  amount NUMERIC,
  refund_status TEXT DEFAULT 'none', -- 'none', 'requested', 'processed', 'rejected'
  refund_id TEXT,
  refund_reason TEXT,
  refund_amount NUMERIC,
  refund_requested_at TIMESTAMPTZ,
  refund_processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_template_id ON purchases(template_id);

-- 4. COUPONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC DEFAULT 0,
  usage_limit INT DEFAULT NULL,
  times_used INT DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COUPON REDEMPTIONS TABLE
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id BIGSERIAL PRIMARY KEY,
  coupon_id UUID,
  coupon_code TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES templates(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  user_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_template_id ON reviews(template_id);

-- 7. STORE ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS store_announcements (
  id TEXT PRIMARY KEY DEFAULT 'primary_banner',
  is_enabled BOOLEAN DEFAULT true,
  headline TEXT DEFAULT '🔥 Weekend Mega Flash Sale Ends in:',
  coupon_code TEXT DEFAULT 'LAUNCH50',
  discount_badge TEXT DEFAULT '50% OFF',
  button_text TEXT DEFAULT 'Claim 50% OFF Now →',
  button_url TEXT DEFAULT '/explore',
  end_time TIMESTAMPTZ DEFAULT (NOW() + interval '48 hours'),
  theme TEXT DEFAULT 'fire' CHECK (theme IN ('fire', 'cyber', 'emerald', 'sunset')),
  is_dismissible BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MARKETING CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  type TEXT NOT NULL DEFAULT 'announcement',
  headline TEXT NOT NULL,
  body_text TEXT NOT NULL,
  button_text TEXT DEFAULT 'Explore Now →',
  button_url TEXT DEFAULT 'https://bizleap.in',
  template_id TEXT,
  coupon_code TEXT,
  audience_type TEXT NOT NULL DEFAULT 'all',
  audience_filter TEXT,
  recipients_count INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TEMPLATE FILES & LOCAL STORAGE MAPPINGS
CREATE TABLE IF NOT EXISTS template_files (
  id BIGSERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES templates(id) ON DELETE CASCADE,
  file_name TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TEMPLATE BINARY CLOUD STORAGE (BYTEA in Neon)
CREATE TABLE IF NOT EXISTS template_storage (
  template_id INTEGER PRIMARY KEY REFERENCES templates(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_data BYTEA NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT DEFAULT 'application/zip',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- SEED DATA
-- ====================================================================

-- Seed Starter Promo Codes
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, usage_limit, times_used, expires_at, is_active) VALUES
('LAUNCH50', 'percentage', 50, 2000, 100, 14, NOW() + interval '30 days', true),
('WELCOME20', 'percentage', 20, 1000, 500, 68, NOW() + interval '60 days', true),
('FLAT500', 'flat', 500, 3000, 200, 32, NOW() + interval '45 days', true),
('BIZLEAP1000', 'flat', 1000, 5000, 50, 9, NOW() + interval '15 days', true)
ON CONFLICT (code) DO NOTHING;

-- Seed Default Announcement Banner
INSERT INTO store_announcements (
  id, is_enabled, headline, coupon_code, discount_badge, button_text, button_url, end_time, theme, is_dismissible
) VALUES (
  'primary_banner',
  true,
  '🔥 Weekend Mega Flash Sale Ends in:',
  'LAUNCH50',
  '50% OFF',
  'Claim 50% OFF Now →',
  '/explore',
  NOW() + interval '48 hours',
  'fire',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Seed Templates (50 Catalog Templates)
INSERT INTO templates (id, tag, category, title, author, sales, rating, price, image, description, keywords) VALUES
(1, 'UI Kit', 'Figma', 'Nexus Admin Dashboard', 'uixthemes', 1200, 5, '4069', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop', 'The most comprehensive admin dashboard UI kit built entirely in Figma. It comes with hundreds of components, 15 pre-built pages, and a full design system.', '{"admin","dashboard","panel","management","ui","kit","business","corporate","software","backend"}'),
(2, 'Web', 'Webflow', 'Aura Landing Page', 'purethemes', 850, 4.5, '4029', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop', 'A beautifully crafted landing page template for modern SaaS companies. Ready to launch in Webflow with CMS integration.', '{"landing","saas","startup","corporate","business","company","enterprise","software","agency"}'),
(3, 'App', 'React Native', 'Fintech Mobile', 'Case-Themes', 3200, 5, '4049', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop', 'A complete mobile banking and fintech app template built with React Native. Includes charting components and wallet management UI.', '{"finance","banking","crypto","wallet","money","app","business","startup","fintech"}'),
(4, 'SaaS', 'Next.js', 'Creator Studio', 'Pixels71', 410, 4, '4059', 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=800&auto=format&fit=crop', 'A full-stack Next.js boilerplate template for content creators and marketers.', '{"creator","video","marketing","studio","vlog","business","agency","startup"}'),
(5, 'Dashboard', 'Tailwind', 'Dev Tools UI', 'PressLayouts', 900, 4.5, '4045', 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop', 'Tailwind CSS dashboard for developers. Super clean code and easily customizable.', '{"developer","tools","dashboard","code","tailwind","business","management","admin","software"}'),
(6, 'E-Commerce', 'Next.js', 'Shopify Storefront', '7uptheme', 5000, 5, '4079', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop', 'A headless Shopify storefront template built with Next.js and Tailwind.', '{"ecommerce","shop","store","retail","shopping","cart","business","company"}'),
(7, 'Portfolio', 'HTML', 'Creative Agency', 'rk_theme', 125, 5, '4035', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop', 'A stunning portfolio template built in Framer. Features advanced scroll animations.', '{"portfolio","agency","creative","design","freelance","business","studio","corporate","company"}'),
(8, 'Web3', 'HTML', 'Crypto Exchange', 'adornthemes', 65, 4, '4089', 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format&fit=crop', 'Dark mode Webflow template specifically designed for crypto exchanges and Web3 startups.', '{"crypto","web3","blockchain","exchange","nft","business","finance","startup"}'),
(9, 'Business', 'React', 'Sweet Bakery Shop', 'FoodThemes', 340, 5, '4039', 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&auto=format&fit=crop', 'A beautifully designed ecommerce site for local bakeries, pastry shops, and cafes.', '{"bakery","shop","cake","pastry","cafe","food","restaurant","ecommerce","business","store","local"}'),
(10, 'Local', 'HTML', 'Elite Gym & Fitness', 'GymMasters', 890, 4.5, '4029', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop', 'Landing page template for local gyms and fitness centers. Includes pricing tables and class schedules.', '{"gym","fitness","workout","sports","local","health","business","company","studio"}'),
(11, 'Medical', 'Webflow', 'Care Medical Center', 'HealthWeb', 420, 4.8, '4049', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop', 'Professional website template for hospitals, clinics, and individual doctors.', '{"medical","hospital","clinic","doctor","health","care","business","local","corporate"}'),
(12, 'Events', 'Framer', 'Music Festival Pro', 'EventPlanners', 210, 4.9, '4039', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop', 'High-energy Framer template for music festivals, concerts, and nightlife events.', '{"music","festival","event","concert","nightlife","party","business","agency","entertainment"}'),
(13, 'Real Estate', 'React', 'Luxe Realty Portal', 'EstateThemes', 1150, 4.7, '4089', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop', 'A comprehensive real estate directory and property listing template with map integrations.', '{"real estate","property","realtor","home","house","apartment","listing","directory","business"}'),
(14, 'Education', 'HTML', 'Academy LMS UI', 'LearnWeb', 840, 4.9, '4069', 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&auto=format&fit=crop', 'Online course and LMS template for schools, universities, and independent instructors.', '{"education","school","university","course","lms","learning","student","teacher","academy"}'),
(15, 'Blog', 'Tailwind', 'Chronicle Magazine', 'NewsPress', 2400, 4.6, '4024', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop', 'Minimalist, reading-optimized blog and magazine template with newsletter integration.', '{"blog","magazine","news","article","publishing","writing","newsletter","editorial","journal"}'),
(16, 'Photography', 'Framer', 'Lens Visuals', 'PhotoStudio', 520, 5, '4045', 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&auto=format&fit=crop', 'Horizontal scrolling portfolio specifically built for photographers and visual artists.', '{"photography","photo","camera","gallery","visual","art","artist","portfolio"}'),
(17, 'Nonprofit', 'React', 'Hope Charity', 'GoodCauses', 310, 4.8, '4039', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop', 'Donation-ready template designed for NGOs, charities, and fundraising campaigns.', '{"nonprofit","charity","ngo","fundraising","donate","cause","community","volunteer"}'),
(18, 'Personal', 'HTML', 'Resume Pro', 'CV-Makers', 1800, 4.9, '4019', 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop', 'A highly convertible personal resume and cv website template to help you land your dream job.', '{"resume","cv","personal","portfolio","freelance","developer","designer","profile"}'),
(19, 'Travel', 'HTML', 'Wanderlust Booking', 'TripThemes', 670, 4.7, '4055', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop', 'A stunning travel booking and hotel reservation template. Features interactive maps and date pickers.', '{"travel","tourism","hotel","booking","agency","vacation","trip","flights","destination"}'),
(20, 'Architecture', 'Webflow', 'Architec Studio', 'BuildUI', 290, 4.9, '4045', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop', 'Minimalist and brutalist design for architecture firms and interior designers. Heavy focus on typography.', '{"architecture","interior","design","building","real estate","agency","studio","construction"}'),
(21, 'Automotive', 'React', 'Auto Drive Dealership', 'CarThemes', 450, 4.6, '4069', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&auto=format&fit=crop', 'Complete car dealership and vehicle rental marketplace template with advanced filtering capabilities.', '{"auto","automotive","car","dealership","rental","vehicle","sales","business","store"}'),
(22, 'Media', 'HTML', 'Streamify VOD', 'AppMakers', 1540, 5, '4089', 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&auto=format&fit=crop', 'Netflix-style video-on-demand streaming application template with offline playback UI.', '{"streaming","media","video","vod","movie","entertainment","app","podcast","netflix"}'),
(23, 'Beauty', 'Figma', 'Glow Salon & Spa', 'BeautyUI', 880, 4.8, '4035', 'https://images.unsplash.com/photo-1560066984-138daaa4e5dd?w=800&auto=format&fit=crop', 'Elegant UI Kit for beauty salons, spas, cosmetics brands, and wellness centers.', '{"beauty","salon","spa","cosmetics","wellness","hair","makeup","massage","ecommerce"}'),
(24, 'AI Tech', 'Webflow', 'Neural AI Tool', 'TechFlow', 3100, 5, '4059', 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop', 'Futuristic dark-mode landing page designed specifically for AI tools, LLMs, and machine learning startups.', '{"ai","tech","artificial intelligence","machine learning","startup","software","gpt","futuristic"}'),
(25, 'Podcast', 'React', 'AudioCast Hub', 'SoundWave', 430, 4.6, '4049', 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop', 'A highly optimized platform for podcasters and audio creators. Includes a custom audio player.', '{"podcast","audio","sound","music","creator","media","broadcasting","voice"}'),
(26, 'Gaming', 'HTML', 'Esports Arena', 'GamerThemes', 1200, 4.9, '4039', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop', 'Dark and aggressive gaming template for esports teams, tournaments, and streamer profiles.', '{"gaming","esports","games","streamer","tournament","play","team","dark"}'),
(27, 'Hosting', 'HTML', 'CloudHost Pro', 'ServerNet', 750, 4.7, '4045', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop', 'Web hosting and cloud infrastructure company template with complex pricing tables.', '{"hosting","cloud","server","domain","infrastructure","saas","tech","network"}'),
(28, 'Logistics', 'Framer', 'Freight Forward', 'CargoUI', 290, 4.5, '4049', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop', 'Logistics, transport, and cargo tracking website template. Perfect for shipping companies.', '{"logistics","transport","shipping","cargo","freight","delivery","truck","business"}'),
(29, 'Legal', 'Next.js', 'Justice Law Firm', 'LegalWeb', 340, 4.8, '4055', 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&auto=format&fit=crop', 'A formal and highly professional template for law firms, attorneys, and legal consultants.', '{"law","legal","lawyer","attorney","justice","firm","consulting","professional"}'),
(30, 'Pets', 'Tailwind', 'Paws & Tails', 'PetLovers', 510, 4.9, '4035', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop', 'Cute and playful template for veterinary clinics, pet shops, and animal shelters.', '{"pet","animal","dog","cat","veterinary","vet","shelter","shop"}'),
(31, 'Farming', 'Webflow', 'AgriTech Harvest', 'GreenEarth', 150, 4.4, '4029', 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop', 'Modern agriculture and farming template. Perfect for organic farms and eco-friendly products.', '{"agriculture","farm","farming","organic","eco","green","harvest","nature"}'),
(32, 'Dating', 'React Native', 'MatchMaker App', 'LoveTech', 2100, 4.7, '4079', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop', 'A complete dating and social networking mobile app template with swiping animations.', '{"dating","love","match","social","app","mobile","networking","chat"}'),
(33, 'Crowdfund', 'React', 'FundRaiser Platform', 'CapitalFlow', 650, 4.8, '4069', 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=800&auto=format&fit=crop', 'A fully functional crowdfunding and startup investment platform UI.', '{"crowdfunding","invest","startup","fund","capital","raise","finance"}'),
(34, 'Jobs', 'Webflow', 'HireMe Job Board', 'CareerUI', 1120, 4.9, '4059', 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop', 'A robust job board and recruiting portal. Connects employers with talented freelancers.', '{"job","hiring","career","board","recruit","freelance","work","employment"}'),
(35, 'Religion', 'Tailwind', 'Grace Church', 'FaithThemes', 340, 4.7, '4039', 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&auto=format&fit=crop', 'A serene and welcoming template for churches, ministries, and religious organizations.', '{"church","religion","faith","ministry","charity","community","god"}'),
(36, 'NFT', 'Framer', 'Minted NFT Space', 'CryptoArt', 890, 4.6, '4045', 'https://images.unsplash.com/photo-1644361566696-3d442b5b482a?w=800&auto=format&fit=crop', 'A neon-infused NFT marketplace and minting page template built with Framer motion.', '{"nft","crypto","art","mint","blockchain","web3","digital","gallery"}'),
(37, 'Security', 'Next.js', 'CyberGuard Tech', 'SecureNet', 420, 4.8, '4055', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop', 'Cybersecurity and IT service company template with a highly technical, dark aesthetic.', '{"security","cyber","it","hacker","network","protect","tech","software"}'),
(38, 'Fashion', 'Figma', 'Vogue Apparel', 'StyleUI', 2300, 5, '4069', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop', 'A high-fashion, ultra-minimalist UI kit for luxury clothing brands and boutiques.', '{"fashion","apparel","clothes","clothing","boutique","luxury","style","ecommerce"}'),
(39, 'Furniture', 'Webflow', 'Oak & Iron Decor', 'HomeThemes', 670, 4.9, '4049', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop', 'E-commerce template optimized for furniture stores and interior decor products.', '{"furniture","decor","home","interior","wood","store","ecommerce","shop"}'),
(40, 'Gadgets', 'Tailwind', 'TechZone Electronics', 'GadgetWeb', 1100, 4.7, '4059', 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&auto=format&fit=crop', 'A massive, multi-category e-commerce layout for electronics and gadget retailers.', '{"electronics","gadgets","tech","devices","store","ecommerce","retail","shop"}'),
(41, 'Books', 'Next.js', 'Chapter Library', 'ReadUI', 290, 4.6, '4039', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop', 'A cozy bookstore and digital library template for selling ebooks and physical copies.', '{"book","library","read","author","publishing","store","ebook","literature"}'),
(42, 'Recipe', 'Framer', 'Gourmet Kitchen', 'ChefThemes', 540, 4.8, '4035', 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&auto=format&fit=crop', 'A beautiful recipe blog and culinary platform template with interactive step-by-step guides.', '{"recipe","food","cooking","chef","kitchen","blog","gourmet","culinary"}'),
(43, 'Cleaning', 'Webflow', 'Sparkle Maids', 'ServiceWeb', 380, 4.5, '4029', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop', 'Local service template optimized for cleaning services, maids, and janitorial companies.', '{"cleaning","maid","service","janitor","local","business","home","sparkle"}'),
(44, 'Handyman', 'Tailwind', 'FixIt Plumbing', 'TradeThemes', 460, 4.7, '4035', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop', 'High-converting landing page for plumbers, electricians, and local handymen.', '{"plumber","handyman","electrician","repair","fix","local","service","contractor"}'),
(45, 'Tattoo', 'React Native', 'Ink Studio App', 'ArtApps', 180, 4.9, '4049', 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&auto=format&fit=crop', 'A mobile app template for tattoo artists to showcase portfolios and manage bookings.', '{"tattoo","ink","art","studio","booking","artist","app","mobile"}'),
(46, 'Dental', 'Next.js', 'Bright Smile Clinic', 'HealthWeb', 620, 4.8, '4045', 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&auto=format&fit=crop', 'A clean, trustworthy website template for dental clinics and orthodontists.', '{"dental","dentist","clinic","teeth","health","medical","doctor","local"}'),
(47, 'VR/AR', 'Framer', 'MetaVerse Portal', 'FutureTech', 410, 5, '4055', 'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=800&auto=format&fit=crop', 'A highly immersive, 3D-integrated template for VR hardware and metaverse software.', '{"vr","ar","virtual reality","metaverse","tech","gaming","3d","futuristic"}'),
(48, 'Kids', 'Webflow', 'TinyTots Kindergarten', 'EduThemes', 290, 4.6, '4039', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop', 'A colorful and playful website template for kindergartens, daycares, and preschools.', '{"kids","children","kindergarten","daycare","school","preschool","education","play"}'),
(49, 'Politics', 'Tailwind', 'Vote 2024 Campaign', 'CivicWeb', 150, 4.5, '4029', 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop', 'A bold, patriotic template designed for political campaigns, candidates, and civic movements.', '{"politics","campaign","vote","election","candidate","civic","government","news"}'),
(50, 'Space', 'Next.js', 'Orbit Aerospace', 'AeroTech', 190, 4.9, '4065', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop', 'A breathtaking, dark-themed template for aerospace companies and satellite tech startups.', '{"space","aerospace","galaxy","rocket","satellite","tech","universe","science"}')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  description = EXCLUDED.description,
  keywords = EXCLUDED.keywords;
