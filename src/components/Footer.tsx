import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-800 via-emerald-700 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <img src="/sips.png" alt="SIPS Logo" className="h-20 w-[70px] object-contain mb-3" />
            <p className="text-base  text-white mb-2 font-baskerville">
              Steller Institute of Professional Studies
            </p>
            <p className="text-sm text-gray-300">
              No. 343, Wackwella Road,<br />
              Galle.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-amber-400">Quick Links</h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <div className="space-y-2">
                <div>
                  <Link to="/" className="text-emerald-100 hover:text-white transition-colors">
                    Home
                  </Link>
                </div>
                <div>
                  <Link to="/programmes" className="text-emerald-100 hover:text-white transition-colors">
                    Programmes
                  </Link>
                </div>
                <div>
                  <Link to="/blog" className="text-emerald-100 hover:text-white transition-colors">
                    News & Events
                  </Link>
                </div>
                <div>
                  <Link to="/about" className="text-emerald-100 hover:text-white transition-colors">
                    Meet our Team
                  </Link>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <Link to="/apply" className="text-emerald-100 hover:text-white transition-colors">
                    Apply Now
                  </Link>
                </div>
                <div>
                  <Link to="/register" className="text-emerald-100 hover:text-white transition-colors">
                    Register Online
                  </Link>
                </div>
                <div>
                  <Link to="/login" className="text-emerald-100 hover:text-white transition-colors">
                    LMS Portal
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-amber-400">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone size={18} className="mt-1 flex-shrink-0" />
                <div>
                  <a href="tel:0741122300" className="text-emerald-100 hover:text-white transition-colors">
                    074 112 2300
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
                href="https://www.linkedin.com/company/steller-institute-of-professional-studies-sips"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-full transition-all border border-white/20"
              >
                {/* LinkedIn Icon */}
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61585139585499"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-full transition-all border border-white/20"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/study_with_sips/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-full transition-all border border-white/20"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@study.with.sips?_r=1&_t=ZS-92hliOj98SY"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2 rounded-full transition-all border border-white/20"
              >
                {/* TikTok Icon */}
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5.16 20.5 6.33 6.33 0 0 0 14.86 16v-5.21a8.24 8.24 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-0.04-2.22Z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-600 mt-8 pt-8 text-center text-emerald-100">
          <p className="font-baskerville mb-2">&copy; {new Date().getFullYear()} Steller Institute of Professional Studies. All rights reserved.</p>
          <p className="text-sm">
            Developed by{' '}
            <a
              href="https://trinexatechnology.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors underline"
            >
              Trinexa Technology
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
