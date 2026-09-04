import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title, 
  description, 
  keywords, 
  image, 
  url,
  type = "website",
  product = null,
  faqs = null,
  breadcrumbs = null,
  noIndex = false
}) {
  const defaultTitle = "BizLeap | Premium React, Next.js & Tailwind Website Templates";
  const defaultDescription = "Explore production-ready website templates and UI kits for React, Next.js, and Tailwind CSS. Built for ambitious founders and agencies with full source code and commercial license.";
  const defaultKeywords = "react templates, next.js themes, tailwind css templates, dashboard templates, premium website templates, buy react templates, web design ui kits, bizleap market";
  const defaultImage = "https://bizleap.in/logo.png";
  const siteUrl = "https://bizleap.in";

  const seoTitle = title ? (title.includes("BizLeap") || title.includes("Bizleap") ? title : `${title} | BizLeap`) : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;
  const seoImage = image ? (image.startsWith("http") ? image : `${siteUrl}${image}`) : defaultImage;
  const seoUrl = url ? (url.startsWith("http") ? url : `${siteUrl}${url}`) : siteUrl;

  // 1. Organization Schema (Authority & Knowledge Graph Entity)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BizLeap",
    "legalName": "BizLeap Inc.",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "description": "Provider of production-ready website templates, UI kits, and custom frontend engineering for founders and agencies.",
    "email": "bizleap1@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Nagpur",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://www.instagram.com/bizleap.in/",
      "https://www.linkedin.com/company/bizleapinc/"
    ],
    "knowsAbout": [
      "React",
      "Next.js",
      "Tailwind CSS",
      "Frontend Development",
      "Website Templates",
      "Web Application Design"
    ]
  };

  // 2. WebSite Schema with Sitelinks SearchBox (AEO / Search Engine Discovery)
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BizLeap Marketplace",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/templates?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // 3. FAQ Schema (AEO: Answer Engine Optimization for Perplexity, ChatGPT, SGE)
  let faqSchema = null;
  if (faqs && Array.isArray(faqs) && faqs.length > 0) {
    faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }

  // 4. Product / SoftwareApplication Schema (E-Commerce Rich Snippets)
  let productSchema = null;
  if (product) {
    productSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": product.title || product.name,
      "description": product.description || seoDescription,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web Browser, Node.js, React",
      "image": seoImage,
      "offers": {
        "@type": "Offer",
        "price": product.price || "0",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": seoUrl,
        "seller": {
          "@type": "Organization",
          "name": "BizLeap"
        }
      },
      ...(product.rating ? {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": product.rating,
          "reviewCount": product.sales || 28,
          "bestRating": "5",
          "worstRating": "1"
        }
      } : {})
    };
  }

  // 5. Breadcrumbs Schema
  let breadcrumbSchema = null;
  if (breadcrumbs && Array.isArray(breadcrumbs)) {
    breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": crumb.name,
        "item": crumb.url.startsWith("http") ? crumb.url : `${siteUrl}${crumb.url}`
      }))
    };
  }

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <link rel="canonical" href={seoUrl} />
      <meta name="author" content="BizLeap Inc." />
      <meta name="publisher" content="BizLeap" />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />

      {/* GEO Location Metadata (Nagpur, Maharashtra, India HQ) */}
      <meta name="geo.region" content="IN-MH" />
      <meta name="geo.placename" content="Nagpur" />
      <meta name="geo.position" content="21.1458;79.0882" />
      <meta name="ICBM" content="21.1458, 79.0882" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="BizLeap" />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@bizleap" />
      <meta name="twitter:url" content={seoUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />

      {/* Structured JSON-LD Schemas (AEO, GEO, Knowledge Graph) */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webSiteSchema)}
      </script>
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}
