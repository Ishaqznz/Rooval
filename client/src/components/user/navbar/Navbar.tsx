import React from 'react';

export default function Navbar() {
  return (
    <nav className="bg-stone-200 border-b border-stone-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="bg-orange-600 w-11 h-11 flex items-center justify-center">
              <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <rect width="256" height="256" fill="#ffe"/>

                
                <rect x="75" y="60" width="30" height="140" fill="#832b00"/>
                
                <path d="M 105 60 L 130 60 Q 145 60 152.5 67.5 Q 160 75 160 90 Q 160 105 152.5 112.5 Q 145 120 130 120 L 105 120 L 105 105 L 125 105 Q 135 105 140 100 Q 145 95 145 87 Q 145 79 140 74 Q 135 69 125 69 L 105 69 Z" fill="#832b00"/>
                
                <polygon points="105,115 130,115 180,200 145,200" fill="#832b00"/>
                </svg> 
              <svg/>
                <text
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="bold"
                  fontFamily="Arial, sans-serif"
                >
                  Y
                </text>
              </svg>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#about"
              className="text-stone-700 hover:text-stone-900 text-base font-normal"
            >
              Home
            </a>
            <a
              href="#companies"
              className="text-stone-700 hover:text-stone-900 text-base font-normal"
            >
              Feautures
            </a>
            <a
              href="#startup-jobs"
              className="text-stone-700 hover:text-stone-900 text-base font-normal"
            >
              Doctors
            </a>
            <a
              href="#find-co-founder"
              className="text-stone-700 hover:text-stone-900 text-base font-normal"
            >
              Communities
            </a>
            <a
              href="#library"
              className="text-stone-700 hover:text-stone-900 text-base font-normal"
            >
              About Us
            </a>
          </div>

          {/* Apply Button */}
          <div className="flex items-center space-x-4">
            <span className="text-stone-700 text-base hidden lg:inline">
               <span className="font-semibold">Login</span> 
            </span>
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2 rounded transition-colors">
              Apply
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}