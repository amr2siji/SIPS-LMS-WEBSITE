import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-800 via-emerald-700 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <img src="/sips.png" alt="SIPS Logo" className="h-20 w-[70px] object-contain mb-3" />
            <p className="text-base font-semibold text-white mb-2">
              Steller Institute of Professional Studies
            </p>
            <p className="text-sm text-gray-300">
              Class Pieces Floors<br />
              DZT164 Waco – Uzbekistan
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-amber-400">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-emerald-100 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/programmes" className="text-emerald-100 hover:text-white transition-colors">
                  Programmes
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-emerald-100 hover:text-white transition-colors">
                  Meet our Team
                </Link>
              </li>
              <li>
                <Link to="/apply" className="text-emerald-100 hover:text-white transition-colors">
                  Apply Now
                </Link>
              </li>
              <li>
                <Link to="/student-life" className="text-emerald-100 hover:text-white transition-colors">
                  Student Life
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-emerald-100 hover:text-white transition-colors">
                  Register Online
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-emerald-100 hover:text-white transition-colors">
                  LMS Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-amber-400">Get Started</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/programmes" className="text-emerald-100 hover:text-white transition-colors">
                  View Programmes
                </Link>
              </li>
              <li>
                <Link to="/apply" className="text-emerald-100 hover:text-white transition-colors">
                  How to Apply
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-emerald-100 hover:text-white transition-colors">
                  Registration Process
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-amber-400">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone size={18} className="mt-1 flex-shrink-0" />
                <div>
                  <a href="tel:0812205787286" className="text-emerald-100 hover:text-white transition-colors">
                    081 22 05 78 7286
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={18} className="mt-1 flex-shrink-0" />
                <div>
                  <a href="mailto:contact@sipsinstitute.com" className="text-emerald-100 hover:text-white transition-colors">
                    stellerinstitute@gmail.com
                  </a>
                  <br />
                  {/* <a href="mailto:your.live@mail.com" className="text-emerald-100 hover:text-white transition-colors">
                    your.live@mail.com
                  </a> */}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span className="text-emerald-100">www.sips.edu.lk</span>
              </li>
            </ul>

            <div className="flex gap-4 mt-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-full transition-all border border-white/20"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-full transition-all border border-white/20"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-full transition-all border border-white/20"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-600 mt-8 pt-8 text-center text-emerald-100">
          <p>&copy; {new Date().getFullYear()} Steller Institute of Professional Studies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
