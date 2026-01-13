import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen-container">
      <div className="loading-bg"></div>

      <div className="loading-content">
        <div className="atom-container">
          <svg className="orbital-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            {/* 
                To ensure each electron follows its own orbit, we define the paths directly.
                We use unique IDs and ensure the transform is applied to the path itself 
                or the animateMotion correctly references the transformed path.
            */}
            
            {/* Orbit 1 - Horizontal */}
            <path 
              id="path1" 
              d="M 200 155 A 45 22 0 1 1 200 245 A 45 22 0 1 1 200 155" 
              className="orbit-path" 
            />
            <circle r="10" className="electron-ball">
              <animateMotion dur="3s" repeatCount="indefinite">
                <mpath href="#path1" />
              </animateMotion>
            </circle>

            {/* Orbit 2 - Rotated 60deg */}
            {/* We define the path with the rotation baked into the 'd' attribute or use a group */}
            <g transform="rotate(60 200 200)">
              <path 
                id="path2" 
                d="M 200 155 A 45 22 0 1 1 200 245 A 45 22 0 1 1 200 155" 
                className="orbit-path" 
              />
              <circle r="10" className="electron-ball">
                <animateMotion dur="3.5s" repeatCount="indefinite" begin="-1.2s">
                  <mpath href="#path2" />
                </animateMotion>
              </circle>
            </g>

            {/* Orbit 3 - Rotated 120deg */}
            <g transform="rotate(120 200 200)">
              <path 
                id="path3" 
                d="M 200 155 A 45 22 0 1 1 200 245 A 45 22 0 1 1 200 155" 
                className="orbit-path" 
              />
              <circle r="10" className="electron-ball">
                <animateMotion dur="4s" repeatCount="indefinite" begin="-2.4s">
                  <mpath href="#path3" />
                </animateMotion>
              </circle>
            </g>

            {/* Center Logo */}
            <foreignObject x="150" y="150" width="100" height="100">
              <div className="center-logo-wrapper" style={{ 
                width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffcc33'
              }}>
                <i className="fab fa-laravel" style={{ fontSize: '55px' }}></i>
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
