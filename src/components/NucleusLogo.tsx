import React from 'react';

interface NucleusLogoProps {
  className?: string;
  size?: number;
}

export default function NucleusLogo({ className = '', size = 32 }: NucleusLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      id="nucleus-custom-logo"
    >
      <defs>
        {/* Glow Filters */}
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.5 0" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradients */}
        <radialGradient id="coin-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e2230" />
          <stop offset="60%" stopColor="#080a10" />
          <stop offset="100%" stopColor="#020305" />
        </radialGradient>

        <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />   {/* Indigo */}
          <stop offset="50%" stopColor="#3b82f6" />  {/* Blue */}
          <stop offset="100%" stopColor="#a855f7" /> {/* Purple */}
        </linearGradient>

        <linearGradient id="neon-n-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />   {/* Purple */}
          <stop offset="30%" stopColor="#6366f1" />  {/* Indigo */}
          <stop offset="70%" stopColor="#14b8a6" />  {/* Teal */}
          <stop offset="100%" stopColor="#10b981" /> {/* Emerald */}
        </linearGradient>

        <linearGradient id="n-bezel-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id="coin-edge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* 1. Base Coin Circle */}
      <circle cx="50" cy="50" r="47" fill="url(#coin-bg)" stroke="url(#coin-edge)" strokeWidth="2.5" />
      
      {/* 2. Concentric inner texture ring */}
      <circle cx="50" cy="50" r="41" stroke="#161b26" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.6" />
      <circle cx="50" cy="50" r="43" stroke="#0c0f17" strokeWidth="1" />

      {/* 4. Nucleus Orbit Lines (Stylized ellipses centered at 50,50) */}
      <g stroke="url(#orbit-grad)" strokeWidth="1.2" fill="none" opacity="0.85" filter="url(#logo-glow)">
        {/* Orbit A: Tilted Right */}
        <ellipse cx="50" cy="50" rx="40" ry="16" transform="rotate(-30 50 50)" />
        {/* Orbit B: Tilted Left */}
        <ellipse cx="50" cy="50" rx="40" ry="16" transform="rotate(30 50 50)" />
        {/* Orbit C: Vertical-ish */}
        <ellipse cx="50" cy="50" rx="40" ry="16" transform="rotate(90 50 50)" />
      </g>

      {/* 5. Electrons (Spheres orbiting along paths) */}
      <g fill="#818cf8" filter="url(#neon-glow)">
        {/* Orbit A electron */}
        <circle cx="81.5" cy="32" r="2.2" />
        <circle cx="18.5" cy="68" r="2.2" />
        {/* Orbit B electron */}
        <circle cx="18.5" cy="32" r="2.2" />
        <circle cx="81.5" cy="68" r="2.2" />
        {/* Orbit C electron */}
        <circle cx="50" cy="10" r="2.2" />
        <circle cx="50" cy="90" r="2.2" />
      </g>

      {/* 6. Central Stylized Futuristic Holographic letter "N" */}
      <g filter="url(#neon-glow)">
        {/* Outer Shadow/Glow under N */}
        <path 
          d="M35 25 L35 75 L44 75 L44 42 L62 75 L71 75 L71 25 L62 25 L62 58 L44 25 Z" 
          fill="#31106e" 
          opacity="0.5" 
          transform="translate(0, 1.5)"
        />
        
        {/* Main "N" body with the beautiful holographic-metal neon gradient */}
        <path 
          d="M35 25 L35 75 L44 75 L44 42 L62 75 L71 75 L71 25 L62 25 L62 58 L44 25 Z" 
          fill="url(#neon-n-grad)" 
        />

        {/* Gloss Overlay & Bevel Highlights (Inner facets) */}
        <path 
          d="M35 25 L35 75 L39 75 L39 31 L57 69 L62 69 L62 25 L66 25 L66 75 L71 75 L71 25 Z" 
          fill="url(#n-bezel-grad)"
          opacity="0.35"
        />

        {/* Left main stem highlight */}
        <line x1="37" y1="26" x2="37" y2="74" stroke="#ffffff" strokeWidth="0.8" opacity="0.3" />
        {/* Diagonal track highlight */}
        <line x1="46" y1="31" x2="60" y2="69" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
      </g>
    </svg>
  );
}
