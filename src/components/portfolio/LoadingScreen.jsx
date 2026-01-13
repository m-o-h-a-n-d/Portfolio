import React, { useMemo } from 'react';
import './LoadingScreen.css';
import LaravelIcon from '../ui/LaravelIcon';

const LoadingScreen = ({ progress }) => {
  // Memoize the progress transform to prevent unnecessary calculations
  const progressStyle = useMemo(() => ({
    transform: `scaleX(${(progress || 0) / 100})`
  }), [progress]);

  return (
    <div className="loading-screen-container">
      <div className="loading-bg"></div>

      <div className="loading-content">
        <div className="atom-container">
          {/* Center Logo */}
          <div className="center-logo-wrapper">
            <LaravelIcon size={50} />
          </div>

          {/* Orbit Rings and Electrons */}
          <div className="orbit orbit-1">
            <div className="electron"></div>
          </div>
          <div className="orbit orbit-2">
            <div className="electron"></div>
          </div>
          <div className="orbit orbit-3">
            <div className="electron"></div>
          </div>
        </div>

        {/* Loading Text Section */}
        <div className="loading-text">
          <h2 className="loading-title">LOADING</h2>
          <div className="loading-bar-container">
            <div 
              className="loading-bar-progress" 
              style={progressStyle}
            ></div>
          </div>
          <p className="loading-subtitle">Please wait...</p>
        </div>
      </div>
    </div>
  );
};

// Use React.memo to prevent re-renders unless progress changes
export default React.memo(LoadingScreen);
