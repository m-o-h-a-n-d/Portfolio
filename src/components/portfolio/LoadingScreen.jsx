import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen-container">
      {/* Background */}
      <div className="loading-bg"></div>

      {/* Main Loading Content */}
      <div className="loading-content">
        {/* Animated Atom/Orbital Structure */}
        <div className="atom-container">
          {/* Center Laravel Logo */}
          <div className="center-logo">
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="laravel-logo"
            >
              {/* Laravel 3D Logo - Golden Color */}
              <g fill="none" stroke="currentColor" strokeWidth="0.8">
                {/* Outer cube lines */}
                <path d="M 6 8 L 10 5 L 14 8 L 10 11 Z" />
                <path d="M 10 5 L 14 8 L 14 14 L 10 11 Z" />
                <path d="M 6 8 L 6 14 L 10 11 Z" />
                <path d="M 6 14 L 10 17 L 14 14 Z" />
                <path d="M 14 8 L 18 11 L 18 17 L 14 14 Z" />
                <path d="M 10 11 L 14 14 L 10 17 Z" />
              </g>
            </svg>
          </div>

          {/* Orbital Paths (3 ellipses at different angles) */}
          <svg className="orbits" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            {/* Orbit 1 - Horizontal */}
            <ellipse
              cx="100"
              cy="100"
              rx="70"
              ry="35"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="orbit orbit-1"
            />

            {/* Orbit 2 - Rotated 60 degrees */}
            <ellipse
              cx="100"
              cy="100"
              rx="70"
              ry="35"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="orbit orbit-2"
              transform="rotate(60 100 100)"
            />

            {/* Orbit 3 - Rotated 120 degrees */}
            <ellipse
              cx="100"
              cy="100"
              rx="70"
              ry="35"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="orbit orbit-3"
              transform="rotate(120 100 100)"
            />
          </svg>

          {/* Animated Electrons (Glowing Balls) */}
          <div className="electrons">
            {/* Electron 1 - Orbit 1 */}
            <div className="electron electron-1">
              <div className="electron-ball"></div>
            </div>

            {/* Electron 2 - Orbit 2 */}
            <div className="electron electron-2">
              <div className="electron-ball"></div>
            </div>

            {/* Electron 3 - Orbit 3 */}
            <div className="electron electron-3">
              <div className="electron-ball"></div>
            </div>
          </div>

          {/* Decorative Elements (Code-like marks) */}
          <div className="decorative-marks">
            <div className="mark mark-1"></div>
            <div className="mark mark-2"></div>
            <div className="mark mark-3"></div>
            <div className="mark mark-4"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="loading-text">
          <h2 className="loading-title">LOADING</h2>
          <div className="loading-underline"></div>
          <p className="loading-subtitle">Please wait...</p>
        </div>

        {/* Decorative Sparkle */}
        <div className="sparkle"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
