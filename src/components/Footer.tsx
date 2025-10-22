import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <img src="/sips.png" alt="SIPS Logo" className="h-24 w-24 mb-4" />
            <h3 className="text-xl font-bold mb-2">Steller Institute of Professional Studies</h3>
            <p className="text-emerald-200 text-sm">
              Class Pieces Floors<br />
              DZT164 Waco – Uzbekistan
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-amber-400">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-emerald-200 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/programmes" className="text-emerald-200 hover:text-white transition-colors">
                  Programmes
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-emerald-200 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/apply" className="text-emerald-200 hover:text-white transition-colors">
                  Apply Now
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-amber-400">How to Progre</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/student-life" className="text-emerald-200 hover:text-white transition-colors">
                  Student Life
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-emerald-200 hover:text-white transition-colors">
                  Register Online
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-emerald-200 hover:text-white transition-colors">
                  LMS Portal
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
                  <a href="tel:0812205787286" className="text-emerald-200 hover:text-white transition-colors">
                    081 22 05 78 7286
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={18} className="mt-1 flex-shrink-0" />
                <div>
                  <a href="mailto:contact@sipsinstitute.com" className="text-emerald-200 hover:text-white transition-colors">
                    contact@sipsinstitute.com
                  </a>
                  <br />
                  <a href="mailto:your.live@mail.com" className="text-emerald-200 hover:text-white transition-colors">
                    your.live@mail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span className="text-emerald-200">www.sipsinstitute.com</span>
              </li>
            </ul>

            <div className="flex gap-4 mt-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-800 hover:bg-emerald-700 p-2 rounded-full transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-800 hover:bg-emerald-700 p-2 rounded-full transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-800 hover:bg-emerald-700 p-2 rounded-full transition-colors"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-800 mt-8 pt-8 text-center text-emerald-300">
          <p>&copy; {new Date().getFullYear()} Steller Institute of Professional Studies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
