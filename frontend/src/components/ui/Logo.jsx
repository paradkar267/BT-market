import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ className = '' }) => {
  return (
    <Link 
      to='/' 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`flex items-center gap-2 cursor-pointer group shrink-0 ${className}`}
    >
      <img 
        src='/logo.png' 
        alt='Bizleap Logo' 
        className='h-8 md:h-9 w-auto object-contain group-hover:scale-105 transition-transform filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]' 
      />
    </Link>
  );
};
