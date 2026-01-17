import React, { useEffect, useState } from 'react';
import './SpaceBackground.css';

const SpaceBackground = () => {
  const [stars, setStars] = useState([]);
  const [meteors, setMeteors] = useState([]);
  
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
    const floatingIcons = Array.from({ length: 12 }).map((_, i) => ({
      id: `icon-${i}`,
      icon: icons[i % icons.length],
      left: Math.random() * 90 + 5,
      top: Math.random() * 90 + 5,
      size: Math.random() * 20 + 20,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    
    // Add floating icons to state if needed, but here we can just use them in the render
    // For simplicity, I'll just use a static-ish set of floating icons
    setFloatingIcons(floatingIcons);

    // Meteor generator
    const createMeteor = () => {
      const id = Date.now();
      const newMeteor = {
        id,
        icon: icons[Math.floor(Math.random() * icons.length)],
        startPos: {
          x: Math.random() * 50 + 50, // Start from top-right area (50% to 100%)
          y: -10
        },
        duration: Math.random() * 4 + 3,
      };
      
      setMeteors(prev => [...prev, newMeteor]);
      
      setTimeout(() => {
        setMeteors(prev => prev.filter(m => m.id !== id));
      }, 7000);
    };

    const meteorInterval = setInterval(createMeteor, 4000);
    return () => clearInterval(meteorInterval);
  }, []);

  const [floatingIcons, setFloatingIcons] = useState([]);

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
      {meteors.map(meteor => (
        <div 
          key={meteor.id}
          className="meteor"
          style={{
            left: `${meteor.startPos.x}%`,
            top: `${meteor.startPos.y}%`,
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
