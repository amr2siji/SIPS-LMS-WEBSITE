import { useState } from 'react';

export function FloatingWhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const whatsappNumber = '94741122300'; // Format: country code + number without +

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hello! I would like to inquire about your programs at SIPS.');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-24 right-8 z-50">
        <button
          onClick={handleWhatsAppClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 flex items-center gap-3 overflow-hidden px-6 py-4"
        >
          {/* Animated Ring */}
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-30"></div>
          </div>

          {/* WhatsApp Icon */}
          <div className="relative z-10">
            <svg
              className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          </div>

          {/* Text */}
          <span className="relative z-10 font-semibold text-base whitespace-nowrap">
            Chat with us
          </span>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
        </button>

        {/* Floating particles effect */}
        {isHovered && (
          <>
            <div className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0ms' }}></div>
            <div className="absolute top-2 right-4 w-1.5 h-1.5 bg-green-300 rounded-full animate-bounce opacity-40" style={{ animationDelay: '150ms' }}></div>
            <div className="absolute top-4 right-2 w-1 h-1 bg-green-500 rounded-full animate-bounce opacity-50" style={{ animationDelay: '300ms' }}></div>
          </>
        )}

        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap">
            Chat with us
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    </>
  );
}