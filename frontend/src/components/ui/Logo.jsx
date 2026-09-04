import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ className = '', imgClassName = '' }) => {
  return (
    <Link
      to='/'
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`inline-flex items-center cursor-pointer shrink-0 select-none ${className}`}
      aria-label="Bizleap Home"
    >
      {/* Light mode logo (dark text + yellow accent) */}
      <img
        src="/logo.png"
        alt="Bizleap Market"
        className={`h-9 md:h-10 w-auto object-contain dark:hidden transition-opacity duration-200 ${imgClassName}`}
        draggable={false}
      />
      {/* Dark mode logo (white text + yellow accent) */}
      <img
        src="/logo-dark.png"
        alt="Bizleap Market"
        className={`h-9 md:h-10 w-auto object-contain hidden dark:block transition-opacity duration-200 ${imgClassName}`}
        draggable={false}
      />
    </Link>
  );
};
