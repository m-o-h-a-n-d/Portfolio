import React from 'react';
import './LoadingScreen.css';
import LaravelIcon from '../ui/LaravelIcon';

const LoadingScreen = ({ progress }) => {
  return (
    <div className="loading-screen-container">
      <div className="loading-bg"></div>

      <div className="loading-content">
        <div className="atom-container">
          <svg className="orbital-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            {/* Orbit 1 - Horizontal */}
            <path 
              id="path1" 
              d="M 200 155 A 45 22 0 1 1 200 245 A 45 22 0 1 1 200 155" 
              className="orbit-path" 
            />
            <circle r="8" className="electron-ball electron-1" />

            {/* Orbit 2 - Rotated 60deg */}
            <g transform="rotate(60 200 200)">
              <path 
                id="path2" 
                d="M 200 155 A 45 22 0 1 1 200 245 A 45 22 0 1 1 200 155" 
                className="orbit-path" 
              />
              <circle r="8" className="electron-ball electron-2" />
            </g>

            {/* Orbit 3 - Rotated 120deg */}
            <g transform="rotate(120 200 200)">
              <path 
                id="path3" 
                d="M 200 155 A 45 22 0 1 1 200 245 A 45 22 0 1 1 200 155" 
                className="orbit-path" 
              />
              <circle r="8" className="electron-ball electron-3" />
            </g>

            {/* Center Logo - Integrated directly without foreignObject */}
            <g transform="translate(172.5, 171.5)">
              <g className="center-logo-wrapper">
                <LaravelIcon size={55} />
              </g>
            </g>
          </svg>
        </div>

        {/* Loading Text Section */}
        <div className="loading-text">
          <h2 className="loading-title">LOADING</h2>
          <div className="loading-bar-container">
            <div 
              className="loading-bar-progress" 
              style={{ width: `${progress || 0}%` }}
            ></div>
          </div>
          <p className="loading-subtitle">Please wait...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
