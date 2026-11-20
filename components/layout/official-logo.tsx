import React from 'react';

interface OfficialLogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon-only';
  theme?: 'dark' | 'light';
}

export const OfficialLogo: React.FC<OfficialLogoProps> = ({
  className = '',
  showTagline = true,
  size = 'md',
  variant = 'full',
  theme = 'light',
}) => {
  const navyColor = theme === 'dark' ? '#ffffff' : '#142b58';
  const redColor = '#dc2626';
  const taglineColor = theme === 'dark' ? '#93c5fd' : '#1e3a8a';

  if (variant === 'icon-only') {
    const iconDimensions = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' };
    return (
      <div className={`relative ${iconDimensions[size]} flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 512 512" className="h-full w-full" fill="none" aria-hidden>
          <path
            d="M 60 95 L 175 95 C 235 95 270 135 270 205 C 270 275 235 315 175 315 L 60 315 Z M 120 150 L 120 260 L 165 260 C 198 260 215 240 215 205 C 215 170 198 150 165 150 Z"
            fill={navyColor}
          />
          <path d="M 315 250 A 90 90 0 1 1 455 250" fill="none" stroke={redColor} strokeWidth="24" strokeLinecap="round" />
          <path d="M 338 238 A 62 62 0 1 1 432 238" fill="none" stroke={redColor} strokeWidth="20" strokeLinecap="round" />
          <path d="M 360 226 A 35 35 0 1 1 410 226" fill="none" stroke={redColor} strokeWidth="16" strokeLinecap="round" />
          <circle cx="385" cy="185" r="15" fill={redColor} />
          <path d="M 380 185 L 340 325 L 368 325 L 383 260 L 387 260 L 402 325 L 430 325 L 390 185 Z" fill={redColor} />
          <path d="M 358 325 C 370 295 400 295 412 325 Z" fill={theme === 'dark' ? '#142b58' : '#ffffff'} />
          <line x1="375" y1="225" x2="395" y2="245" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="395" y1="225" x2="375" y2="245" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="368" y1="260" x2="402" y2="295" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
          <line x1="402" y1="260" x2="368" y2="295" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  const scales = { sm: 'h-9 sm:h-10', md: 'h-11 sm:h-12', lg: 'h-14 sm:h-16' };

  return (
    <div className={`flex select-none flex-col ${className}`}>
      <div className={`relative ${scales[size]} flex items-center`}>
        <svg viewBox="0 0 1020 280" className="h-full w-auto max-w-full" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Directlines Technologies and Telecoms Ltd">
          <path
            d="M 28 32 L 95 32 C 142 32 172 60 172 106 C 172 152 142 180 95 180 L 28 180 Z M 68 68 L 68 144 L 92 144 C 116 144 128 131 128 106 C 128 81 116 68 92 68 Z"
            fill={navyColor}
          />
          <g>
            <path d="M 188 142 A 52 52 0 1 1 274 142" fill="none" stroke={redColor} strokeWidth="14" strokeLinecap="round" />
            <path d="M 202 134 A 36 36 0 1 1 260 134" fill="none" stroke={redColor} strokeWidth="11" strokeLinecap="round" />
            <path d="M 215 126 A 21 21 0 1 1 247 126" fill="none" stroke={redColor} strokeWidth="8" strokeLinecap="round" />
            <circle cx="231" cy="98" r="9" fill={redColor} />
            <path d="M 227 98 L 198 180 L 218 180 L 228 140 L 234 140 L 244 180 L 264 180 L 235 98 Z" fill={redColor} />
            <path d="M 210 180 C 220 160 242 160 252 180 Z" fill={theme === 'dark' ? '#142b58' : '#ffffff'} />
            <line x1="223" y1="122" x2="239" y2="136" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <line x1="239" y1="122" x2="223" y2="136" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <line x1="218" y1="142" x2="244" y2="166" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="244" y1="142" x2="218" y2="166" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
          </g>
          <text x="278" y="180" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontSize="155" fontWeight="900" fill={navyColor} letterSpacing="-1.5">
            rectlines
          </text>
          <text x="500" y="230" textAnchor="middle" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontSize="38" fontWeight="800" fill={redColor} letterSpacing="2">
            Technologies &amp; Telecoms Ltd
          </text>
          {showTagline ? (
            <text x="500" y="268" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="28" fontWeight="700" fill={taglineColor} letterSpacing="1">
              ...Live Smart, Connect More
            </text>
          ) : null}
        </svg>
      </div>
    </div>
  );
};

export default OfficialLogo;
