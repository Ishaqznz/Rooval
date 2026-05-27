import React from 'react';

export default function HeroSection() {
  return (
    <section className="bg-stone-100 py-16 md:py-24 pl-12 md:pl-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-6xl md:text-7xl font-bold text-orange-600">
              Rooval
            </h1>
            
            <p className="text-2xl md:text-3xl text-gray-900 font-normal">
              Complete Online Doctor Ecosystem
            </p>
            
            <button className="bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold px-8 py-4 rounded-lg transition-colors">
              Start with Rooval
            </button>
          </div>

          {/* Right Content - Image with Stats */}
          <div className="relative">
            {/* Background Pattern SVG */}
            <div className="absolute inset-0 -z-10">
              <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="orange-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect width="20" height="20" fill="#ea580c" opacity="0.1"/>
                    <rect width="19" height="19" fill="#ea580c" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="400" height="400" fill="url(#orange-grid)"/>
              </svg>
            </div>

            {/* Main Image Placeholder */}
            <div className="relative bg-gray-300 rounded-lg overflow-hidden aspect-[4/3]">
              <svg className="w-full h-full" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                <rect width="800" height="600" fill="#9ca3af"/>
                <g transform="translate(400, 300)">
                  {/* People silhouettes */}
                  <ellipse cx="-150" cy="100" rx="40" ry="60" fill="#6b7280"/>
                  <circle cx="-150" cy="40" r="30" fill="#6b7280"/>
                  
                  <ellipse cx="-50" cy="100" rx="40" ry="60" fill="#4b5563"/>
                  <circle cx="-50" cy="40" r="30" fill="#4b5563"/>
                  
                  <ellipse cx="50" cy="100" rx="40" ry="60" fill="#6b7280"/>
                  <circle cx="50" cy="40" r="30" fill="#6b7280"/>
                  
                  <ellipse cx="150" cy="100" rx="40" ry="60" fill="#4b5563"/>
                  <circle cx="150" cy="40" r="30" fill="#4b5563"/>
                  
                  {/* Chairs */}
                  <rect x="-180" y="130" width="60" height="10" fill="#374151" rx="2"/>
                  <rect x="-80" y="130" width="60" height="10" fill="#374151" rx="2"/>
                  <rect x="20" y="130" width="60" height="10" fill="#374151" rx="2"/>
                  <rect x="120" y="130" width="60" height="10" fill="#374151" rx="2"/>
                </g>
              </svg>
            </div>

            {/* Stats Cards */}
            <div className="absolute top-6 right-6 bg-stone-50 rounded-xl shadow-lg p-6 max-w-xs">
              <div className="text-5xl font-bold text-orange-600 mb-2">
                5,000
              </div>
              <div className="text-gray-700 text-sm">
                funded startups
              </div>
            </div>

            <div className="absolute bottom-6 left-6 bg-stone-50 rounded-xl shadow-lg p-6 max-w-xs">
              <div className="text-5xl font-bold text-orange-600 mb-2">
                $800B
              </div>
              <div className="text-gray-700 text-sm">
                combined valuation
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}