import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FloatingInquireButton() {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/apply');
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Floating Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 flex items-center gap-3 overflow-hidden px-6 py-4"
      >
        {/* Animated Ring */}
        <div className="absolute inset-0 rounded-full">
          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></div>
          <div className="absolute inset-0 rounded-full bg-red-600 animate-pulse opacity-30"></div>
        </div>

        {/* Icon */}
        <div className="relative z-10">
          <MessageCircle 
            size={24} 
            className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
          />
        </div>

        {/* Text that is always visible */}
        <span className="relative z-10 font-semibold text-base whitespace-nowrap">
          Contact Us
        </span>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
      </button>

      {/* Floating particles effect */}
      {isHovered && (
        <>
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0ms' }}></div>
          <div className="absolute top-2 right-4 w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce opacity-40" style={{ animationDelay: '150ms' }}></div>
          <div className="absolute top-4 right-2 w-1 h-1 bg-red-600 rounded-full animate-bounce opacity-50" style={{ animationDelay: '300ms' }}></div>
        </>
      )}
    </div>
  );
}
