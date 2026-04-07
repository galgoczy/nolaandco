'use client';

import { useEffect, useState } from 'react';

export default function AnimatedCheck() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-20 h-20 mx-auto mb-6">
      <svg
        viewBox="0 0 80 80"
        className={`w-full h-full transition-all duration-700 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
      >
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="#C4A591"
          strokeWidth="3"
          className={`transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}
          style={{
            strokeDasharray: 226,
            strokeDashoffset: show ? 0 : 226,
            transition: 'stroke-dashoffset 0.6s ease-out 0.1s, opacity 0.3s',
          }}
        />
        <path
          d="M24 42 L35 53 L56 28"
          fill="none"
          stroke="#4A4A4A"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 60,
            strokeDashoffset: show ? 0 : 60,
            transition: 'stroke-dashoffset 0.4s ease-out 0.5s',
          }}
        />
      </svg>
    </div>
  );
}
