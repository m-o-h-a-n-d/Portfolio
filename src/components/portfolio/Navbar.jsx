import { useState, useEffect } from 'react';

const Navbar = ({ activePage, onPageChange }) => {
  const pages = ['About', 'Resume', 'Portfolio', 'Blog', 'Contact'];

  const handleNavClick = (page) => {
    const pageId = page.toLowerCase();
    if (pageId === activePage) return;
    onPageChange(pageId);
  };

  return (
    <nav 
      className={`
        /* Fixed Bottom with safe area for mobile */
        fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-[400px] md:max-w-none md:w-full md:bottom-0 md:left-0 md:translate-x-0 z-50
        bg-onyx/80 backdrop-blur-lg border border-border/50 md:border-t md:border-x-0 md:border-b-0 shadow-2xl rounded-2xl md:rounded-none
        navbar-glow
      `}
    >
      <ul className="flex flex-wrap justify-center items-center px-4 py-3 md:gap-9 md:px-0 md:py-5 gap-2">
        {pages.map((page) => (
          <li key={page}>
            <button
              onClick={() => handleNavClick(page)}
              className={`
                relative px-2 py-1.5 md:px-4 md:py-2 text-[12px] md:text-[15px] font-medium transition-all
                ${
                  activePage === page.toLowerCase() || (activePage === 'project-details' && page.toLowerCase() === 'portfolio')
                    ? 'text-primary hover:text-primary/80'
                    : 'text-light-gray/70 hover:text-light-gray'
                }
                `}
              >
              {page}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
