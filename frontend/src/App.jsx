import './App.css';
import React from 'react';
import Home from './Home';
import SEO from './components/SEO';

export default function App() {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <SEO />
      <Home />
    </div>
  );
}
