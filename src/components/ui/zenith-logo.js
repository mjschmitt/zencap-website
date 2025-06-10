// src/components/ui/ZenithLogo.js
export default function ZenithLogo({ 
  className = "",
  showTagline = true 
}) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Mountain/Triangle Logo */}
      <div className="flex-shrink-0 mr-3">
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 100 100" 
          className="w-10 h-10"
        >
          {/* Outer Triangle - Navy */}
          <path
            d="M50 15 L85 75 L15 75 Z"
            fill="#1a3a5f"
            className="fill-navy-700"
          />
          
          {/* Inner Triangle - Teal */}
          <path
            d="M50 25 L70 65 L30 65 Z"
            fill="#046B4E"
            className="fill-teal-500"
          />
          
          {/* Center Triangle - Light Teal */}
          <path
            d="M50 35 L60 55 L40 55 Z"
            fill="#7FB9A2"
            className="fill-teal-300"
          />
        </svg>
      </div>
      
      {/* Text */}
      <div className="flex flex-col">
        <div className="text-navy-700 dark:text-white font-bold text-xl md:text-2xl font-serif tracking-tight">
          ZENITH
        </div>
        {showTagline && (
          <div className="text-teal-500 dark:text-teal-400 font-medium text-sm md:text-base tracking-wider -mt-1">
            CAPITAL ADVISORS
          </div>
        )}
      </div>
    </div>
  );
}