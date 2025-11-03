import { Link } from 'react-router-dom';
import { Award, Users, BookOpen, GraduationCap, Target, Heart, Lightbulb } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen">
      <section
        className="relative h-[600px] flex items-center justify-center text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center max-w-4xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="font-baskerville">SIPS</span> PROGRAMMES ARE DESIGNED FOR<br />NEXT-GENERATION LEADERS
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Learn Today. Lead Tomorrow
          </p>
          <Link
            to="/programmes"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
          >
            Explore Programmes
          </Link>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About <span className="font-baskerville">SIPS</span></h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-emerald-50 p-8 rounded-lg">
              <Target className="text-emerald-700 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To empower students with transformative education that integrates innovation, sustainability, and skill-based learning, fostering intellectual growth and global readiness. We are committed to delivering quality learning experiences, nurturing future leaders, and contributing to the sustainable development of Sri Lanka and beyond.
              </p>
            </div>

            <div className="bg-emerald-50 p-8 rounded-lg">
              <Lightbulb className="text-emerald-700 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To be the most trusted center of excellence for Next-Generation Education in Sri Lanka.
              </p>
            </div>

            <div className="bg-emerald-50 p-8 rounded-lg">
              <Heart className="text-emerald-700 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Core Values</h3>
              <ul className="text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span>Empowerment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span>Entrepreneurial</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span>Excellence</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="bg-gray-50 p-6 rounded-lg">
              <Award className="text-amber-500 mx-auto mb-3" size={40} />
              <h4 className="font-bold text-gray-900 mb-2">Transformative Education</h4>
              <p className="text-gray-600 text-sm">Skill-based & Student-Centric teaching style</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <GraduationCap className="text-amber-500 mx-auto mb-3" size={40} />
              <h4 className="font-bold text-gray-900 mb-2">Flexible Learning</h4>
              <p className="text-gray-600 text-sm">Blended model</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <BookOpen className="text-amber-500 mx-auto mb-3" size={40} />
              <h4 className="font-bold text-gray-900 mb-2">Industry Experts</h4>
              <p className="text-gray-600 text-sm">Learn from the best in the industry</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Users className="text-amber-500 mx-auto mb-3" size={40} />
              <h4 className="font-bold text-gray-900 mb-2">Life Long Learning</h4>
              <p className="text-gray-600 text-sm">Learning never stops. Education for Students, Professionals and Career transitioners</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Academic Quality</h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Our commitment to excellence is reflected in our accreditations, experienced faculty, and industry partnerships.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Award className="text-emerald-700 mb-4" size={40} />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accreditations</h3>
              <p className="text-gray-700">
                Internationally recognized programs accredited by leading educational bodies, ensuring the highest standards of education.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Users className="text-emerald-700 mb-4" size={40} />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Faculty</h3>
              <p className="text-gray-700">
                Learn from industry professionals and experienced academics who bring real-world insights to the classroom.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <BookOpen className="text-emerald-700 mb-4" size={40} />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Partners</h3>
              <p className="text-gray-700">
                Strong partnerships with leading corporations and institutions worldwide, providing students with excellent opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-emerald-200">
            Be the first to unlock the power of Next-Gen Education with <span className="font-baskerville">SIPS</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
            >
              Register Online
            </Link>
            <Link
              to="/programmes"
              className="inline-block bg-white hover:bg-gray-100 text-emerald-900 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
            >
              View Programmes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
