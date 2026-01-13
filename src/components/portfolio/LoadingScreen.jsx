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
          {/* SVG with Motion Paths for Electrons */}
          <svg
            className="orbital-svg"
            viewBox="0 0 300 300"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Define Motion Paths for electrons */}
            <defs>
              {/* Orbit 1 - Horizontal ellipse */}
              <path
                id="orbit1"
                d="M 150 80 Q 210 150 150 220 Q 90 150 150 80"
                fill="none"
              />
              {/* Orbit 2 - Rotated 60 degrees */}
              <path
                id="orbit2"
                d="M 150 80 Q 210 150 150 220 Q 90 150 150 80"
                fill="none"
                transform="rotate(60 150 150)"
              />
              {/* Orbit 3 - Rotated 120 degrees */}
              <path
                id="orbit3"
                d="M 150 80 Q 210 150 150 220 Q 90 150 150 80"
                fill="none"
                transform="rotate(120 150 150)"
              />
            </defs>

            {/* Orbital Paths (Visual) */}
            <ellipse
              cx="150"
              cy="150"
              rx="70"
              ry="35"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="2.5"
              className="orbit-path orbit-path-1"
            />
            <ellipse
              cx="150"
              cy="150"
              rx="70"
              ry="35"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="2.5"
              className="orbit-path orbit-path-2"
              transform="rotate(60 150 150)"
            />
            <ellipse
              cx="150"
              cy="150"
              rx="70"
              ry="35"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="2.5"
              className="orbit-path orbit-path-3"
              transform="rotate(120 150 150)"
            />

            {/* Gradient Definition */}
            <defs>
              <radialGradient id="goldGradient">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0.3" />
              </radialGradient>
            </defs>

            {/* Animated Electrons on Motion Paths */}
            {/* Electron 1 */}
            <g className="electron-group electron-1">
              <animateMotion dur="6s" repeatCount="indefinite">
                <mpath href="#orbit1" />
              </animateMotion>
              <circle
                cx="0"
                cy="0"
                r="8"
                fill="#d4af37"
                className="electron-ball"
              />
            </g>

            {/* Electron 2 */}
            <g className="electron-group electron-2">
              <animateMotion dur="6s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1">
                <mpath href="#orbit2" />
              </animateMotion>
              <circle
                cx="0"
                cy="0"
                r="8"
                fill="#d4af37"
                className="electron-ball"
              />
            </g>

            {/* Electron 3 */}
            <g className="electron-group electron-3">
              <animateMotion dur="6s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1">
                <mpath href="#orbit3" />
              </animateMotion>
              <circle
                cx="0"
                cy="0"
                r="8"
                fill="#d4af37"
                className="electron-ball"
              />
            </g>

            {/* Center Logo - Laravel 3D Cube */}
            <g className="center-logo">
              {/* Outer cube frame */}
              <g fill="none" stroke="#d4af37" strokeWidth="1.2" className="logo-stroke">
                {/* Front face */}
                <path d="M 130 120 L 150 110 L 170 120 L 150 130 Z" />
                {/* Top face */}
                <path d="M 150 110 L 170 100 L 170 120 L 150 130 Z" />
                {/* Right face */}
                <path d="M 170 120 L 170 100 L 190 110 L 190 130 Z" />
                {/* Left face */}
                <path d="M 130 120 L 110 110 L 110 130 L 130 140 Z" />
                {/* Bottom connections */}
                <path d="M 130 140 L 150 150 L 170 140" />
                <path d="M 150 130 L 150 150" />
              </g>
              {/* Inner details */}
              <g fill="none" stroke="#d4af37" strokeWidth="0.8" opacity="0.7">
                <path d="M 140 125 L 160 125" />
                <path d="M 150 120 L 150 135" />
              </g>
            </g>
          </svg>

          {/* Decorative Code-like Marks */}
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
