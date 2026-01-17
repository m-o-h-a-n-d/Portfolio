import React, { useEffect, useState } from 'react';
import './SpaceBackground.css';

const SpaceBackground = () => {
  const [stars, setStars] = useState([]);
  const [meteors, setMeteors] = useState([]);
  const [floatingIcons, setFloatingIcons] = useState([]);
  
  const icons = [
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
  ];

  useEffect(() => {
    // Generate stars
    const starCount = 150;
    const newStars = Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random(),
      duration: Math.random() * 3 + 2,
    }));
    setStars(newStars);

    // Generate floating icons
    const initialFloatingIcons = Array.from({ length: 12 }).map((_, i) => ({
      id: `icon-${i}`,
      icon: icons[i % icons.length],
      left: Math.random() * 90 + 5,
      top: Math.random() * 90 + 5,
      size: Math.random() * 20 + 20,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setFloatingIcons(initialFloatingIcons);

    // Meteor generator with random directions and 1-minute interval
    const createMeteor = () => {
      const id = Date.now();
      
      // Random spawn position (anywhere on the edges)
      const side = Math.floor(Math.random() * 4);
      let startPos = { x: 0, y: 0 };
      
      switch(side) {
        case 0: // Top
          startPos = { x: Math.random() * 100, y: -10 };
          break;
        case 1: // Right
          startPos = { x: 110, y: Math.random() * 100 };
          break;
        case 2: // Bottom
          startPos = { x: Math.random() * 100, y: 110 };
          break;
        case 3: // Left
          startPos = { x: -10, y: Math.random() * 100 };
          break;
      }

      // Random target position (anywhere on the opposite edges)
      const endPos = {
        x: Math.random() * 120 - 10,
        y: Math.random() * 120 - 10
      };

      // Calculate rotation angle based on direction
      const angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x) * (180 / Math.PI);
      
      const newMeteor = {
        id,
        icon: icons[Math.floor(Math.random() * icons.length)],
        startPos,
        endPos,
        duration: Math.random() * 5 + 5, // Slower, more majestic movement
        rotation: angle,
      };
      
      setMeteors(prev => [...prev, newMeteor]);
      
      // Remove meteor after animation completes
      setTimeout(() => {
        setMeteors(prev => prev.filter(m => m.id !== id));
      }, 11000);
    };

    // Create first meteor immediately
    createMeteor();

    // Set interval to 1 minute (30000ms)
    const meteorInterval = setInterval(createMeteor, 30000);
    
    return () => clearInterval(meteorInterval); 
  }, []);

  return (
    <div className="space-background">
      {/* Stars */}
      {stars.map(star => (
        <div 
          key={star.id}
          className="star"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: `${star.left}%`,
            top: `${star.top}%`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`
          }}
        />
      ))}

      {/* Floating Icons */}
      {floatingIcons.map(item => (
        <div 
          key={item.id}
          className="floating-icon"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            width: `${item.size}px`,
            height: `${item.size}px`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`
          }}
        >
          <img src={item.icon} alt="tech" />
        </div>
      ))}

      {/* Meteors */}
      {meteors.map((meteor) => (
        <div 
          key={meteor.id}
          className="meteor"
          style={{
            left: `${meteor.startPos.x}%`,
            top: `${meteor.startPos.y}%`,
            '--start-x': `${meteor.startPos.x}%`,
            '--start-y': `${meteor.startPos.y}%`,
            '--end-x': `${meteor.endPos.x}%`,
            '--end-y': `${meteor.endPos.y}%`,
            '--rotation': `${meteor.rotation}deg`,
            animationDuration: `${meteor.duration}s`
          }}
        >
          <div className="meteor-head">
            <img src={meteor.icon} alt="meteor-tech" />
          </div>
          <div className="meteor-tail" />
        </div>
      ))}
    </div>
  );
};

export default SpaceBackground;
