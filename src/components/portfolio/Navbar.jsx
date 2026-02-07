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
        /* Mobile Styles (Fixed Bottom) */
        fixed bottom-0 left-0 w-full z-50
        bg-onyx/75 backdrop-blur-md border-t border-border rounded-t-[12px] shadow-portfolio-2
        
        /* Desktop Styles (Top Right Corner inside Card) */
        md:absolute md:bottom-auto md:top-0 md:left-auto md:right-0 
        md:w-max md:rounded-none md:rounded-bl-[20px] md:rounded-tr-[20px]
        md:border-b md:border-l md:border-t-0 md:border-r-0 md:bg-onyx/75
        md:px-5 md:shadow-none
      `}
    >
      <ul className="flex flex-wrap justify-center items-center px-5 md:gap-9 md:px-0">
        {pages.map((page) => (
          <li key={page}>
            <button
              onClick={() => handleNavClick(page)}
              className={`
                relative px-2 py-4 md:py-5 text-[12px] md:text-[16px] font-medium transition-colors
                ${
                  activePage === page.toLowerCase() || (activePage === 'project-details' && page.toLowerCase() === 'portfolio')
                    ? 'text-primary'
                    : 'text-light-gray hover:text-light-gray/70'
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

