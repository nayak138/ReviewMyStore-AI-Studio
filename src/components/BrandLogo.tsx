import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

/**
 * Official Store Awning & 5-Star Icon
 * Featuring Google 4-color canopy stripes (Blue, Red, Yellow, Green),
 * a rounded store base container, and an illuminated 5-star rating star.
 */
export const StoreAwningIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm select-none ${className}`}
    >
      {/* Base Store rounded container with subtle gradient & inner glow */}
      <rect x="10" y="24" width="100" height="84" rx="22" fill="#1E40AF" />
      <rect x="10" y="24" width="100" height="84" rx="22" fill="url(#store_base_grad)" />
      <rect x="10.5" y="24.5" width="99" height="83" rx="21.5" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

      {/* Awning Valance Canopy Stripes (Google 4-Colors) */}
      <g filter="url(#awning_shadow)">
        {/* Leftmost Deep Blue Wing */}
        <path d="M 12 14 Q 22 11 26 14 L 28 46 C 28 53 14 53 14 46 Z" fill="#1D4ED8" />

        {/* 1. Google Blue Stripe (#4285F4) */}
        <path d="M 16 11 L 38 11 L 40 47 C 40 54 16 54 16 47 Z" fill="#4285F4" />

        {/* 2. Google Red Stripe (#EA4335) */}
        <path d="M 38 11 L 62 11 L 62 47 C 62 54 38 54 38 47 Z" fill="#EA4335" />

        {/* 3. Google Yellow Stripe (#FBBC05) */}
        <path d="M 62 11 L 86 11 L 84 47 C 84 54 62 54 62 47 Z" fill="#FBBC05" />

        {/* 4. Google Green Stripe (#34A853) */}
        <path d="M 86 11 L 106 11 L 106 47 C 106 54 84 54 84 47 Z" fill="#34A853" />

        {/* Rightmost Deep Green Wing */}
        <path d="M 96 14 Q 100 11 110 14 L 106 46 C 106 53 94 53 94 46 Z" fill="#15803D" />
      </g>

      {/* Subtle Canopy Highlight Sheen */}
      <path
        d="M 16 12 L 106 12 L 104 22 L 18 22 Z"
        fill="white"
        fillOpacity="0.18"
      />

      {/* Illuminated 5-Star Emblem */}
      <path
        d="M 60 52 L 65.2 64.6 L 78.8 65.6 L 68.4 74.8 L 71.6 88 L 60 80.8 L 48.4 88 L 51.6 74.8 L 41.2 65.6 L 54.8 64.6 Z"
        fill="#FDE047"
        stroke="#EAB308"
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter="url(#star_glow)"
      />

      {/* Sparkle highlight dots */}
      <circle cx="94" cy="62" r="2" fill="#93C5FD" opacity="0.8" />
      <circle cx="26" cy="80" r="1.5" fill="#93C5FD" opacity="0.6" />
      <circle cx="90" cy="92" r="1.5" fill="#FDE047" opacity="0.7" />

      {/* Gradients & SVG Filters */}
      <defs>
        <linearGradient id="store_base_grad" x1="60" y1="24" x2="60" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
        <filter id="awning_shadow" x="8" y="9" width="104" height="52" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodOpacity="0.28" />
        </filter>
        <filter id="star_glow" x="36" y="48" width="48" height="48" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#F59E0B" floodOpacity="0.5" />
        </filter>
      </defs>
    </svg>
  );
};

/**
 * Official Brand Logo Wordmark
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  theme = 'light',
  className = '',
}) => {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 46,
    xl: 60,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl md:text-5xl',
  };

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <div className="flex items-center gap-2.5">
        <StoreAwningIcon size={iconSizes[size]} />
        <div className={`font-black tracking-tight select-none ${textSizes[size]}`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <span className="text-[#4285F4]">Review</span>
          <span className="text-[#EA4335]">My</span>
          <span className="text-[#FBBC05]">Store</span>
          <span className="text-[#34A853]">.AI</span>
        </div>
      </div>

      {showTagline && (
        <div className="w-full mt-1.5 flex items-center justify-center gap-2">
          {/* Left Diamond line */}
          <div className="flex items-center flex-1">
            <span className="w-1.5 h-1.5 rotate-45 border border-slate-400 dark:border-slate-500 shrink-0"></span>
            <div className="h-[1px] bg-slate-300 dark:bg-slate-700 flex-1"></div>
          </div>
          
          <span className={`text-[10px] md:text-xs font-semibold tracking-wider uppercase px-1 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            The AI-Powered Google Review Platform
          </span>

          {/* Right Diamond line */}
          <div className="flex items-center flex-1">
            <div className="h-[1px] bg-slate-300 dark:bg-slate-700 flex-1"></div>
            <span className="w-1.5 h-1.5 rotate-45 border border-slate-400 dark:border-slate-500 shrink-0"></span>
          </div>
        </div>
      )}
    </div>
  );
};
