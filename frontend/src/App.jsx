import './App.css';
import React from 'react';
import Home from './Home';
import SEO from './components/SEO';

const HOME_FAQS = [
  {
    question: "Do you offer refunds?",
    answer: "Yes. We offer a 14-day money-back guarantee if a template has critical bugs or differs from the preview."
  },
  {
    question: "Do I get free lifetime updates?",
    answer: "Yes. All template updates, bug fixes, and framework upgrades are included free for lifetime in your account."
  },
  {
    question: "Can I use templates for client projects?",
    answer: "Yes. Commercial license gives you unlimited rights to deploy on client sites and SaaS apps with no royalty fees."
  },
  {
    question: "How is the code delivered?",
    answer: "Instant automated delivery. You receive a complete .zip archive immediately after checkout plus an email copy."
  },
  {
    question: "What frameworks are BizLeap templates built with?",
    answer: "BizLeap templates are built using modern React, Next.js (App Router), Tailwind CSS, Vite, and clean modular JavaScript/TypeScript."
  }
];

export default function App() {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <SEO 
        title="BizLeap | Premium React, Next.js & Tailwind Website Templates"
        description="Explore production-ready website templates and UI kits for React, Next.js, and Tailwind CSS. Built for ambitious founders and agencies with full source code and commercial license."
        faqs={HOME_FAQS}
      />
      <Home />
    </div>
  );
}
