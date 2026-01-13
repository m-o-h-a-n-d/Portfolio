import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen-container">
      <div className="loading-bg"></div>

      <div className="loading-content">
        <div className="atom-container">
          <svg className="orbital-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Define three distinct paths by rotating the base elliptical path */}
              {/* Reduced radius from 75/38 to 65/32 for a more compact look */}
              <path id="orbit-path-1" d="M 200 135 A 65 32 0 1 1 200 265 A 65 32 0 1 1 200 135" fill="none" />
              <path id="orbit-path-2" d="M 200 135 A 65 32 0 1 1 200 265 A 65 32 0 1 1 200 135" fill="none" transform="rotate(60 200 200)" />
              <path id="orbit-path-3" d="M 200 135 A 65 32 0 1 1 200 265 A 65 32 0 1 1 200 135" fill="none" transform="rotate(120 200 200)" />
            </defs>

            {/* Visual Orbit Paths */}
            <use href="#orbit-path-1" className="orbit-path" />
            <use href="#orbit-path-2" className="orbit-path" />
            <use href="#orbit-path-3" className="orbit-path" />

            {/* Orbit 1 - One Electron - Increased radius to 8 for larger size */}
            <circle r="8" className="electron-ball">
              <animateMotion dur="3s" repeatCount="indefinite">
                <mpath href="#orbit-path-1" />
              </animateMotion>
            </circle>

            {/* Orbit 2 - One Electron - Increased radius to 8 for larger size */}
            <circle r="8" className="electron-ball">
              <animateMotion dur="3.5s" repeatCount="indefinite" begin="-1s">
                <mpath href="#orbit-path-2" />
              </animateMotion>
            </circle>

            {/* Orbit 3 - One Electron - Increased radius to 8 for larger size */}
            <circle r="8" className="electron-ball">
              <animateMotion dur="4s" repeatCount="indefinite" begin="-2s">
                <mpath href="#orbit-path-3" />
              </animateMotion>
            </circle>

            {/* Center Logo - Using Font Awesome Laravel Icon */}
            <foreignObject x="150" y="150" width="100" height="100">
              <div className="center-logo-wrapper" style={{ 
                width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffcc33'
              }}>
                <i className="fab fa-laravel" style={{ fontSize: '65px' }}></i>
              </div>
            </foreignObject>
          </svg>
        </div>

        {/* Loading Text Section */}
        <div className="loading-text">
          <h2 className="loading-title">LOADING</h2>
          <div className="loading-bar-container">
            <div className="loading-bar-progress"></div>
          </div>
          <p className="loading-subtitle">Please wait...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
