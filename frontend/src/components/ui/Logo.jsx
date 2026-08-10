import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ className = '' }) => {
  return (
    <Link 
      to='/' 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`flex items-center gap-3 cursor-pointer group ${className}`}
    >
      <img 
        src='/logo.png' 
        alt='Bizleap Logo' 
        className='h-10 md:h-12 w-auto object-contain group-hover:scale-105 transition-transform dark:brightness-125' 
      />
    </Link>
  );
};

