import React from 'react';

interface MKLogoProps {
  className?: string;
  size?: number;
  variant?: 'watermark' | 'icon' | 'badge';
}

export const MKLogo: React.FC<MKLogoProps> = ({
  className = '',
  size = 48,
  variant = 'icon'
}) => {
  if (variant === 'watermark') {
    return (
      <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-neutral-300 dark:text-neutral-700/50 transition-colors"
        >
          {/* Outer orbital ellipse with dynamic slant similar to Grok motif */}
          <path
            d="M 50 10 C 75 10 92 28 88 52 C 84 76 64 92 42 90 C 20 88 8 70 12 46 C 16 22 34 10 50 10 Z"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            className="opacity-70"
          />
          {/* Sharp dynamic diagonal cut resembling MK monogram */}
          <path
            d="M 28 72 L 40 28 L 52 50 L 64 28 L 76 72"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          />
          {/* Subtle horizontal bridge / slash */}
          <path
            d="M 18 50 L 82 50"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="opacity-40"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="mkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#a3a3a3" />
          </linearGradient>
          <linearGradient id="mkDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#171717" />
            <stop offset="100%" stopColor="#404040" />
          </linearGradient>
        </defs>

        <rect
          width="100"
          height="100"
          rx="26"
          className="fill-neutral-900 dark:fill-white text-white dark:text-neutral-900 transition-colors"
        />

        {/* Monogram MK stylized */}
        <path
          d="M 28 70 L 28 30 L 40 48 L 52 30 L 52 70"
          className="stroke-white dark:stroke-black"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 62 30 L 62 70"
          className="stroke-white dark:stroke-black"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 76 33 L 64 48 L 77 67"
          className="stroke-white dark:stroke-black"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
