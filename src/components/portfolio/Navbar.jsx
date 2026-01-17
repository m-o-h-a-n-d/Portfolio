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
        /* Fixed Bottom Full Width */
        fixed bottom-0 left-0 w-full z-50
        bg-onyx/60 backdrop-blur-lg border-t border-border/50 shadow-lg
        navbar-glow
      `}
    >
      <ul className="flex flex-wrap justify-center items-center px-5 py-4 md:gap-9 md:px-0 md:py-5 gap-4">
        {pages.map((page) => (
          <li key={page}>
            <button
              onClick={() => handleNavClick(page)}
              className={`
                relative px-3 py-2 md:px-4 md:py-2 text-[13px] md:text-[15px] font-medium transition-all
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