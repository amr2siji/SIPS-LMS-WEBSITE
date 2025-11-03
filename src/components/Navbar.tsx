import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/sips.png" alt="SIPS Logo" className="h-14 w-12 object-contain" />
            <div className="flex flex-col">
              <span className="text-xl font-bold font-baskerville">SIPS</span>
              <span className="text-xs text-emerald-100">Steller Institute of Professional Studies</span>
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
              Blog
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
              Blog
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
