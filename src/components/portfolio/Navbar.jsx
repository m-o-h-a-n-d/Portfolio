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
        /* Fixed Bottom Full Width for all screens */
        fixed bottom-0 left-0 w-full z-50
        bg-onyx/90 backdrop-blur-xl border-t border-border/50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]
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
