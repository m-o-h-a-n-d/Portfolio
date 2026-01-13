import React from 'react';
import './LoadingScreen.css';
import LaravelIcon from '../ui/LaravelIcon';

const LoadingScreen = ({ progress }) => {
  return (
    <div className="loading-screen-container">
      <div className="loading-bg"></div>

      <div className="loading-content">
        <div className="atom-container">
          {/* Center Logo */}
          <div className="center-logo-wrapper">
            <LaravelIcon size={55} />
          </div>

          {/* Orbit 1 - Horizontal */}
          <div className="orbit-container orbit-1">
            <div className="orbit-path-css"></div>
            <div className="electron-ball-css"></div>
          </div>

          {/* Orbit 2 - Rotated 60deg */}
          <div className="orbit-container orbit-2">
            <div className="orbit-path-css"></div>
            <div className="electron-ball-css"></div>
          </div>

          {/* Orbit 3 - Rotated 120deg */}
          <div className="orbit-container orbit-3">
            <div className="orbit-path-css"></div>
            <div className="electron-ball-css"></div>
          </div>
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
