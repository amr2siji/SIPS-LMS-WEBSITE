import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 text-white shadow-lg sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-0' : 'py-2'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${
          isScrolled ? 'h-20' : 'h-28'
        }`}>
          <Link to="/" className="flex items-center space-x-5">
            <img 
              src="/sips.png" 
              alt="SIPS Logo" 
              className={`object-contain transition-all duration-300 ${
                isScrolled ? 'h-16 w-auto' : 'h-28 w-auto'
              }`} 
            />
            <div className="flex flex-col">
              <span className={` font-baskerville transition-all duration-300 ${
                isScrolled ? 'text-xl' : 'text-3xl'
              }`}>
                SIPS
              </span>
              <span className={`text-emerald-100 font-baskerville transition-all duration-300 ${
                isScrolled ? 'text-xs' : 'text-base'
              }`}>
                Steller Institute of Professional Studies
              </span>
            </div>
          </Link>

          <button
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className={`hover:text-amber-400 transition-colors ${
                isActive('/') ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/programmes"
              className={`hover:text-amber-400 transition-colors ${
                isActive('/programmes') ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              Programmes
            </Link>
            <Link
              to="/blog"
              className={`hover:text-amber-400 transition-colors ${
                isActive('/blog') ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              News & Events
            </Link>
            <Link
              to="/about"
              className={`hover:text-amber-400 transition-colors ${
                isActive('/about') ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              Meet our Team
            </Link>
            <Link
              to="/register"
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-md font-semibold transition-colors"
            >
              Register Online
            </Link>
            <Link
              to="/login"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-md font-semibold transition-all border border-white/20"
            >
              LMS Portal
            </Link>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden pb-4 space-y-3">
            <Link
              to="/"
              className={`block hover:text-amber-400 transition-colors ${
                isActive('/') ? 'text-amber-400 font-semibold' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/programmes"
              className={`block hover:text-amber-400 transition-colors ${
                isActive('/programmes') ? 'text-amber-400 font-semibold' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Programmes
            </Link>
            <Link
              to="/blog"
              className={`block hover:text-amber-400 transition-colors ${
                isActive('/blog') ? 'text-amber-400 font-semibold' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              News & Events
            </Link>
            <Link
              to="/about"
              className={`block hover:text-amber-400 transition-colors ${
                isActive('/about') ? 'text-amber-400 font-semibold' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Meet our Team
            </Link>
            <Link
              to="/register"
              className="block bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-md font-semibold transition-colors text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Register Online
            </Link>
            <Link
              to="/login"
              className="block bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-md font-semibold transition-all border border-white/20 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              LMS Portal
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
